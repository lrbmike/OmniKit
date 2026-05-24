import { NextRequest, NextResponse } from 'next/server';
import {
  extractClientApiKey,
  getProxyGatewayConfig,
  getProxyServiceByCode,
  isClientAuthorized,
  markUpstreamKeyFailure,
  markUpstreamKeySuccess,
  writeProxyRequestLog,
} from '@/lib/proxy-service';
import { getProxyProvider } from '@/lib/proxy/providers';

const ALLOWED_PATH_SEGMENT = /^[a-z0-9-]+$/i;

async function handleProxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ serviceCode: string; path: string[] }> },
) {
  const { serviceCode, path } = await params;
  const requestStartedAt = Date.now();
  const proxyPath = path?.join('/') || '';

  if (!path?.length || path.some((segment) => !ALLOWED_PATH_SEGMENT.test(segment))) {
    return NextResponse.json({ error: 'Invalid proxy path' }, { status: 400 });
  }

  const provider = getProxyProvider(serviceCode);
  if (!provider) {
    return NextResponse.json({ error: 'Proxy service not found' }, { status: 404 });
  }

  if (!provider.isPathAllowed(path)) {
    return NextResponse.json({ error: 'Proxy path is not allowed for this provider' }, { status: 400 });
  }

  const service = await getProxyServiceByCode(serviceCode);
  if (!service || service.providerType !== provider.code) {
    return NextResponse.json({ error: 'Proxy service not found' }, { status: 404 });
  }

  if (!service.isActive) {
    writeProxyRequestLog({
      serviceCode,
      method: request.method,
      path: proxyPath,
      statusCode: 503,
      durationMs: Date.now() - requestStartedAt,
      outcome: 'service_error',
      errorMessage: 'Proxy service is disabled',
    });
    return NextResponse.json({ error: 'Proxy service is disabled' }, { status: 503 });
  }

  const gatewayConfig = await getProxyGatewayConfig();

  if (!gatewayConfig?.proxyGatewayApiKeyHash) {
    writeProxyRequestLog({
      serviceCode,
      method: request.method,
      path: proxyPath,
      statusCode: 503,
      durationMs: Date.now() - requestStartedAt,
      outcome: 'service_error',
      errorMessage: 'Proxy gateway API key is not configured',
    });
    return NextResponse.json({ error: 'Proxy gateway API key is not configured' }, { status: 503 });
  }

  const clientApiKey = extractClientApiKey(request.headers);
  if (!isClientAuthorized(gatewayConfig, clientApiKey)) {
    writeProxyRequestLog({
      serviceCode,
      method: request.method,
      path: proxyPath,
      statusCode: 401,
      durationMs: Date.now() - requestStartedAt,
      outcome: 'auth_error',
      errorMessage: 'Unauthorized',
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const candidates = service.upstreamKeys
    .filter((key) => key.isActive && (!key.cooldownUntil || key.cooldownUntil.getTime() <= now))
    .sort((a, b) => {
      const left = a.lastUsedAt?.getTime() ?? 0;
      const right = b.lastUsedAt?.getTime() ?? 0;
      if (left !== right) {
        return left - right;
      }

      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  if (candidates.length === 0) {
    writeProxyRequestLog({
      serviceCode,
      method: request.method,
      path: proxyPath,
      statusCode: 503,
      durationMs: Date.now() - requestStartedAt,
      outcome: 'service_error',
      errorMessage: 'No available upstream API keys',
    });
    return NextResponse.json({ error: 'No available upstream API keys' }, { status: 503 });
  }

  const retryLimit = Math.min(Math.max(service.retryCount, 0), candidates.length - 1);
  const maxAttempts = 1 + retryLimit;
  const requestBody = request.method === 'GET' || request.method === 'HEAD'
    ? null
    : await request.arrayBuffer();
  const upstreamUrl = provider.buildUpstreamUrl({
    request,
    upstreamPath: path,
    baseUrl: service.baseUrl,
    upstreamApiKey: '',
  });

  let lastError: { status: number; body: string } | null = null;

  for (const key of candidates.slice(0, maxAttempts)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), service.timeoutMs);

    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: request.method,
        headers: provider.buildUpstreamHeaders({
          request,
          upstreamPath: path,
          baseUrl: service.baseUrl,
          upstreamApiKey: key.apiKey,
        }),
        body: requestBody ? requestBody.slice(0) : undefined,
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);

      if (upstreamResponse.ok) {
        await markUpstreamKeySuccess(key.id);
        writeProxyRequestLog({
          serviceCode,
          upstreamKeyName: key.name,
          method: request.method,
          path: proxyPath,
          statusCode: upstreamResponse.status,
          durationMs: Date.now() - requestStartedAt,
          outcome: 'success',
        });
        return buildProxyResponse(upstreamResponse);
      }

      const errorBody = await upstreamResponse.text();
      lastError = { status: upstreamResponse.status, body: errorBody };
      await markUpstreamKeyFailure(key.id, upstreamResponse.status, summarizeError(errorBody));
      writeProxyRequestLog({
        serviceCode,
        upstreamKeyName: key.name,
        method: request.method,
        path: proxyPath,
        statusCode: upstreamResponse.status,
        durationMs: Date.now() - requestStartedAt,
        outcome: upstreamResponse.status >= 400 && upstreamResponse.status < 500 ? 'client_error' : 'upstream_error',
        errorMessage: summarizeError(errorBody),
      });
    } catch (error) {
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : 'Upstream request failed';
      lastError = { status: 502, body: message };
      await markUpstreamKeyFailure(key.id, 502, message);
      writeProxyRequestLog({
        serviceCode,
        upstreamKeyName: key.name,
        method: request.method,
        path: proxyPath,
        statusCode: 502,
        durationMs: Date.now() - requestStartedAt,
        outcome: message.toLowerCase().includes('abort') ? 'timeout' : 'upstream_error',
        errorMessage: message,
      });
    }
  }

  return NextResponse.json(
    { error: 'Upstream request failed', details: lastError?.body || null },
    { status: lastError?.status || 502 },
  );
}

async function buildProxyResponse(response: Response) {
  const body = await response.arrayBuffer();
  const headers = new Headers();
  const contentType = response.headers.get('content-type');

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  headers.set('Cache-Control', 'no-store');

  return new NextResponse(body, {
    status: response.status,
    headers,
  });
}

function summarizeError(body: string) {
  return body.trim().slice(0, 500) || 'Upstream request failed';
}

export async function GET(request: NextRequest, context: { params: Promise<{ serviceCode: string; path: string[] }> }) {
  return handleProxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ serviceCode: string; path: string[] }> }) {
  return handleProxyRequest(request, context);
}

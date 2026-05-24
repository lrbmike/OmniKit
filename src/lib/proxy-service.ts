import { db } from '@/lib/db';
import { verifyProxyApiKey } from '@/lib/proxy-credentials';
import { getProxyProvider } from '@/lib/proxy/providers';

const RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
const ERROR_COOLDOWN_MS = 15 * 1000;

const proxyServiceInclude = {
  upstreamKeys: {
    orderBy: [
      { order: 'asc' as const },
      { createdAt: 'asc' as const },
    ],
  },
};

type ProxyGatewayConfigRecord = {
  proxyGatewayApiKeyHash: string | null;
  proxyGatewayApiKeyHint: string | null;
};

export async function ensureProxyService(code: string) {
  const provider = getProxyProvider(code);
  if (!provider) {
    return null;
  }

  let service = await db.proxyService.findUnique({
    where: { code },
    include: proxyServiceInclude,
  });

  if (!service) {
    service = await db.proxyService.create({
      data: {
        code: provider.code,
        name: provider.name,
        providerType: provider.code,
        baseUrl: provider.defaultBaseUrl,
        timeoutMs: provider.defaultTimeoutMs,
        retryCount: provider.defaultRetryCount,
        isActive: true,
      },
      include: proxyServiceInclude,
    });
  }

  return service;
}

export async function getProxyServiceByCode(code: string) {
  const provider = getProxyProvider(code);
  if (provider) {
    return ensureProxyService(code);
  }

  return db.proxyService.findUnique({
    where: { code },
    include: proxyServiceInclude,
  });
}

export async function getProxyGatewayConfig() {
  return db.systemConfig.findFirst({
    select: {
      proxyGatewayApiKeyHash: true,
      proxyGatewayApiKeyHint: true,
    },
  }) as Promise<ProxyGatewayConfigRecord | null>;
}

export async function getAvailableUpstreamKey(serviceId: string) {
  const now = new Date();

  return db.proxyUpstreamKey.findFirst({
    where: {
      proxyServiceId: serviceId,
      isActive: true,
      OR: [
        { cooldownUntil: null },
        { cooldownUntil: { lte: now } },
      ],
    },
    orderBy: [
      { lastUsedAt: 'asc' },
      { order: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}

export async function markUpstreamKeySuccess(id: string) {
  await db.proxyUpstreamKey.update({
    where: { id },
    data: {
      lastUsedAt: new Date(),
      failCount: 0,
      cooldownUntil: null,
      lastError: null,
    },
  });
}

export async function markUpstreamKeyFailure(id: string, status: number | null, message: string) {
  const now = new Date();
  const cooldownUntil = status === 429
    ? new Date(now.getTime() + RATE_LIMIT_COOLDOWN_MS)
    : status && status >= 500
      ? new Date(now.getTime() + ERROR_COOLDOWN_MS)
      : null;

  await db.proxyUpstreamKey.update({
    where: { id },
    data: {
      failCount: { increment: 1 },
      cooldownUntil,
      lastError: message.slice(0, 500),
    },
  });
}

export function writeProxyRequestLog(input: {
  serviceCode: string;
  upstreamKeyName?: string | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  outcome: string;
  errorMessage?: string | null;
}) {
  const payload = {
    service: input.serviceCode,
    method: input.method,
    path: input.path,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
    outcome: input.outcome,
    upstreamKey: input.upstreamKeyName || undefined,
    error: input.errorMessage?.slice(0, 500) || undefined,
  };

  if (input.statusCode >= 400 || input.outcome !== 'success') {
    console.warn('[Proxy]', payload);
    return;
  }

  console.info('[Proxy]', payload);
}

export function extractClientApiKey(headers: Headers) {
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return headers.get('x-omnikit-proxy-key')?.trim() || '';
}

export function isClientAuthorized(config: ProxyGatewayConfigRecord | null, clientApiKey: string) {
  return verifyProxyApiKey(clientApiKey, config?.proxyGatewayApiKeyHash);
}

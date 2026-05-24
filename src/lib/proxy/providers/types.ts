import { NextRequest } from 'next/server';

export interface ProxyProviderContext {
  request: NextRequest;
  upstreamPath: string[];
  baseUrl: string;
  upstreamApiKey: string;
}

export interface ProxyProvider {
  code: string;
  name: string;
  defaultBaseUrl: string;
  defaultTimeoutMs: number;
  defaultRetryCount: number;
  isPathAllowed(path: string[]): boolean;
  buildUpstreamUrl(context: ProxyProviderContext): URL;
  buildUpstreamHeaders(context: ProxyProviderContext): Headers;
}

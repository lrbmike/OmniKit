import { braveSearchProvider } from '@/lib/proxy/providers/brave-search';
import type { ProxyProvider } from '@/lib/proxy/providers/types';

const proxyProviders = [braveSearchProvider] as const;

const providerMap = new Map<string, ProxyProvider>(
  proxyProviders.map((provider) => [provider.code, provider]),
);

export function getProxyProvider(code: string) {
  return providerMap.get(code) || null;
}

export function listProxyProviders() {
  return [...proxyProviders];
}

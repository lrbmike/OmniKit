import type { ProxyProvider, ProxyProviderContext } from '@/lib/proxy/providers/types';

const BRAVE_ALLOWED_PATHS = new Set([
  'web/search',
  'news/search',
  'images/search',
  'videos/search',
  'local/search',
  'suggest/search',
  'spellcheck/search',
]);

function buildJoinedPath(path: string[]) {
  return path.join('/');
}

export const braveSearchProvider: ProxyProvider = {
  code: 'brave-search',
  name: 'Brave Search',
  defaultBaseUrl: 'https://api.search.brave.com/res/v1',
  defaultTimeoutMs: 15000,
  defaultRetryCount: 2,
  isPathAllowed(path) {
    return BRAVE_ALLOWED_PATHS.has(buildJoinedPath(path));
  },
  buildUpstreamUrl({ request, upstreamPath, baseUrl }: ProxyProviderContext) {
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/${buildJoinedPath(upstreamPath)}`);

    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    return url;
  },
  buildUpstreamHeaders({ request, upstreamApiKey }: ProxyProviderContext) {
    const headers = new Headers();
    const accept = request.headers.get('accept');
    const contentType = request.headers.get('content-type');

    headers.set('Accept', accept || 'application/json');
    headers.set('X-Subscription-Token', upstreamApiKey);

    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    return headers;
  },
};

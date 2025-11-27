import 'server-only';
import { cookies, headers } from 'next/headers';

const API_URL = process.env.API_URL;

type FetchOptions = RequestInit & {
  requiresAuth?: boolean;
};

async function getBaseUrl() {
  if (API_URL) return API_URL;
  
  // Fallback to localhost for demo purposes (server-to-server)
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${host}/api`;
}

export async function http<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, ...rest } = options;
  const requestHeaders = new Headers(customHeaders);

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-token')?.value;
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const baseUrl = await getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    headers: requestHeaders,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

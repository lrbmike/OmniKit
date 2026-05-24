import { createHash, timingSafeEqual } from 'node:crypto';

const API_KEY_PREFIX = 'psk_';

export function hashProxyApiKey(apiKey: string) {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function verifyProxyApiKey(apiKey: string, expectedHash: string | null | undefined) {
  if (!apiKey || !expectedHash) {
    return false;
  }

  const actual = Buffer.from(hashProxyApiKey(apiKey), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function maskProxyApiKey(apiKey: string) {
  if (!apiKey) {
    return '';
  }

  if (apiKey.length <= 8) {
    return `${apiKey.slice(0, 2)}****`;
  }

  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
}

export function normalizeProxyApiKey(apiKey: string) {
  return apiKey.trim();
}

export function isProxyApiKeyFormat(apiKey: string) {
  return apiKey.startsWith(API_KEY_PREFIX) && apiKey.length >= 20;
}

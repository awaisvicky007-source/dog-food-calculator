import { createHmac, timingSafeEqual } from 'node:crypto';

type Query = Record<string, string | string[] | undefined>;

/**
 * Shopify App Proxy signature: remove `signature`, sort `key=value` pairs (array values joined by ","),
 * concatenate with NO separator, HMAC-SHA256 (hex) with the app's client secret.
 */
export function computeProxySignature(query: Query, secret: string): string {
  const message = Object.keys(query)
    .filter((k) => k !== 'signature')
    .sort()
    .map((k) => {
      const v = query[k];
      return `${k}=${Array.isArray(v) ? v.join(',') : (v ?? '')}`;
    })
    .join('');
  return createHmac('sha256', secret).update(message).digest('hex');
}

export function verifyProxySignature(query: Query, secret: string): boolean {
  const given = query.signature;
  if (typeof given !== 'string' || given.length === 0) return false;
  const a = Buffer.from(given, 'utf8');
  const b = Buffer.from(computeProxySignature(query, secret), 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

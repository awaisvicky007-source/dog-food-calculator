import { describe, expect, it } from 'vitest';
import { computeProxySignature, verifyProxySignature } from '../src/server/shopify-proxy';

const secret = 'hush';
const q = { shop: 'pawvortex.myshopify.com', path_prefix: '/tools/dog-food-calculator', timestamp: '1700000000', logged_in_customer_id: '' };

describe('App Proxy HMAC (AC-12)', () => {
  it('accepts a correctly signed request', () => {
    expect(verifyProxySignature({ ...q, signature: computeProxySignature(q, secret) }, secret)).toBe(true);
  });
  it('rejects tampered params, wrong secret, missing signature', () => {
    const signature = computeProxySignature(q, secret);
    expect(verifyProxySignature({ ...q, shop: 'evil.myshopify.com', signature }, secret)).toBe(false);
    expect(verifyProxySignature({ ...q, signature }, 'other')).toBe(false);
    expect(verifyProxySignature(q, secret)).toBe(false);
    expect(verifyProxySignature({ ...q, signature: 'abc' }, secret)).toBe(false);
  });
  it('joins array values with commas and sorts keys with no separator', () => {
    const a = computeProxySignature({ b: '2', a: ['1', '3'] }, secret);
    const b = computeProxySignature({ a: '1,3', b: '2' }, secret);
    expect(a).toBe(b);
  });
});

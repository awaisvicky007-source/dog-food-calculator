import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPage } from '../src/server/render.js';
import { verifyProxySignature } from '../src/server/shopify-proxy.js';

/**
 * Shopify App Proxy target: https://<project>.vercel.app/calculator
 * Returns the full HTML shell. All CSS/JS comes from cdn.shopify.com (ASSET_*_URL).
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  // 🔍 DEBUG — remove after 401 is diagnosed
  console.log('[calc] path =', req.url);
  console.log('[calc] query keys =', Object.keys(req.query || {}));
  console.log('[calc] signature present =', typeof (req.query as any)?.signature);
  console.log('[calc] secret length =', process.env.SHOPIFY_API_SECRET?.length ?? 0);
  console.log('[calc] full query =', JSON.stringify(req.query));

  const env = process.env.VERCEL_ENV ?? 'development';
  const isProd = env === 'production';

  const allowUnsigned = process.env.ALLOW_UNSIGNED === '1' && !isProd;
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!allowUnsigned && (!secret || !verifyProxySignature(req.query, secret))) {
    res.status(401).setHeader('Cache-Control', 'no-store').json({ error: 'unauthorized' });
    return;
  }

  const cssUrl = process.env.ASSET_CSS_URL;
  const jsUrl = process.env.ASSET_JS_URL;
  // Fail closed: never ship HTML that points at missing assets (FR-54).
  if (!cssUrl || !jsUrl || !cssUrl.startsWith('https://cdn.shopify.com/') || !jsUrl.startsWith('https://cdn.shopify.com/')) {
    res.status(500).setHeader('Cache-Control', 'no-store').json({ error: 'asset urls not configured' });
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', isProd ? 'index,follow' : 'noindex,nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.shopify.com",
      "style-src 'self' https://cdn.shopify.com",
      "font-src 'self' https://cdn.shopify.com",
      "img-src 'self' https://cdn.shopify.com data:",
      "connect-src 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  );
  res.status(200).send(renderPage({ cssUrl, jsUrl }));
}
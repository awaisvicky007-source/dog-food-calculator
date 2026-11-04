import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderPage } from '../src/server/render.js';
import { computeProxySignature, verifyProxySignature } from '../src/server/shopify-proxy.js';

/**
 * Shopify App Proxy target: https://<project>.vercel.app/calculator
 * Returns the full HTML shell. All CSS/JS comes from cdn.shopify.com (ASSET_*_URL).
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const env = process.env.VERCEL_ENV ?? 'development';
  const isProd = env === 'production';

  // Defensive trim — Vercel env var UI often captures a trailing newline from
  // paste, which silently breaks HMAC-SHA256. Shopify API secrets never contain
  // whitespace, so trimming is always safe.
  const rawSecret = process.env.SHOPIFY_API_SECRET ?? '';
  const secret = rawSecret.trim();

  // 🔍 DEBUG — hit /calculator?__debug=1 to get diagnostics as JSON (no signature required)
  if (req.query.__debug === '1') {
    const q = (req.query ?? {}) as Record<string, unknown>;
    const sig = q.signature;
    const signatureString = typeof sig === 'string' ? sig : null;

    const queryNoDebug = { ...q };
    delete queryNoDebug.__debug;

    let expectedWithoutDebug: string | null = null;
    let expectedWithDebug: string | null = null;
    try {
      expectedWithoutDebug = computeProxySignature(
        queryNoDebug as Record<string, string | string[] | undefined>,
        secret,
      );
      expectedWithDebug = computeProxySignature(
        q as Record<string, string | string[] | undefined>,
        secret,
      );
    } catch { /* ignore */ }

    res.status(200).setHeader('Cache-Control', 'no-store').json({
      url: req.url,
      queryKeys: Object.keys(q).sort(),
      queryFull: q,
      signatureReceived: signatureString,
      signatureType: Array.isArray(sig) ? 'array' : typeof sig,
      signatureLength: signatureString?.length ?? 0,
      expectedWithoutDebug,
      expectedWithDebug,
      matchesWithoutDebug: signatureString !== null && signatureString === expectedWithoutDebug,
      matchesWithDebug: signatureString !== null && signatureString === expectedWithDebug,

      secretPresent: rawSecret.length > 0,
      secretRawLength: rawSecret.length,
      secretTrimmedLength: secret.length,
      secretHadWhitespace: rawSecret !== secret,
      secretFirstCharCode: secret.length > 0 ? secret.charCodeAt(0) : null,
      secretLastCharCode: secret.length > 0 ? secret.charCodeAt(secret.length - 1) : null,

      cssUrlSet: !!process.env.ASSET_CSS_URL,
      jsUrlSet: !!process.env.ASSET_JS_URL,
      cssUrlHost: process.env.ASSET_CSS_URL ? safeHost(process.env.ASSET_CSS_URL) : null,
      jsUrlHost: process.env.ASSET_JS_URL ? safeHost(process.env.ASSET_JS_URL) : null,
      env,
      isProd,
    });
    return;
  }

  const allowUnsigned = process.env.ALLOW_UNSIGNED === '1' && !isProd;

  if (!allowUnsigned) {
    if (!secret) {
      console.error('[calc] SHOPIFY_API_SECRET is empty or missing');
      res.status(401).setHeader('Cache-Control', 'no-store')
        .json({ error: 'unauthorized', reason: 'no_secret' });
      return;
    }

    // Try trimmed first, then raw (in case a legitimate secret contains whitespace,
    // which Shopify should never produce, but we don't want to break anything).
    let verified = verifyProxySignature(req.query, secret);
    if (!verified && rawSecret !== secret) {
      verified = verifyProxySignature(req.query, rawSecret);
    }

    if (!verified) {
      console.warn('[calc] signature verification failed', {
        path: req.url,
        queryKeys: Object.keys(req.query || {}).sort(),
        secretRawLength: rawSecret.length,
        secretTrimmedLength: secret.length,
        secretHadWhitespace: rawSecret !== secret,
      });
      res.status(401).setHeader('Cache-Control', 'no-store')
        .json({ error: 'unauthorized', reason: 'signature_mismatch' });
      return;
    }
  }

  const cssUrl = process.env.ASSET_CSS_URL;
  const jsUrl = process.env.ASSET_JS_URL;
  // Fail closed: never ship HTML that points at missing assets (FR-54).
  if (
    !cssUrl || !jsUrl ||
    !cssUrl.startsWith('https://cdn.shopify.com/') ||
    !jsUrl.startsWith('https://cdn.shopify.com/')
  ) {
    console.error('[calc] asset URLs missing or wrong host', { cssUrl, jsUrl });
    res.status(500).setHeader('Cache-Control', 'no-store')
      .json({ error: 'asset_urls_not_configured' });
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

function safeHost(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}
import { describe, expect, it } from 'vitest';
import { renderPage } from '../src/server/render';
import { readFileSync } from 'node:fs';

/**
 * Static guard for AC-15 (hard requirement). It inspects interactive elements, not prose:
 * the page may SAY "no sign-up", but must never CONTAIN a sign-up, login, or payment control.
 * A browser E2E (Playwright) can be layered on top later.
 */
describe('no login / no payment UI (AC-15)', () => {
  const html = renderPage({ cssUrl: 'https://cdn.shopify.com/a.css', jsUrl: 'https://cdn.shopify.com/a.js' });
  const client = readFileSync('src/client/main.ts', 'utf8') + readFileSync('src/client/catalog.ts', 'utf8');

  const controls = [
    ...[...html.matchAll(/<input\b[^>]*>/gi)].map((m) => m[0]),
    ...[...html.matchAll(/<(button|a)\b[^>]*>[\s\S]*?<\/\1>/gi)].map((m) => m[0]),
  ].join('\n');
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);

  it('has no password / email / card inputs', () => {
    expect(controls).not.toMatch(/type="(password|email|tel)"|autocomplete="(cc-|current-password|new-password|email)/i);
  });
  it('has no sign-up, log-in, account, or payment buttons/links', () => {
    expect(controls).not.toMatch(/sign\s?-?up|log\s?-?in|sign\s?-?in|create (an )?account|checkout|buy now|pay now|subscribe/i);
    hrefs.forEach((h) => expect(h, h).not.toMatch(/\/(account|login|checkout|cart)(\/|$|\?)/i));
  });
  it('has no payment SDKs', () => {
    expect(html).not.toMatch(/stripe|paypal|shop\s?pay|apple\s?pay|google\s?pay/i);
  });
  it('client code never routes to checkout and only uses standard add-to-cart', () => {
    expect(client).not.toMatch(/\/checkout|shop_pay|accelerated|stripe|paypal/i);
    expect(client).toMatch(/\/cart\/add\.js/);
  });
});

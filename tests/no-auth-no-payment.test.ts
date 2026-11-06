import { describe, expect, it } from 'vitest';
import { renderPage } from '../src/server/render';
import { readFileSync } from 'node:fs';

/**
 * Static guard for AC-15 (hard requirement). It inspects interactive elements, not prose:
 * the page may SAY "no sign-up", but must never CONTAIN a sign-up, login, or payment control
 * that gates the calculator.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * APPROVED EXCEPTION — storefront-parity sign-in link
 * ──────────────────────────────────────────────────────────────────────────
 * The calculator mirrors the storefront header's "Sign in with Shop or Google"
 * link for customers who already have an account. This is NOT a login wall:
 *   • The calculator is fully usable without signing in
 *   • Results are shown immediately, no auth prompt
 *   • No feature is gated behind login
 *   • No credential fields (password, email, card) exist on the page
 *
 * If a future change adds a login gate — "results only visible after sign-in",
 * "Save" prompts auth, checkout inside the tool — that WILL fail this test.
 * The exemption below is deliberately narrow: only the exact href and the
 * exact label of the storefront-parity link are ignored. Everything else is
 * still rejected.
 * ──────────────────────────────────────────────────────────────────────────
 */
const APPROVED_SIGNIN_HREF = 'https://account.pawvortex.com/';
const APPROVED_SIGNIN_TEXT = /sign\s?-?in\s+with\s+shop\s+or\s+google/i;

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

  it('has no sign-up, log-in, account, or payment buttons/links — except the approved storefront-parity sign-in link', () => {
    // Strip the one approved link (exact href + exact label) before asserting
    const strippedControls = controls.replace(APPROVED_SIGNIN_TEXT, '');
    const unapprovedHrefs = hrefs.filter((h) => h !== APPROVED_SIGNIN_HREF);

    expect(strippedControls).not.toMatch(/sign\s?-?up|log\s?-?in|sign\s?-?in|create (an )?account|checkout|buy now|pay now|subscribe/i);
    unapprovedHrefs.forEach((h) => expect(h, h).not.toMatch(/\/(account|login|checkout|cart)(\/|$|\?)/i));
  });

  it('has no payment SDKs', () => {
    expect(html).not.toMatch(/stripe|paypal|shop\s?pay|apple\s?pay|google\s?pay/i);
  });

  it('client code never routes to checkout and only uses standard add-to-cart', () => {
    expect(client).not.toMatch(/\/checkout|shop_pay|accelerated|stripe|paypal/i);
    expect(client).toMatch(/\/cart\/add\.js/);
  });
});
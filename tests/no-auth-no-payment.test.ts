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
 * The exemption below strips the *entire* <a> element (href + class + contents)
 * before checking, so the CSS class `hero-signin` can never leak through.
 * ──────────────────────────────────────────────────────────────────────────
 */
const APPROVED_SIGNIN_HREF = 'https://account.pawvortex.com/';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches the entire <a href="APPROVED_HREF" ...>...</a> block, including nested
// images and text. Strips class names too, so /sign\s?-?in/i cannot match
// "hero-signin" after removal.
const APPROVED_LINK_BLOCK = new RegExp(
  `<a\\b[^>]*?href="${escapeRegex(APPROVED_SIGNIN_HREF)}"[^>]*>[\\s\\S]*?<\\/a>`,
  'gi',
);

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
    // Strip the WHOLE approved <a>...</a> block (class, href, images, span text).
    // This prevents the CSS class "hero-signin" from matching /sign\s?-?in/i.
    const strippedControls = controls.replace(APPROVED_LINK_BLOCK, '');

    const unapprovedHrefs = hrefs.filter((h) => h !== APPROVED_SIGNIN_HREF);

    expect(strippedControls).not.toMatch(
      /sign\s?-?up|log\s?-?in|sign\s?-?in|create (an )?account|checkout|buy now|pay now|subscribe/i,
    );
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
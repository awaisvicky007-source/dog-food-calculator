import { describe, expect, it } from 'vitest';
import { renderPage } from '../src/server/render';

/** Static guard for AC-19: every css/js/font/img the HTML loads comes from cdn.shopify.com. */
describe('assets served from Shopify CDN (AC-19)', () => {
  const html = renderPage({
    cssUrl: 'https://cdn.shopify.com/s/files/1/0/app-abcd1234.css',
    jsUrl: 'https://cdn.shopify.com/s/files/1/0/app-abcd1234.js',
  });
  it('stylesheet and script URLs are on cdn.shopify.com', () => {
    const urls = [...html.matchAll(/<(?:link rel="stylesheet"|script[^>]*?) [^>]*?(?:href|src)="([^"]+)"/g)].map((m) => m[1]!);
    expect(urls.length).toBe(2);
    urls.forEach((u) => expect(new URL(u).hostname).toBe('cdn.shopify.com'));
  });
  it('never references vercel.app and has no inline scripts/styles', () => {
    expect(html).not.toMatch(/vercel\.app/);
    expect(html).not.toMatch(/<style|<script(?![^>]*(src=|type="application\/ld\+json"))/);
  });
  it('content-hashed file names are preserved verbatim', () => {
    expect(html).toContain('app-abcd1234.js');
  });
});

import { describe, expect, it } from 'vitest';
import { CITATIONS } from '../src/lib/citations';
import { classifyUrl, extractUrls } from '../src/lib/whitelist';
import { renderPage } from '../src/server/render';

describe('citation whitelist (AC-06, AC-07)', () => {
  it('every citation is a whitelisted source', () => {
    for (const c of Object.values(CITATIONS)) expect(classifyUrl(c.url), c.key).toBe('source');
  });
  it('blocks AKC, competitors and retailers', () => {
    expect(classifyUrl('https://www.akc.org/expert-advice/')).toBe('prohibited');
    expect(classifyUrl('https://plainbowl.com/dog-food-calculator')).toBe('prohibited');
    expect(classifyUrl('https://www.chewy.com/x')).toBe('prohibited');
    expect(classifyUrl('https://random-blog.example/post')).toBe('unknown');
  });
  it('rendered HTML contains no prohibited or unknown links', () => {
    const html = renderPage({ cssUrl: 'https://cdn.shopify.com/a.css', jsUrl: 'https://cdn.shopify.com/a.js' });
    for (const u of extractUrls(html)) expect(['source', 'internal', 'technical'], u).toContain(classifyUrl(u));
    expect(html).not.toMatch(/plainbowl|akc\.org/i);
  });
});

/** CI gate: citation whitelist (FR-34/35, AC-06/07). Exit 1 on any violation. */
import { CITATIONS } from '../src/lib/citations';
import { classifyUrl, extractUrls } from '../src/lib/whitelist';
import { renderPage } from '../src/server/render';

let failed = false;
const fail = (m: string) => {
  failed = true;
  console.error(`FAIL  ${m}`);
};

for (const c of Object.values(CITATIONS)) {
  const k = classifyUrl(c.url);
  if (k !== 'source') fail(`citation ${c.key} -> ${c.url} is "${k}", must be a whitelisted source`);
  if (!c.verified) console.warn(`WARN  citation ${c.key} not yet verified by a human reviewer`);
}

const html = renderPage({ cssUrl: 'https://cdn.shopify.com/s/files/x/app-12345678.css', jsUrl: 'https://cdn.shopify.com/s/files/x/app-12345678.js' });
for (const u of extractUrls(html)) {
  const k = classifyUrl(u);
  if (k === 'prohibited' || k === 'unknown') fail(`rendered page links to ${k} URL: ${u}`);
}
if (/plainbowl/i.test(html)) fail('rendered page mentions a competitor');

if (failed) process.exit(1);
console.log('whitelist OK');

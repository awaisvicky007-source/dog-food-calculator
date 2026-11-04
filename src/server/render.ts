import { CITATIONS, citationList } from '../lib/citations.js';
import { FAQ } from '../content/faq.js';

export interface RenderOptions {
  cssUrl?: string;
  jsUrl: string;
  /** Public origin, e.g. https://www.pawvortex.com */
  origin?: string;
  /** Public path, e.g. /tools/dog-food-calculator */
  path?: string;
  dev?: boolean;
}

export const CANONICAL_ORIGIN = 'https://www.pawvortex.com';
export const CANONICAL_PATH = '/tools/dog-food-calculator';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

function schema(origin: string, path: string) {
  const url = `${origin}${path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PawVortex Dog Food Calculator',
      url,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'PawVortex', url: origin },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'PawVortex', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${origin}/tools` },
        { '@type': 'ListItem', position: 3, name: 'Dog Food Calculator', item: url },
      ],
    },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'PawVortex', url: origin },
  ];
}

const opt = (v: string, label: string, sel = false) =>
  `<option value="${v}"${sel ? ' selected' : ''}>${label}</option>`;

export function renderPage(o: RenderOptions): string {
  const origin = o.origin ?? CANONICAL_ORIGIN;
  const path = o.path ?? CANONICAL_PATH;
  const title = 'Dog Food Calculator: How Much to Feed Your Dog | PawVortex';
  const desc =
    'Free dog calorie and dog food calculator. Get daily calories, cups, grams, meals, treat budget and water for your dog. Show-the-math, no sign-up, sources from veterinary and government authorities.';

  const sources = citationList(Object.keys(CITATIONS) as (keyof typeof CITATIONS)[])
    .map(
      (c) =>
        `<li><span class="org">${esc(c.org)}</span> - <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a></li>`,
    )
    .join('');

  const faq = FAQ.map(
    (f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`,
  ).join('');

  const bcs = [`<option value="">Not sure / skip</option>`]
    .concat(
      Array.from({ length: 9 }, (_, i) => {
        const n = i + 1;
        const hint = n <= 3 ? ' - thin' : n <= 5 ? ' - ideal' : n === 6 ? ' - a little heavy' : ' - heavy';
        return opt(String(n), `${n}${hint}`);
      }),
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${origin}${path}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${origin}${path}">
<meta name="theme-color" content="#0f5e4d">
${o.cssUrl ? `<link rel="stylesheet" href="${esc(o.cssUrl)}">` : ''}
<script type="application/ld+json">${jsonLd(schema(origin, path))}</script>
</head>
<body>
<a class="skip" href="#calc">Skip to calculator</a>
<header class="hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb" class="crumbs"><a href="${origin}">PawVortex</a> / <a href="${origin}/tools">Tools</a> / <span>Dog Food Calculator</span></nav>
    <h1>Dog Food Calculator</h1>
    <p class="lead">Daily calories, cups, grams, meals, treats and water for your dog - with every step shown. Free. No sign-up. Your details stay on your device.</p>
    <ul class="pills"><li>No account</li><li>Show-the-math</li><li>Veterinary &amp; government sources only</li></ul>
  </div>
</header>

<main class="wrap" id="main">
<div class="grid">
<section id="calc" class="card" aria-labelledby="calc-h">
  <h2 id="calc-h">Your dog</h2>
  <form id="calcForm" novalidate>
    <div class="field"><label for="name">Name <span class="opt">(optional)</span></label>
      <input id="name" name="name" type="text" maxlength="40" autocomplete="off"></div>

    <div class="row">
      <div class="field"><label for="weight">Weight</label>
        <input id="weight" type="text" inputmode="decimal" placeholder="e.g. 30" required></div>
      <div class="field narrow"><label for="weightUnit">Unit</label>
        <select id="weightUnit">${opt('lb', 'lb', true)}${opt('kg', 'kg')}</select></div>
    </div>

    <div class="row">
      <div class="field"><label for="age">Age</label>
        <input id="age" type="text" inputmode="decimal" placeholder="e.g. 3" required></div>
      <div class="field narrow"><label for="ageUnit">Unit</label>
        <select id="ageUnit">${opt('weeks', 'weeks')}${opt('months', 'months')}${opt('years', 'years', true)}</select></div>
    </div>

    <div class="field"><label for="adultStatus">Adult dogs (over 12 months)</label>
      <select id="adultStatus">${opt('neutered', 'Spayed / neutered', true)}${opt('intact', 'Not spayed / neutered')}${opt('obesity_prone', 'Prone to weight gain / low activity')}</select>
      <p class="hint" id="stageHint">Puppies up to 12 months use puppy factors automatically.</p></div>

    <details class="more"><summary>Food label <span class="opt">(recommended for exact cups)</span></summary>
      <div class="field"><label for="foodName">Food name</label>
        <input id="foodName" type="text" maxlength="60" autocomplete="off" list="foodList"><datalist id="foodList"></datalist></div>
      <div class="row">
        <div class="field"><label for="kcalCup">kcal per cup</label>
          <input id="kcalCup" type="text" inputmode="decimal" placeholder="from the bag"></div>
        <div class="field"><label for="kcalKg">kcal per kg</label>
          <input id="kcalKg" type="text" inputmode="decimal" placeholder="optional"></div>
      </div>
      <div class="row">
        <div class="field"><label for="gramsCup">Grams per cup</label>
          <input id="gramsCup" type="text" inputmode="decimal" placeholder="optional"></div>
        <div class="field"><label for="bagSize">Bag size</label>
          <div class="inline"><input id="bagSize" type="text" inputmode="decimal" placeholder="optional">
          <select id="bagUnit" aria-label="Bag size unit">${opt('lb', 'lb', true)}${opt('kg', 'kg')}</select></div></div>
      </div>
      <p class="hint">Pet food labels state calories as kcal/kg and per cup (AAFCO). Grams are only calculated from label values - never guessed.</p>
    </details>

    <details class="more"><summary>Advanced <span class="opt">(body condition &amp; activity)</span></summary>
      <div class="field"><label for="bcs">Body condition score (WSAVA 1-9)</label>
        <select id="bcs">${bcs}</select></div>
      <div class="field"><label for="activity">Activity (adults)</label>
        <select id="activity">${opt('typical', 'Typical household dog', true)}${opt('light_work', 'Light work')}${opt('moderate_work', 'Moderate work')}</select></div>
    </details>

    <div id="formErrors" class="errors" role="alert" hidden></div>
    <button class="btn primary" type="submit">Calculate my dog\u2019s plan</button>
  </form>
</section>

<aside class="side">
  <section class="card" aria-labelledby="pets-h">
    <h2 id="pets-h">Saved on this device</h2>
    <p class="hint">Stored only in this browser. Nothing is sent to PawVortex.</p>
    <div id="profiles" class="profiles"><p class="muted">No saved pets yet.</p></div>
    <div class="btnrow">
      <button class="btn ghost" id="exportBtn" type="button">Export</button>
      <label class="btn ghost filebtn">Import<input id="importFile" type="file" accept="application/json" hidden></label>
      <button class="btn danger" id="clearBtn" type="button">Clear all data</button>
    </div>
    <p id="storageMsg" class="hint" role="status"></p>
  </section>
  <section class="card danger-card" aria-labelledby="safe-h">
    <h2 id="safe-h">Food safety &amp; emergencies</h2>
    <p><strong>Xylitol</strong> (a sweetener in some gum, candy, baked goods and peanut butters) is dangerous to dogs. If your dog may have eaten any, contact a veterinarian or an animal poison control service immediately. <sup><a href="${esc(CITATIONS.fda_xylitol.url)}" target="_blank" rel="noopener noreferrer">FDA</a></sup></p>
    <p>Other common food hazards include chocolate, grapes and raisins, onions and garlic, and macadamia nuts. <sup><a href="${esc(CITATIONS.merck_food_hazards.url)}" target="_blank" rel="noopener noreferrer">Merck Vet Manual</a></sup></p>
    <p>Vomiting, collapse, seizures, or trouble breathing are emergencies - call your veterinarian or nearest emergency clinic now.</p>
  </section>
</aside>
</div>

<section id="results" class="card results" aria-live="polite" hidden></section>
<section id="compare" class="card" hidden></section>

<section class="content card" aria-labelledby="how-h">
  <h2 id="how-h">How the calculator works</h2>
  <p>It estimates resting energy requirement (RER) from body weight, applies a published factor for life stage and status to get maintenance energy (MER), then converts calories to cups or grams using <em>your</em> food\u2019s label. Everything runs in your browser.</p>
  <h2>Frequently asked questions</h2>
  ${faq}
  <h2 id="sources">Sources</h2>
  <ul class="sources">${sources}</ul>
  <p class="disclaimer">Educational nutrition information based on published sources. Not veterinary advice. Consult a licensed veterinarian for decisions about an individual dog.</p>
  <p class="muted">Privacy: no account, no tracking of pet details. Saved pets live only in this browser and can be erased with <em>Clear all data</em>.</p>
</section>
</main>

<noscript><p class="wrap">This calculator needs JavaScript to run in your browser. Nothing is sent to a server.</p></noscript>
<script type="module" ${o.dev ? '' : 'crossorigin="anonymous" '}src="${esc(o.jsUrl)}"></script>
</body>
</html>`;
}

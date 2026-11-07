import { CITATIONS, citationList } from '../lib/citations.js';
import { FAQ } from '../content/faq.js';

export interface RenderOptions {
  cssUrl?: string;
  jsUrl: string;
  origin?: string;
  path?: string;
  dev?: boolean;
}

export const CANONICAL_ORIGIN = 'https://www.pawvortex.com';
export const CANONICAL_PATH = '/tools/dog-food-calculator';

const ORG_ID = 'https://www.pawvortex.com/#organization';
const SITE_ID = 'https://www.pawvortex.com/#website';
const LOGO_URL = 'https://www.pawvortex.com/cdn/shop/files/pawvortex-logo.webp';
const FAVICON_URL =
  'https://www.pawvortex.com/cdn/shop/files/paw_vortex_square_logo.webp?crop=center&height=32&v=1755312502&width=32';
const APPLE_TOUCH_ICON_URL =
  'https://www.pawvortex.com/cdn/shop/files/paw_vortex_square_logo.webp?crop=center&height=180&v=1755312502&width=180';
const OG_IMAGE_URL = 'https://www.pawvortex.com/cdn/shop/files/dog-food-calculator-us-1200x630.jpg';
const OG_IMAGE_ALT = 'PawVortex Dog Food Calculator — how many calories and cups to feed your dog';
const OG_IMAGE_CAPTION =
  'Screenshot of the PawVortex Dog Food Calculator with weight, age, and food label inputs';

const BLOG_INDEX = 'https://www.pawvortex.com/blogs/dog-care';
const BLOG_NUTRITION = 'https://www.pawvortex.com/blogs/dog-care/complete-dog-nutrition-guide';
const BLOG_SENIOR = 'https://www.pawvortex.com/blogs/dog-care/senior-dog-nutrition-guide';
const BLOG_PUPPY = 'https://www.pawvortex.com/blogs/dog-care/puppy-feeding-schedule-guide';
const BLOG_PORTION = 'https://www.pawvortex.com/blogs/dog-care/how-much-to-feed-dog-portion-guide';
const BLOG_SUPPLIES =
  'https://www.pawvortex.com/blogs/news/best-puppy-food-and-feeding-supplies-online-2026';
const BLOG_LAB =
  'https://www.pawvortex.com/blogs/dog-care/labrador-retriever-feeding-guide-how-much-how-often-to-feed';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

function schema(origin: string, path: string) {
  const url = `${origin}${path}`;

  const org = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'PawVortex',
    alternateName: 'Paw Vortex',
    legalName: 'AL WAHAB MERCHANDISING INC',
    url: `${origin}/`,
    foundingDate: '2023',
    description:
      'PawVortex is a USA-based online pet supply store offering smart feeders, calming treats, dog and cat toys, pet food, orthopedic beds, grooming kits, and pet accessories. Free shipping on US orders over $35.',
    logo: {
      '@type': 'ImageObject',
      '@id': `${origin}/#logo`,
      url: LOGO_URL,
      width: 150,
      height: 50,
      caption: 'PawVortex — Premium Pet Supplies Online USA',
    },
    image: { '@id': `${origin}/#logo` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '8517 Brushy Creek Trail',
      addressLocality: 'Fort Worth',
      addressRegion: 'TX',
      postalCode: '76118',
      addressCountry: 'US',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'hello@pawvortex.com',
        telephone: '+1-682-456-7090',
        contactType: 'customer service',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    ],
  };

  const site = {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${origin}/`,
    name: 'PawVortex',
    alternateName: 'Paw Vortex',
    description: 'Premium online pet store for dogs and cats — USA',
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${origin}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  const app = {
    '@type': 'WebApplication',
    '@id': `${url}#webapp`,
    name: 'PawVortex Dog Food Calculator',
    alternateName: [
      'Dog Calorie Calculator',
      'Pet Calorie Calculator',
      'Dog Feeding Calculator',
      'Dog Food Calorie Calculator',
    ],
    url,
    description:
      'Free US dog food calculator and dog calorie calculator: daily kcal (RER × life-stage multiplier), cups, grams, meals, treats, and water — with every step shown. No sign-up, no account.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'PetNutritionCalculator',
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    inLanguage: 'en-US',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    datePublished: '2026-11-04',
    dateModified: '2026-11-07',
    screenshot: { '@type': 'ImageObject', url: OG_IMAGE_URL, caption: OG_IMAGE_CAPTION },
    featureList: [
      'Daily calorie estimate in kcal (RER × life-stage multiplier per Merck)',
      'Cups, grams, and per-meal amounts from your food label',
      'Wet/dry/mixed feeding — calculates cans or cups per day',
      'Treat budget (10% of daily calories — WSAVA)',
      'Drinking-water target (44–66 mL/kg/day — Merck)',
      'Body condition score aware (WSAVA 1–9)',
      'Puppy, adult, senior, and working-dog factors',
      'Estimated days per bag from bag size',
      'Local-only save — no account, no data sent to PawVortex',
      'Every step of the math shown with a linked citation',
    ],
    audience: { '@type': 'Audience', audienceType: 'Dog owners in the United States' },
    about: { '@type': 'Thing', name: 'Dog nutrition and feeding' },
  };

  const faq = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
    })),
  };

  const crumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'PawVortex', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${origin}/tools` },
      { '@type': 'ListItem', position: 3, name: 'Dog Food Calculator', item: url },
    ],
  };

  return { '@context': 'https://schema.org', '@graph': [org, site, app, faq, crumb] };
}

const opt = (v: string, label: string, sel = false) =>
  `<option value="${v}"${sel ? ' selected' : ''}>${label}</option>`;

export function renderPage(o: RenderOptions): string {
  const origin = o.origin ?? CANONICAL_ORIGIN;
  const path = o.path ?? CANONICAL_PATH;

  const title = 'Dog Food Calculator — Calories, Cups & Meals | PawVortex';
  const desc =
    'Free dog food calculator and dog calorie calculator. Get daily kcal, cups, grams, meals, treats and water — every step shown, sources cited.';
  const h1 = 'Dog Food Calculator: Calories, Cups & Meals for Your Dog';

  const sources = citationList(Object.keys(CITATIONS) as (keyof typeof CITATIONS)[])
    .map(
      (c) =>
        `<li><span class="org">${esc(c.org)}</span> - <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)}</a></li>`,
    )
    .join('');

  const faq = FAQ.map(
    (f) => `<details class="faq"><summary>${esc(f.q)}</summary><p>${f.a}</p></details>`,
  ).join('');

  const bcs = [`<option value="">Not sure / skip</option>`]
    .concat(
      Array.from({ length: 9 }, (_, i) => {
        const n = i + 1;
        const hint =
          n <= 3 ? ' - thin' : n <= 5 ? ' - ideal' : n === 6 ? ' - a little heavy' : ' - heavy';
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

<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
<link rel="dns-prefetch" href="https://cdn.shopify.com">

<link rel="icon" type="image/png" href="${FAVICON_URL}">
<link rel="apple-touch-icon" href="${APPLE_TOUCH_ICON_URL}">
<meta name="theme-color" content="#FFB61A">

<meta property="og:type" content="website">
<meta property="og:site_name" content="PawVortex">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${origin}${path}">
<meta property="og:image" content="${OG_IMAGE_URL}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@pawvortex">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${OG_IMAGE_URL}">
<meta name="twitter:image:alt" content="${esc(OG_IMAGE_ALT)}">

${o.cssUrl ? `<link rel="stylesheet" href="${esc(o.cssUrl)}">` : ''}
<script type="application/ld+json">${jsonLd(schema(origin, path))}</script>
</head>
<body>
<a class="skip" href="#calc">Skip to calculator</a>
<header class="hero">
  <div class="wrap">
    <nav aria-label="Breadcrumb" class="crumbs"><a href="${origin}">PawVortex</a> / <a href="${origin}/tools">Tools</a> / <span>Dog Food Calculator</span></nav>
    <h1>${esc(h1)}</h1>
    <p class="lead">Daily calories (kcal), cups, grams, meals, treats and water for your dog — with every step shown. Free. No sign-up. Your details stay on your device.</p>
    <ul class="pills"><li>No account</li><li>Show-the-math</li><li>Veterinary &amp; government sources only</li></ul>
  </div>
</header>

<main class="wrap" id="main">
<div class="grid">
<section id="calc" class="card" aria-labelledby="calc-h">
  <h2 id="calc-h">Calculate your dog's plan</h2>
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
      <p class="hint">Most pet foods label calories as kcal/kg plus a per-unit figure (per cup for dry, per can for wet; AAFCO model regulations). Grams are only calculated from label values — never guessed.</p>
    </details>

    <details class="more"><summary>Advanced <span class="opt">(body condition &amp; activity)</span></summary>
      <div class="field"><label for="bcs">Body condition score (WSAVA 1-9)</label>
        <select id="bcs">${bcs}</select></div>
      <div class="field"><label for="activity">Activity (adults)</label>
        <select id="activity">${opt('typical', 'Typical household dog', true)}${opt('light_work', 'Light work')}${opt('moderate_work', 'Moderate work')}</select></div>
    </details>

    <div id="formErrors" class="errors" role="alert" hidden></div>
    <button class="btn primary" type="submit">Calculate my dog's plan</button>
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
    <p>Vomiting, collapse, seizures, or trouble breathing are emergencies — call your veterinarian or nearest emergency clinic now.</p>
  </section>
</aside>
</div>

<section id="results" class="card results" aria-live="polite" hidden></section>
<section id="compare" class="card" hidden></section>

<section class="content card" aria-labelledby="calories-h">
  <h2 id="calories-h">Dog calorie calculator: how many calories should your dog eat?</h2>
  <p>Daily calories (kcal) for dogs follow one published formula. Resting energy (RER) is <strong>70 × body weight in kg raised to the power 0.75</strong>. Then multiply RER by a life-stage factor to get maintenance energy (MER) — the actual daily calorie target: <strong>1.6</strong> for neutered adults, <strong>1.8</strong> for intact adults, <strong>1.4</strong> for obesity-prone or very inactive dogs, <strong>2×</strong> for puppies over 4 months, and <strong>3×</strong> for puppies under 4 months.</p>
  <p>For example: a 30 lb (13.6 kg) neutered adult has an RER of about 496 kcal, and an MER of 496 × 1.6 = <strong>794 kcal per day</strong>. A 60 lb neutered adult lands near 1,334 kcal; a 10 lb neutered adult near 348 kcal. The calculator above does this math for any weight and age you enter.</p>
  <p>These formulas come from the <a href="${CITATIONS.merck_energy.url}" target="_blank" rel="noopener noreferrer">Merck Veterinary Manual</a>, which is the reference veterinarians use. AAHA’s 2021 nutrition guideline publishes a small range around each point value (1.4–1.6 × RER for neutered adults); the calculator uses Merck’s point value and notes the range so you can adjust with your vet.</p>
</section>

<section class="content card" aria-labelledby="by-weight-h">
  <h2 id="by-weight-h">How much food to feed your dog — by weight and age</h2>
  <p>Cups per day depend on your dog’s weight <em>and</em> the calorie density of the food. That’s why the calculator asks for kcal per cup from your bag — the same weight of dog needs different portions depending on whether the food is 300 or 400 kcal/cup.</p>
  <p>Rough guide using a typical dry food of 350 kcal/cup, neutered adults, 2 meals/day:</p>
  <ul>
    <li><strong>10 lb dog</strong> (≈ 348 kcal/day): about 1.0 cups/day · 0.5 cups per meal</li>
    <li><strong>25 lb dog</strong> (≈ 692 kcal/day): about 2.0 cups/day · 1.0 cups per meal</li>
    <li><strong>50 lb dog</strong> (≈ 1,164 kcal/day): about 3.3 cups/day · 1.7 cups per meal</li>
    <li><strong>75 lb dog</strong> (≈ 1,578 kcal/day): about 4.5 cups/day · 2.3 cups per meal</li>
    <li><strong>100 lb dog</strong> (≈ 1,957 kcal/day): about 5.6 cups/day · 2.8 cups per meal</li>
  </ul>
  <p>For an exact figure, enter your dog’s weight and your food’s kcal/cup in the calculator above. For detailed portion tables by weight and life stage, see our <a href="${BLOG_PORTION}">dog feeding portion guide by weight and age</a>. For a breed-specific example, our <a href="${BLOG_LAB}">Labrador Retriever feeding chart</a> shows cups per day at every age.</p>
</section>

<section class="content card" aria-labelledby="wet-dry-h">
  <h2 id="wet-dry-h">How much wet food, dry food, or mixed feeding?</h2>
  <p>The daily calorie target is the same regardless of food format. What changes is how you convert those calories into cans, cups, or grams.</p>
  <p><strong>Dry food:</strong> divide daily calories by kcal per cup (typically 300–500 kcal/cup). A 794 kcal dog with a 350 kcal/cup kibble eats ~2.27 cups/day.</p>
  <p><strong>Wet food:</strong> wet food is much less calorie-dense — typically <strong>70–120 kcal per 100 g</strong>, or about <strong>200–400 kcal per 13 oz (370 g) can</strong>. Divide daily calories by the can’s total kcal to get cans/day. A 794 kcal dog eating a 300 kcal/can wet food eats about 2.6 cans per day. Always check the can’s calorie statement — it varies by brand and recipe.</p>
  <p><strong>Mixed (dry + wet):</strong> add the calories from both sources and keep the total equal to your daily target. E.g., 400 kcal from wet + 400 kcal from dry = 800 kcal for a 794 kcal target.</p>
  <p><strong>Water adjustment:</strong> wet food is 70–85% water. If your dog eats mostly wet food, reduce the drinking-water target accordingly — a dog on 100% wet food may drink very little. For portion and calorie context, browse our <a href="https://www.pawvortex.com/collections/dog-food">dog food collection</a> and <a href="https://www.pawvortex.com/collections/wet-dog-food">wet dog food collection</a>.</p>
</section>

<section class="content card" aria-labelledby="bag-last-h">
  <h2 id="bag-last-h">How long will your dog's food last?</h2>
  <p>Enter your bag size in the Food label section above and the calculator shows an estimated days-per-bag figure. The math: bag weight in grams ÷ daily grams consumed. Daily grams come from daily calories ÷ the food’s kcal per kg.</p>
  <p>For example: a 30 lb (13,600 g) bag of a 3,500 kcal/kg food, feeding a 794 kcal/day dog: daily grams = 794 ÷ 3.5 ≈ 227 g; bag lasts 13,600 ÷ 227 ≈ 60 days. Add treats within the 10% budget and the food amount drops slightly, extending the bag by a few days.</p>
  <p>Once the calculator shows your days-per-bag, you can compare larger bags against smaller ones for a per-day cost — usually a 24–30 lb bag is the best value for medium and large dogs, smaller bags for small dogs to keep food fresh.</p>
</section>

<section class="content card" aria-labelledby="homemade-raw-h">
  <h2 id="homemade-raw-h">Homemade and raw diets — using this calculator</h2>
  <p>The calorie math in this calculator applies to any food format: RER × life-stage factor gives the daily calorie target. That part is the same whether your dog eats kibble, canned, homemade, or raw.</p>
  <p><strong>What this calculator does not assess:</strong> the nutrient balance of a homemade or raw recipe. A complete-and-balanced diet needs the right ratios of protein, fat, calcium, phosphorus, and the full vitamin/mineral profile — measured by AAFCO or NRC standards and verified by a board-certified veterinary nutritionist. Neither a calorie target nor any online tool substitutes for that review.</p>
  <p><strong>Recommended workflow for homemade or raw:</strong></p>
  <ol>
    <li>Use this calculator to establish your dog’s daily calorie target.</li>
    <li>Choose a recipe from a veterinary nutritionist or a board-certified source — not a generic internet recipe.</li>
    <li>Confirm with your veterinarian or nutritionist that the recipe meets AAFCO or NRC profiles at the calorie amount above.</li>
    <li>Re-check weight every few weeks and adjust the calorie target with your vet if needed.</li>
  </ol>
  <p>For more on nutrition fundamentals across formats, see our <a href="${BLOG_NUTRITION}">complete dog nutrition guide</a>.</p>
</section>

<section class="content card" aria-labelledby="how-h">
  <h2 id="how-h">How this calculator works</h2>
  <p>This is a browser-based MER (Maintenance Energy Requirement) calculator. It works in three steps:</p>
  <ol>
    <li><strong>Resting energy:</strong> RER = 70 × (body weight in kg) <sup>0.75</sup> — from the Merck Veterinary Manual.</li>
    <li><strong>Life-stage multiplier:</strong> 1.6 neutered adult · 1.8 intact adult · 1.4 obesity-prone · 2–3 puppies and working dogs — same source.</li>
    <li><strong>Convert to cups or grams:</strong> daily kcal ÷ your food’s kcal per cup (or kcal/kg) — AAFCO label convention.</li>
  </ol>
  <p>The treat budget is 10% of daily calories (WSAVA guideline). The water target is a drinking-water range of 44–66 mL/kg/day (Merck). Everything runs in your browser — no pet name, weight, or plan ever leaves your device.</p>
  <p><strong>About the multipliers.</strong> Merck publishes a point value; AAHA’s 2021 nutrition guideline publishes a range around that point value. If your dog gains weight on the point value shown, switch to “prone to weight gain” (1.4× RER) — or ask your veterinarian to set a target weight.</p>
  <p><strong>About water.</strong> The figure is <em>drinking water</em>, not total fluid. It does not include water already in wet food; if you feed <a href="https://www.pawvortex.com/collections/wet-dog-food">wet or raw</a>, reduce the target accordingly.</p>
</section>

<section class="content card" aria-labelledby="faq-h">
  <h2 id="faq-h">Frequently asked questions</h2>
  ${faq}
</section>

<section class="content card" aria-labelledby="sources-h">
  <h2 id="sources-h">Sources</h2>
  <ul class="sources">${sources}</ul>
  <p class="disclaimer">Educational nutrition information based on published sources. Not veterinary advice. Consult a licensed veterinarian for decisions about an individual dog.</p>
  <p class="muted">Privacy: no account, no tracking of pet details. Saved pets live only in this browser and can be erased with <em>Clear all data</em>.</p>
</section>

<section class="content card" id="tools-guides" aria-labelledby="tools-h">
  <h2 id="tools-h">Tools &amp; guides for your feeding plan</h2>
  <p>Once you have your daily amount, these PawVortex resources help put it into practice.</p>

  <h3>Feed the amount you calculated</h3>
  <ul>
    <li><a href="https://www.pawvortex.com/collections/dog-food">Dog food collection</a> — compare labels, then enter the kcal per cup from your chosen food above for exact portions.</li>
    <li><a href="https://www.pawvortex.com/collections/wet-dog-food">Wet dog food collection</a> — if you feed wet or mixed, use its label calories and reduce the drinking-water target.</li>
  </ul>

  <h3>Serve consistently</h3>
  <ul>
    <li><a href="https://www.pawvortex.com/collections/smart-dog-feeders">Automatic dog feeders</a> — set the portion size to match your calculated per-meal amount.</li>
    <li><a href="https://www.pawvortex.com/collections/pet-water-fountains">Pet water fountains</a> — pick a capacity that keeps fresh water available all day for your dog's drinking target.</li>
  </ul>

  <h3>Read more</h3>
  <ul>
    <li><a href="${BLOG_INDEX}">Dog care blog</a> — every feeding, weight-management and nutrition article on PawVortex.</li>
    <li><a href="${BLOG_PORTION}">How much should I feed my dog? Portion guide by weight and age</a> — the full feeding-chart companion to this calculator.</li>
    <li><a href="${BLOG_PUPPY}">Puppy feeding schedule: how often &amp; how much by age</a> — meal frequency and cups for 8 weeks to 12 months.</li>
    <li><a href="${BLOG_SENIOR}">Senior dog nutrition guide</a> — adjusting calories, protein and joint support for dogs over 7.</li>
    <li><a href="${BLOG_LAB}">Labrador Retriever feeding chart by age</a> — a breed-specific example of cups per day from puppy to senior.</li>
    <li><a href="${BLOG_SUPPLIES}">Best puppy food and feeding supplies 2026</a> — bowls, slow feeders and portion-control tools for new puppy parents.</li>
    <li><a href="${BLOG_NUTRITION}">The complete dog nutrition guide 2026</a> — a broader overview of food choices, supplements and feeding routines.</li>
  </ul>
</section>
</main>

<noscript><p class="wrap">This calculator needs JavaScript to run in your browser. Nothing is sent to a server.</p></noscript>
<script type="module" ${o.dev ? '' : 'crossorigin="anonymous" '}src="${esc(o.jsUrl)}"></script>
</body>
</html>`;
}
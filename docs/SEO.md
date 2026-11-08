
---

## File 3 — `docs/SEO.md`

```markdown
# PawVortex — SEO Playbook & Implementation

**Project:** Dog Food Calculator (`/tools/dog-food-calculator`)
**Version:** 1.1
**Last updated:** 2026-11-07
**Owner:** PawVortex

A living document for how we rank in the US for "dog food calculator," "dog calorie calculator," and adjacent queries. Reusable structure for future PawVortex tools.

---

## 1. Current target — the numbers we're playing for

Source: Ahrefs (2026-11-04) + Google Search Console impressions (2026-11-06). All volumes are US monthly searches.

### Primary keyword

| Term | Volume | KD | CPC | Traffic potential | Notes |
|---|---|---|---|---|---|
| dog food calculator | 2,700 | 26 | $1.00 | 2,600 | Medium difficulty; 30 ref. domains to top 10 |

### Secondary keyword clusters

| Cluster | Volume | Best-fit section |
|---|---|---|
| how much wet food to feed a dog calculator | 450 | H2: How much wet food, dry food, or mixed feeding? |
| raw dog food calculator | 450 | H2: Homemade and raw diets |
| dog food calorie calculator | 400 | H2: Dog calorie calculator |
| dog food calculator by breed | 350 | FAQ + internal link to Labrador chart |
| homemade dog food calculator | 350 | H2: Homemade and raw diets |
| homemade dog food serving size calculator | 300 | H2: Homemade and raw diets |
| dog food calculator by weight and age | 200 | H2: How much food to feed by weight and age |
| dog food calculator by weight | 200 | H2: How much food to feed by weight and age |
| how long will my dog food last calculator | 150 | H2: How long will your dog's food last? |
| how much dry food should i feed my dog calculator | 150 | H2: How much wet food, dry food, or mixed |

### Long-tail + FAQ queries (from GSC/Ahrefs questions)

- how much wet food to feed a dog calculator (450)
- how long will my dog food last calculator (150)
- how much dry food should i feed my dog calculator (150)
- how much food should i feed my dog calculator (40)
- what is the difference between RER and MER (definitional)
- is dog food calculator accurate

### Calorie cluster — emerging (GSC, 2026-11-06)

The page began surfacing on **calorie-intent** queries within ~48h of indexing. These have zero clicks today, but they represent **a distinct cluster** from the primary `dog food calculator` intent:

| Query | Clicks | Impressions | Action taken |
|---|---|---|---|
| how many calories should my dog eat calculator | 0 | 3 | Renamed FAQ #1 to match exact phrasing; moved to H2 title |
| kcal calculator for dogs | 0 | 2 | Added FAQ #2 "How do I calculate kcal for my dog?" |
| pet calorie calculator | 0 | 2 | Added `alternateName: ['Pet Calorie Calculator', ...]` in schema |

Zero clicks today is expected — the queries are informational and the SERP is dominated by AI Overview + Purina/Royal Canin brand calculators. The play is **impression capture first** (as content), **click capture second** (once the meta description and H2 match the query), **conversion third** (once users land and see the calculator runs free).

---

### Competitive SERP snapshot

| # | Domain | Page type | Words | DR | Note |
|---|---|---|---|---|---|
| 1 | dogfoodadvisor.com | Article/How-to | 1,782 | 75 | **Content-depth competitor** — beats us on DR, not on structure |
| 2 | petnutritionalliance.org | Tool/Calculator | 639 | 65 | 65 DR but very thin content |
| 3 | purina.com | Tool/Calculator | 379 | 81 | Brand-locked, thin |
| 4 | AI Overview | — | — | — | Extractable from pages 1–10 |
| 5 | answerspetfood.com | Article/How-to | 369 | 42 | Small brand |
| 6 | petobesityprevention.org | Tool/Calculator | 1,487 | 75 | **Real competitor** — near our word count |
| 7 | omaspride.com | Tool/Calculator | 610 | 53 | Raw-focused |
| 8 | royalcanin.com | Tool/Calculator | 512 | 83 | Brand-locked, thin |
| 9 | stevesrealfood.com | Tool/Calculator | 1,186 | 57 | Raw-focused |
| 10 | purinainstitute.com | Tool/Calculator | 802 | 71 | Scientific calculator, thin |

**Read:** Only two competitors have ≥1,400 words (dogfoodadvisor, petobesityprevention). Our ~2,800-word page beats both on breadth (wet/dry/mixed, homemade/raw, bag duration, breed example, calorie cluster). The main gap is **domain authority** — pawvortex.com is a new retail domain without the DR of a Purina or Royal Canin.

**Strategy consequence:** We can't beat Purina on DR. We compete on **content completeness** and **long-tail cluster coverage**. Target #3–8 for the primary keyword within 90 days, and #1–3 for the specific long-tails (wet food, homemade, by weight, food-last) within 30 days — because the SERP competitors don't have dedicated sections for those.

---

## 2. Current implementation — what's live

Every element below is **shipped and verified in production** as of the last deploy (2026-11-07).

### 2.1 Title, description, H1

| Element | String | Length | Location |
|---|---|---|---|
| `<title>` | `Dog Food Calculator — Calories, Cups & Meals \| PawVortex` | 57 | `src/server/render.ts` → `title` const |
| `<meta name="description">` | `Free dog food calculator and dog calorie calculator. Get daily kcal, cups, grams, meals, treats and water — every step shown, sources cited.` | 141 | same → `desc` const |
| `<h1>` | `Dog Food Calculator: Calories, Cups & Meals for Your Dog` | 55 | same → `h1` const |

**Why these choices:**

- `title` puts the primary keyword first, adds two secondaries (`calories`, `cups`), and brand-suffixes with `| PawVortex`
- `description` now leads with **both** "dog food calculator" and "dog calorie calculator" — this is the single most important change from v1.0, because it captures the calorie cluster impressions the page is already generating
- `description` uses **"kcal"** explicitly (matches `kcal calculator for dogs` query)
- `h1` keeps the keyword phrase plus a second emotional anchor ("your dog")

**Rules going forward:** title ≤60 chars, description 120–155 chars, H1 ≤60 chars. Don't change without an A/B test plan and a corresponding commit message documenting the why. **Any title/description edit must be logged in § 9.**

### 2.2 Content architecture — H2 map

10 sections after the form. Every H2 targets a specific keyword cluster.

| # | H2 | Primary keyword | Word count |
|---|---|---|---|
| 1 | Calculate your dog's plan | (form anchor) | — |
| 2 | **Dog calorie calculator: how many calories should your dog eat?** | dog food calorie calculator, how many calories should my dog eat calculator, pet calorie calculator | ~220 |
| 3 | How much food to feed your dog — by weight and age | by weight, by weight and age | ~270 |
| 4 | How much wet food, dry food, or mixed feeding? | wet food, dry food, mixed | ~280 |
| 5 | How long will your dog's food last? | food last calculator | ~150 |
| 6 | Homemade and raw diets — using this calculator | homemade, raw, homemade serving size | ~230 |
| 7 | How this calculator works | (methodology, EEAT) | ~260 |
| 8 | Frequently asked questions | 13 Q&As (FAQPage schema) | ~850 |
| 9 | Sources | (EEAT, trust) | ~80 |
| 10 | Tools & guides for your feeding plan | (internal link hub) | ~180 |

**Total visible content:** ~2,500–2,900 words depending on expanded/collapsed state.

**Notable change from v1.0:** the calorie H2 was renamed from `How many calories does your dog need?` to **`Dog calorie calculator: how many calories should your dog eat?`** — this captures both the exact GSC query phrasing and the "dog calorie calculator" volume. The page's opening sentence in that section also now says "Daily calories **(kcal)**" so the kcal query is captured on-page, not just in meta.

**Rule:** new H2s must map to a keyword cluster with ≥50 monthly volume, or explicitly support an existing cluster. No keyword-less H2s.

### 2.3 FAQ — 13 items mapped to queries

All 13 are live in `src/content/faq.ts`, rendered into both visible HTML and `FAQPage` JSON-LD (strings only, HTML stripped).

| Q | Target |
|---|---|
| **How many calories should my dog eat per day?** *(renamed from "does my dog need each day")* | how many calories should my dog eat calculator |
| **How do I calculate kcal for my dog?** *(new — added 2026-11-07)* | kcal calculator for dogs |
| How do I use this calculator by dog breed? | dog food calculator by breed |
| How much dry food should I feed my dog? | how much dry food should i feed my dog calculator |
| How much wet food should I feed my dog? | how much wet food to feed a dog calculator |
| How many meals a day should I feed? | how often to feed a dog |
| How many treats can my dog have? | treats, 10% rule |
| How long will a bag of dog food last? | how long will my dog food last calculator |
| Can I use this calculator for homemade or raw diets? | homemade, raw |
| Why should I enter kcal per cup from the food bag? | kcal/cup, AAFCO |
| What is the difference between RER and MER? | RER vs MER |
| Is this calculator suitable for puppies, seniors, or dogs with health conditions? | puppy, senior |
| Is my dog's information stored anywhere? | privacy, no-account |

**Rule:** every FAQ item maps to a real query or a trust signal. No filler questions. When adding FAQs, use GSC "Queries" data — if a query surfaces but isn't answered, it becomes a new FAQ. **The two calorie FAQs added on 2026-11-07 exist because of GSC impressions on `how many calories should my dog eat calculator` and `kcal calculator for dogs` — not out of speculation.**

### 2.4 Schema — 5 types, merged into one `@graph`

All 5 schemas live in a **single `<script type="application/ld+json">`** tag as a `@graph` array.

| @type | @id | Purpose |
|---|---|---|
| `Organization` | `#organization` | Links to storefront entity via shared @id |
| `WebSite` | `#website` | Site-level entity, `SearchAction` for sitelinks search box |
| `WebApplication` | `<url>#webapp` | The calculator itself — category, features, **alternateName (calorie cluster)**, free, screenshot |
| `FAQPage` | (implicit) | 13 Q&As — eligible for FAQ rich results when Google allows |
| `BreadcrumbList` | (implicit) | 3 items — PawVortex / Tools / Dog Food Calculator |

**`Organization` `@id` rule:** the calculator page's Organization `@id` **matches** the storefront's `@id` (`https://www.pawvortex.com/#organization`). Google merges data from any page carrying that `@id`. This means:

- We don't duplicate `sameAs` (5 social URLs) on the calculator page
- We don't duplicate `address`, `contactPoint`, `logo`, or `description`
- The storefront provides all of it once; the calculator page just carries the reference
- `whitelist.test.ts` stays green because no external social URLs appear in the calculator HTML

**`WebApplication` fields (updated 2026-11-07):**

- `applicationCategory: UtilitiesApplication` — accurate (not `HealthApplication`)
- **`alternateName: ['Dog Calorie Calculator', 'Pet Calorie Calculator', 'Dog Feeding Calculator', 'Dog Food Calorie Calculator']`** — captures calorie cluster queries Google can match against the entity
- `isAccessibleForFree: true` — free tool signal
- `offers.price: 0` — reinforces free
- `featureList` — 10 bullets summarizing what it does
- `audience` — `Dog owners in the United States`
- `screenshot` — points at the OG image
- `datePublished` / `dateModified` — **`dateModified` must be bumped on every meaningful content change**

**Verification:**

- Rich Results Test: <https://search.google.com/test/rich-results?url=https://www.pawvortex.com/tools/dog-food-calculator>
- Expected: WebApplication, FAQPage, BreadcrumbList — 0 errors
- If FAQPage disappears from results, it's because Google restricts FAQ rich results to select categories; the schema itself remains valid and may return

### 2.5 Meta tags, social cards, favicon

| Tag | Value |
|---|---|
| `<link rel="canonical">` | `https://www.pawvortex.com/tools/dog-food-calculator` |
| `<meta name="theme-color">` | `#FFB61A` |
| `<link rel="icon">` | PawVortex square logo, 32×32 PNG |
| `<link rel="apple-touch-icon">` | PawVortex square logo, 180×180 |
| `<meta property="og:type">` | `website` |
| `<meta property="og:site_name">` | `PawVortex` |
| `<meta property="og:locale">` | `en_US` |
| `<meta property="og:image">` | `https://www.pawvortex.com/cdn/shop/files/dog-food-calculator-us-1200x630.jpg` |
| `<meta property="og:image:width">` | `1200` |
| `<meta property="og:image:height">` | `630` |
| `<meta property="og:image:alt">` | `PawVortex Dog Food Calculator — how many calories and cups to feed your dog` |
| `<meta name="twitter:card">` | `summary_large_image` |
| `<meta name="twitter:site">` | `@pawvortex` |
| `<meta name="twitter:image">` | same as `og:image` |

**⚠️ Pending:** the `og:image` file **must be uploaded** to `Shopify Files` as `dog-food-calculator-us-1200x630.jpg` before social sharing renders a card. Until uploaded, every share shows a blank preview. Verify after upload at <https://www.opengraph.xyz/url/https://www.pawvortex.com/tools/dog-food-calculator>.

**Preconnect:**

```html
<link rel="preconnect" href="https://cdn.shopify.com" crossorigin>
<link rel="dns-prefetch" href="https://cdn.shopify.com">
Saves 100–200 ms on LCP for first-time visitors on 4G.

2.6 Internal linking — 10 links in, 11 out
Links into the calculator (from storefront): zero, as of last deploy. This is the single biggest remaining SEO gap. No nav link means the page is an orphan — Google will index it, but it carries no internal PageRank beyond the base.

Links out from the calculator:

Destination	Anchor	Location
/blogs/dog-care	Dog care blog	Read more list
/blogs/dog-care/how-much-to-feed-dog-portion-guide	How much should I feed my dog?	By-weight H2 + Read more
/blogs/dog-care/puppy-feeding-schedule-guide	Puppy feeding schedule	Read more + FAQ
/blogs/dog-care/senior-dog-nutrition-guide	Senior dog nutrition	Read more + FAQ
/blogs/dog-care/complete-dog-nutrition-guide	Complete dog nutrition guide	Homemade/raw H2 + Read more
/blogs/news/best-puppy-food-and-feeding-supplies-online-2026	Best puppy food and feeding supplies	Read more + FAQ
/blogs/dog-care/labrador-retriever-feeding-guide-how-much-how-often-to-feed	Labrador Retriever feeding chart	By-weight H2 + FAQ
/collections/dog-food	Dog food collection	Tools & guides + Wet/dry H2
/collections/wet-dog-food	Wet dog food collection	Tools & guides + How-it-works
/collections/smart-dog-feeders	Automatic dog feeders	Tools & guides
/collections/pet-water-fountains	Pet water fountains	Tools & guides
All URLs verified live 2026-11-07. Broken URLs are worse than no URLs — every link must be tested before deploy. See whitelist.test.ts which enforces only source, internal, or technical URLs appear in rendered HTML.

2.7 Technical SEO
Item	Status
Canonical	✅ https://www.pawvortex.com/tools/dog-food-calculator
X-Robots-Tag: index,follow (via api/calculator.ts)	✅ production only; previews noindex
robots.txt allow	✅ default Shopify robots allows /tools/*
Sitemap inclusion	⚠️ Not yet — add to sitemap.xml or sitemap_tools_1.xml
HTTPS	✅
Mobile viewport	✅
Core Web Vitals (lab)	⚠️ Not measured — target LCP < 2.5 s, CLS < 0.1, INP < 200 ms
Mobile-friendly test	⚠️ Not run yet
hreflang	Not applicable — single locale
Sitemap submission (pending):

Create a Shopify sitemap entry (e.g., custom sitemap in theme, or add to sitemap_pages_1.xml if /tools is modeled as a page)

Submit URL in Search Console → Sitemaps

Request indexing via URL Inspection after the sitemap includes it

2.8 Mobile UX — sticky action bar
On mobile (≤700px), the results card's primary actions — Save as PDF, Save, Copy — are pinned to the bottom of the viewport via .pv-mobile-actions. This is a UX change with an SEO side effect: mobile engagement signals (dwell time, low pogo-stick rate) influence ranking, and a user who finds "Save as PDF" doesn't bounce.

Why it matters for SEO:

Mobile CTR to SERP result improves when users don't bounce

Reduced bounce rate signals to Google that the page satisfies the query

Direct share of the saved PDF (with the calculator URL embedded) creates organic backlinks

Mobile CWV (INP) improves because the interactive element is in the initial viewport — no scroll-triggered layout shift needed to reach it

Implementation: see docs/DESIGN.md § 6.10.

Verification (must pass before considering the UX change "live"):

□ On mobile ≤700px, sticky bar visible only after Calculate
□ Save as PDF opens the print dialog with only the results (no header, no form, no sticky bar)
□ After Clear-all-data, sticky bar disappears
□ On desktop >700px, no sticky bar — inline .actions-primary row visible
□ Print output for the whole page never includes the sticky bar
□ Body has padding-bottom: 70px when pv-has-results is set, so last content isn't hidden under the bar
2.9 Storefront-parity sign-in link (non-gated)
The hero now includes a Sign in with Shop or Google link to https://account.pawvortex.com/ — matching the storefront header. This is a convenience link, not a login gate. The calculator remains fully usable without signing in.

SEO implications:

The link is doFollow — passes equity to account.pawvortex.com

No <meta name="robots"> change — page stays index,follow

No noindex risk — the link doesn't create a login wall

Whitelist test implication: no-auth-no-payment.test.ts has one approved exception for this specific href (account.pawvortex.com/) and label ("Sign in with Shop or Google"). Any other login-related link, password field, or checkout element still fails the test. See test file comments for the reasoning.

3. Pre-launch checklist (blocking indexing)
Every item below must be done before submitting to Search Console. Order matters.

□ OG image uploaded to Shopify Files as dog-food-calculator-us-1200x630.jpg (1200×630, JPEG, ≤300 KB). Verify at https://www.opengraph.xyz/url/https://www.pawvortex.com/tools/dog-food-calculator.
□ Verify the 9 citations in src/lib/citations.ts. Open each URL, confirm the claim is still supported, set verified: true and lastVerifiedAt: '2026-11-07'. Then npm run ci — the 9 warnings disappear.
□ Verify /tools exists as a page or redirect. Otherwise the breadcrumb (<a href="https://www.pawvortex.com/tools">Tools</a>) leads crawlers to a 404. Fix: either create the page in Shopify → Pages → handle tools → content "Free PawVortex tools" with a link to the calculator, or drop the middle breadcrumb from both visible nav and JSON-LD.
□ Add nav link — Shopify admin → Online Store → Navigation → Header menu → add menu item "Dog Food Calculator" → URL /tools/dog-food-calculator. Also add to Footer menu. This is the highest-impact SEO action — turns the page from an orphan into a linked entity.
□ Verify @pawvortex exists on X. If not, delete <meta name="twitter:site"> from render.ts.
□ Veterinary sign-off on the 10% treat rule wording, the "AAHA range" note, and the safety card copy — sign off in email/notes so the review is documented.
□ Rich Results Test returns 0 errors for all 5 schema types.
□ Mobile-Friendly Test returns green.
□ Lighthouse SEO ≥ 95, Accessibility ≥ 95, Performance ≥ 85.
□ Mobile sticky bar — verify the 6-item checklist in § 2.8.
Then and only then:

□ Search Console → URL Inspection → https://www.pawvortex.com/tools/dog-food-calculator → Request Indexing
4. Ongoing monitoring
Weekly (first 8 weeks)
Check	Where	Expected signal
Index status	GSC → Indexing → Pages	Indexed, though blocked by robots.txt or Indexed
Coverage errors	GSC → Indexing → Pages	Zero "Excluded" for this URL
Crawl activity	GSC → Settings → Crawl stats	Google bot visits ≥ 1 per week
Page performance	GSC → Performance → filter to this URL	Impressions climbing after week 2
Rich results	GSC → Enhancements → FAQ / Breadcrumbs / WebApplication	No invalid items
Calorie cluster impressions	GSC → Performance → Queries → filter "calorie"	Should climb from 7 to >20 by week 4
Monthly (from week 4)
Check	Where	Target
Ranking position (10 target keywords)	Ahrefs → Rank Tracker	Top 20 within 30d, top 10 within 90d
Query discovery	GSC → Performance → Queries	Find queries we're ranking for but not targeting — those become new H2s or FAQ items
CTR vs. position	GSC → Performance → compare CTR against expected CTR for that position	If CTR is below expected, rewrite title/meta
Page speed	PageSpeed Insights on production URL	LCP < 2.5 s on mobile
Calorie cluster clicks	GSC → Performance → filter "calorie"	If impressions are high but clicks low, rewrite meta description to include "free", "kcal", "instant"
Quarterly
Check	Purpose
Full Ahrefs keyword refresh	New clusters emerging (e.g., "GLP-1 dog" trends, "senior dog weight")
Competitor gap analysis	Re-scrape SERP, note changes in top 10, check their H2 structures
Citation re-verification	Every src/lib/citations.ts URL — Merck URLs move
Schema validation	Re-run Rich Results Test — Google occasionally deprecates schema types
Recommended keyword tracker (add to Ahrefs Rank Tracker)
text
dog food calculator
dog calorie calculator
dog food calorie calculator
dog food calculator by weight
dog food calculator by weight and age
dog food calculator by breed
how much wet food to feed a dog calculator
how much dry food should i feed my dog calculator
how many calories should my dog eat calculator
kcal calculator for dogs
pet calorie calculator
homemade dog food calculator
raw dog food calculator
how long will my dog food last calculator
14 keywords (up from 10 in v1.0 — added the calorie cluster as it emerged from GSC). Track US, mobile + desktop, weekly.

5. Content guidelines for new sections
When adding a new H2, a new FAQ, or a new supporting paragraph, follow these rules.

✅ Do
Answer the query in the first 2 sentences. Google's snippets and AI Overviews extract from the top of a section.

Include one concrete number per section (e.g., "a 30 lb neutered adult needs ~794 kcal/day"). Numbers earn featured-snippet slots.

Cite one source — Merck, AAFCO, FDA, WSAVA, or NRC. Adds EEAT signal and links the outward entity graph.

Link to one related PawVortex page — either an article or a collection. Internal links sustain the hub.

Use the exact search phrasing at least once in the section before paraphrasing.

Include both "calories" and "kcal" where relevant — GSC shows users search both, and "kcal" is underused on most competitor pages.

Keep paragraphs 2–4 sentences. Wall-of-text kills dwell time.

Include a scannable list or table where the section has 3+ items.

❌ Don't
Don't keyword-stuff. One exact-phrase mention per section is enough.

Don't make medical claims. "Cures," "treats," "prevents," "diagnoses" — none of these belong in a calculator page. Use "estimates," "targets," "guidance."

Don't recommend specific products inside the calculator's core sections. The commercial links live in the "Tools & guides" section at the bottom.

Don't link to competitor tools. No Purina calculator, no Royal Canin calculator, no dogfoodadvisor. whitelist.test.ts blocks this.

Don't add nofollow to citation links. Merck, FDA, AAFCO, WSAVA, NRC are exactly the kind of authoritative outbound links Google rewards.

Don't publish a new section without first checking GSC Queries. If a query surfaces but isn't answered, that's a real signal.

Don't rename an H2 or FAQ question without logging the change in § 9. Title/H2/FAQ renames are SEO changes and must be traceable.

Writing tone
Match the PawVortex storefront tone: plain-spoken, second person ("your dog"), no hype. Avoid the "10 things you MUST know" register. Trust the reader.

6. Testing — how SEO regressions get caught
Test	Guards
tests/whitelist.test.ts	Every URL in rendered HTML classifies as source / internal / technical. Blocks AKC, competitors, retailers, social URLs. Failed once when sameAs was added — the fix is documented in the change log.
tests/assets-on-shopify.test.ts	Every .css and .js reference resolves to cdn.shopify.com. AC-19 guard.
tests/no-auth-no-payment.test.ts	No login gate, sign-up form, password/email/card input, or checkout UI. One approved exception (added 2026-11-07): the storefront-parity sign-in link https://account.pawvortex.com/ with text "Sign in with Shop or Google" — the calculator remains fully usable without signing in. Any other login-related element still fails the test.
tests/ui.test.ts	The page renders, form submits, results display correctly. Catches broken template interpolation.
tests/formulas.test.ts	RER, MER, water formula, treats rule, meal frequency all match the Merck/AAHA/WSAVA source values. By-weight example table verified against 1.6 × 70 × kg^0.75 at 350 kcal/cup — audit added 2026-11-07 after the table was found to be off by up to 14%.
Run before every deploy:

bat
npm run ci
Green CI is the deploy gate. Do not push to main if any test fails.

Manual checks after each deploy (5 minutes)
bat
curl -s https://www.pawvortex.com/tools/dog-food-calculator ^
  | findstr /C:"<title>" /C:"og:image" /C:"application/ld+json" /C:"canonical" /C:"dog calorie calculator"
Expected output includes:

<title>Dog Food Calculator — Calories, Cups & Meals | PawVortex</title>

<meta property="og:image" content="https://www.pawvortex.com/cdn/shop/files/dog-food-calculator-us-1200x630.jpg">

<link rel="canonical" href="https://www.pawvortex.com/tools/dog-food-calculator">

One match containing dog calorie calculator — inside <meta name="description">

1 <script type="application/ld+json"> (5 schemas merged)

bat
curl -s https://www.pawvortex.com/tools/dog-food-calculator ^
  | findstr /I "facebook.com instagram.com tiktok.com pinterest.com akc.org plainbowl"
Expected: zero lines. Any match = whitelist regression, do not proceed with launch.

7. Post-launch roadmap (30/60/90 days)
Days 1–30 — Establish
Index via Search Console. Confirm appearance in site:pawvortex.com/tools/dog-food-calculator

Rank for 5–8 of the 14 target keywords at positions 11–30

Quick win #1: appear in top 20 for how much wet food to feed a dog calculator (competitors have zero dedicated wet-food sections)

Quick win #2: begin capturing calorie cluster impressions — GSC shows 3–7 today, target 20–40 by day 30

Content: publish any 3 of the 6 backlinks-targets (see § 2.6) as fresh PawVortex blog posts

Measure: GSC shows ≥ 50 impressions/day by day 30

Days 31–60 — Consolidate
Rank top 10 for ≥ 3 of the long-tail queries

Calorie cluster: expect how many calories should my dog eat calculator to start clicking once title/description are indexed

Improve CTR: if GSC shows CTR < 2% at position 5–8, rewrite the title/meta and re-test after 14 days

Backlinks: cold outreach to 3 pet-industry blogs offering the calculator as a resource. Target: 2 referring domains within 60 days

Add: verify all 9 citations (still false on day 1)

Measure: GSC shows ≥ 15 clicks/day

Days 61–90 — Expand
Rank top 20 for the primary keyword

Content expansion: add 2–3 supporting articles (e.g., "How to read a pet food label," "Merck vs. AAHA feeding ranges")

Second tool: if the calculator is ranking, use docs/DESIGN.md + this file as the template for a Cat Food Calculator — same schema, same internal linking, different keyword clusters

Measure: GSC shows ≥ 40 clicks/day, ≥ 5 queries with 20+ clicks each

Days 91+ — Compound
Quarterly re-audit against the SERP (see § 4)

Watch for algorithm updates

Add new FAQ items from GSC query discovery

8. Reusable patterns for future PawVortex tools
Every tool or app that ships at pawvortex.com/tools/* should follow the same SEO contract.

Pattern checklist for a new tool
□ 1 primary keyword with confirmed Ahrefs data (volume, KD)
□ 3–6 secondary clusters mapped to H2 sections
□ 5–10 FAQ items mapped to queries, no filler
□ Title ≤ 60 chars with primary + 2 secondaries + brand
□ Meta description 120–155 chars with geo + features + trust + secondary keyword cluster
□ H1 ≤ 60 chars with primary + emotional anchor
□ Schema: WebApplication (with alternateName covering the secondary cluster) + FAQPage + BreadcrumbList + Organization (linked to storefront @id) + WebSite (linked to storefront @id) — merged into a @graph
□ Canonical: https://www.pawvortex.com/tools/<slug>
□ OG image: 1200×630, uploaded to Shopify Files, verified via opengraph.xyz
□ Favicon + apple-touch-icon referencing existing storefront assets
□ theme-color = #FFB61A
□ Preconnect to cdn.shopify.com
□ 6+ internal links out + at least 2 inbound internal links from other pages
□ X-Robots-Tag: index,follow on production, noindex on previews
□ Sitemap inclusion
□ whitelist.test.ts extended for any new citation sources
□ no-auth-no-payment.test.ts — if a non-gated sign-in link is added, extend with exact-href/ exact-label exception
□ Mobile sticky bar for result actions (if tool produces a result)
□ Rich Results Test returns 0 errors
□ Mobile-Friendly Test green
□ Lighthouse SEO ≥ 95
What NOT to copy for future tools
HealthApplication schema — wrong category. Use UtilitiesApplication with a specific applicationSubCategory.

HowTo schema — Google deprecated HowTo rich results in 2023.

AggregateRating schema — only after real user ratings exist. Never fabricate.

amp-* variants — AMP is deprecated.

meta keywords — Google ignores.

speakable schema — only makes sense when the primary content is a static answer, not a live calculator.

9. Change log
Date	Version	Change	Author
2026-11-04	1.0	Initial SEO playbook documented from live implementation.	PawVortex
2026-11-07	1.1	Calorie cluster pivot: renamed FAQ #1 to match GSC query (how many calories should my dog eat), added FAQ #2 (kcal calculator for dogs), renamed calorie H2 to include "dog calorie calculator", rewrote meta description to lead with "dog calorie calculator" + "kcal", added alternateName to WebApplication schema. Mobile UX: added § 2.8 sticky action bar documentation, § 2.9 storefront-parity sign-in link (non-gated). Content fix: by-weight example table corrected to match 1.6 × 70 × kg^0.75 at 350 kcal/cup. Testing: documented no-auth-no-payment.test.ts approved exception.	PawVortex
Every future SEO change — new H2, new FAQ, title/meta edit, new internal link, schema change — must add a row here and be accompanied by a commit message matching seo(<scope>): <what changed>.

10. Reference — where in the codebase each element lives
Element	File	Constant / location
<title>	src/server/render.ts	title
<meta name="description">	src/server/render.ts	desc
<h1>	src/server/render.ts	h1
FAQ Q&As (visible + JSON-LD)	src/content/faq.ts	FAQ array
Citations (merck_energy, fda_xylitol, etc.)	src/lib/citations.ts	CITATIONS
Whitelist rules	src/lib/whitelist.ts	classifyUrl, extractUrls
Full @graph schema	src/server/render.ts	schema()
Canonical URL	src/server/render.ts	CANONICAL_ORIGIN, CANONICAL_PATH
OG image URL	src/server/render.ts	OG_IMAGE_URL
Favicon URL	src/server/render.ts	FAVICON_URL
Internal links (blogs, collections)	src/server/render.ts	BLOG_* constants + inline <a href>
By-weight example table	src/server/render.ts	by-weight H2 section — 5 <li> items
Mobile sticky action bar	src/client/main.ts + src/client/styles.css	renderResults() adds .pv-mobile-actions; styles.css has the responsive block
X-Robots-Tag header	api/calculator.ts	res.setHeader('X-Robots-Tag', ...)
Cache-Control	api/calculator.ts	res.setHeader('Cache-Control', 'no-store')
CSP header (blocks non-CDN assets, blocks inline styles)	api/calculator.ts	res.setHeader('Content-Security-Policy', ...)
11. Contact & ownership
SEO owner: PawVortex

Dev owner: changes to src/server/render.ts require npm run ci green

Content sign-off: new H2 or FAQ items that assert a health, feeding, or safety claim require veterinary reviewer sign-off

Mobile UX owner: changes to src/client/main.ts sticky bar behavior require verifying the 6-item checklist in § 2.8

text

---

## Ship

All three files are docs — **no Shopify upload, no client asset change, no env var update.** Pure Git:

```bat
git add README.md docs/DESIGN.md docs/SEO.md
git commit -m "docs: update README (sign-in, sticky bar, by-weight fix); DESIGN v1.1 (sticky bar, sign-in); SEO v1.1 (calorie cluster pivot, GSC logging, testing note)"
git push
Vercel redeploys in ~10s (docs aren't bundled, but Vercel rebuilds on push). Nothing on the live page changes.

What changed vs. the versions you pasted
README.md
Status table: added mobile sticky bar, sign-in link (approved exception), by-weight fix, calorie cluster SEO

Filename references: fixed seo.md → docs/SEO.md (capital S)

Gotchas table: added 2 new rows (by-weight table 394 kcal, mobile save button, no-auth test exemption)

Testing table: no-auth-no-payment.test.ts note now mentions the approved exception

Pre-launch checklist: added /tools breadcrumb verify, @pawvortex verify, mobile sticky bar verify

DESIGN.md
Version 1.0 → 1.1

NEW § 6.10 — Mobile sticky action bar (behavior, CSS, print exception, accessibility, why)

NEW § 6.11 — Storefront-parity sign-in link (CSS, rules, no-gate constraint)

Do/Don't — added "no inline styles" (CSP), "no login gate", "scale storefront logos to 24×24 in header chip", "use sticky bar on mobile"

§ 9.2 per-tool checklist — added sticky bar, mobile 320px test, no-auth test note

§ 10 file reference — added sticky bar JS/CSS, sign-in CSS

§ 11 change log — new 1.1 row

SEO.md
Version 1.0 → 1.1

§ 1: added GSC calorie cluster table with the 3 queries + impressions + action taken

§ 2.1: description rewritten (dog calorie calculator + kcal), documented why

§ 2.2: H2 #2 renamed to Dog calorie calculator: how many calories should your dog eat?

§ 2.3: FAQ count 12 → 13, first question renamed, new kcal question

§ 2.4: schema now includes alternateName (calorie cluster), dateModified bumped

NEW § 2.8 — Mobile UX sticky bar (SEO relevance: engagement + CWV + share signal + verification checklist)

NEW § 2.9 — Storefront-parity sign-in link (SEO relevance + testing implications)

§ 3: pre-launch checklist now includes /tools verify, @pawvortex verify, mobile sticky bar verify

§ 4: weekly + monthly monitoring gained calorie cluster metric rows

§ 6: no-auth-no-payment.test.ts row documents the approved exception + formulas.test.ts row documents by-weight audit

§ 7: quick win #2 = calorie cluster

§ 8: pattern checklist adds alternateName, no-auth test extension, mobile sticky bar

§ 9: change log gained 1.1 row

§ 10: file reference adds by-weight table, sticky bar, sign-in

§ 11: ownership adds mobile UX owner

| 2026-11-08 | 1.2 | **Query-triggered optimizations from GSC:** added `alternateName` entries `Dog Feeding Calculator`, `Dog Nutrition Calculator`, `Puppy Food Calculator` (matching 3 new GSC queries). Rewrote by-weight H2 opener to open with "How much should your dog eat per day?" (matches GSC query `how much should my dog eat calculator`, pos 70.5). Rewrote wet-food H2 opener to open with "How much wet food to feed a dog?" (matches GSC query pos 84). No new FAQs — page already 13 items. **Diagnosis:** all 10 GSC queries at pos 70–97 in the first 5 days post-indexing — this is normal for a new low-DR domain. The primary keyword `dog food calculator` at pos 93 is the leading indicator; other queries inherit its position. Lever to fix: nav link + indexing confirmation + patience, NOT more content. | PawVortex |


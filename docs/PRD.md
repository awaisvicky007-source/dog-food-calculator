# PRD.md - PawVortex Dog Food & Nutrition Calculator 2.0

> **Version 1.5 - build changes.** The original v1.4 text follows unchanged below this block.
> This block records where the shipped code deliberately differs from v1.4, and why.

## v1.5 change log

| # | Area | v1.4 said | v1.5 (as built) | Why |
|---|---|---|---|---|
| 1 | Stack (§16.1) | Next.js 15 + Tailwind | Vite + TypeScript (no framework) for the client; one Vercel function renders the HTML shell | Next emits many chunks under `/_next/` that cannot be mapped onto Shopify's flat CDN. Vite is configured to emit exactly **one JS + one CSS file**, content-hashed, which makes AC-19/20/21 simple and verifiable. Bundle: ~23 KB JS, ~5 KB CSS. |
| 2 | Shopify scopes (§16.6) | "Scopes: none" | `write_files` (or `write_themes`) on a separate admin token used **only in CI** | Uploading assets to Shopify Files/theme requires a scope. The storefront proxy itself still needs none. |
| 3 | Env var names (§16.3/16.5) | `NEXT_PUBLIC_ASSET_*` | `ASSET_CSS_URL`, `ASSET_JS_URL` (server-side) | No Next.js; the function injects the URLs into HTML. |
| 4 | Grams (FR-07) | "approximate if density unknown" | Grams are shown **only** when computable from label data (kcal/kg, or kcal/cup + g/cup); otherwise a prompt | An approximate gram figure would be an invented number (FR-28 spirit). |
| 5 | Approximate cups (FR-06, Open Q2) | "approximate with a clear default" | Blank kcal/cup shows a **range** (300-400 kcal/cup), labelled as an illustrative assumption, not a citation | A single default hides uncertainty; a range shows it. Decision for Open Q2: allow approximate, never require. |
| 6 | Local storage (FR-20) | localStorage + IndexedDB | localStorage only | Data volume is tiny; IndexedDB adds complexity with no benefit yet. |
| 7 | PDF (FR-18) | PDF vet summary | Print stylesheet ("Print / save as PDF") with a "Questions for my vet" block | Fully client-side and private; a PDF library can follow. |
| 8 | Reminders (V1) | .ics, notifications, optional email | **.ics only** (feeding times + reorder date) | Decision for Open Q6: .ics first. Notifications/email deferred. |
| 9 | Goals / BCS (FR-11) | "goal-aware planning" | BCS produces **notices only** (7+ = "not a weight-loss plan, ask your vet"; 3 or lower = vet check). No goal-based calorie cuts | Weight-loss prescribing is a stated non-goal (§3). |
| 10 | Activity (FR-11) | adjustments "sourced" | Light work 2x, moderate work 3x RER, Merck, flagged as wide ranges needing vet confirmation. Heavy work omitted | Published range is very wide; not safe to automate. **Needs vet sign-off (Open Q1).** |
| 11 | Asset home (Open Q7) | undecided | Default **Shopify Files**; theme assets supported via `ASSET_HOME=theme` | Stable URLs across theme publishes. |
| 12 | Species (Open Q4) | open | Dogs only | Scope control. |
| 13 | Package manager | pnpm | npm (lockfile committed) | Fewer moving parts in CI. |
| 14 | Citations (§15) | whitelist | Whitelist enforced in code and CI; each citation carries `verified` / `lastVerifiedAt`; CI warns until a human verifies | Deep links must be confirmed by a reviewer. |
| 15 | Acceptance test | AC-01 | Verified by unit test: 30 lb -> RER 496, MER 794; 350 kcal/cup -> 2.27 cups | Matches the PRD figures. |

### Status against the PRD

| Item | Status |
|---|---|
| FR-01..13 engine, FR-14..19 results | Built, unit-tested |
| FR-20..25 local profiles, export/import, clear-all | Built, UI-tested (clear-all, no network) |
| FR-26..33 catalog + add-to-cart | Add-to-cart built; catalog intentionally empty until label-verified data is supplied |
| FR-34..39 citations, safety, privacy | Built; CI whitelist scan; citations await human verification |
| FR-40..45 SEO / schema | Built (WebApplication, FAQPage, BreadcrumbList, Organization; canonical) |
| FR-46, 49 analytics | Typed event hook, no free text possible; delivery to be wired |
| FR-47, 48 admin audit UI | Not built |
| FR-50..54 assets on Shopify | Scripts + fail-closed handler built; **not yet run against a real store** |
| AC-12, 15, 16, 18, 19 (static), 20 | Automated tests |
| AC-08, 11, 13, 14, 17, 21 | Need the live proxy / Lighthouse / browser E2E |
| OCR, barcode, notifications, email reminders, breed pages | Not built |

---

Product: PawVortex Dog Food Calculator 2.0
Domain: pawvortex.com
Status: Draft for build
Owner: Product, PawVortex
Version: 1.4
Last updated: 2026-11-03

1. Summary
Build a better, PawVortex-owned version of the public “dog food calculator” category currently represented by tools such as PlainBowl’s Dog Food Calculator. The PawVortex tool will calculate a dog’s daily calories (MER), cups/grams, meals, treat budget, and water target; cite every formula and recommendation only to government bodies or high-authority veterinary references (no competitor brands, no AKC); and go beyond the source tool with:

exact food-label kcal/cup input instead of a hidden default,

body-condition and goal-aware planning,

local, no-login multi-pet profiles,

PawVortex catalog integration with transparent, non-dark-pattern recommendations,

printable/PDF vet summary,

label OCR and barcode lookup,

reorder/portion reminders.

The tool is free to use. There is no login wall, no account, and no payment gateway anywhere in the calculator flow. Everything the user needs runs in the browser. Commerce (add-to-cart) hands off to the existing Shopify cart on pawvortex.com — the calculator never handles payment or user identity.

Delivery path: built locally → pushed to GitHub → deployed on Vercel → exposed on pawvortex.com through a Shopify App Proxy. CSS/JS/fonts are served from Shopify assets (theme assets/ or Shopify Files), not from Vercel.

2. Background and source-tool snapshot
The source tool is a dog-food calorie calculator that collects weight, age, and adult body condition; computes RER and MER; and shows cups, grams, meals, treats, water, toxic foods, and citations.

Gaps to beat:

Cups are approximate unless the user separately finds kcal/cup.

Limited personalization: no activity level, body-condition score, goal, food product, or multi-pet support.

No saved plans, reminders, label scan, or vet-ready export.

No store integration for reorder/portion matching.

Citation quality can be inconsistent; PawVortex will enforce a strict whitelist of government and high-authority veterinary sources.

3. Goals and non-goals
Goals
Match or exceed the source tool’s calculation completeness.

Make the output actionable: exact grams/cups when kcal/cup is known; clearly labeled “approximate” otherwise.

Increase PawVortex engagement and repeat purchase without a login wall or payment step in the calculator.

Rank for dog-food-calculator queries with strong SEO and structured data — served on pawvortex.com.

Provide a safe, vet-friendly, printable plan backed exclusively by government and high-authority veterinary citations.

Keep the flow frictionless: no sign-up, no auth, no checkout, no email required to get results.

Serve CSS/JS from Shopify's asset infrastructure so the store owns all user-facing bytes and benefits from Shopify's global CDN.

Non-goals
Diagnosing or treating disease.

Prescribing weight-loss diets.

Replacing veterinary advice.

User accounts, login, subscriptions, or payments — permanently out of scope for the calculator.

Building a full Shopify theme app block for the calculator (proxied page is sufficient for MVP).

4. Success metrics
Metric	Target
Calculator completion rate	≥ 55% of starts
Core Web Vitals (via proxy)	LCP < 2.5s, CLS < 0.1, INP < 200ms
Time-to-first-result (p50)	≤ 20 seconds from page load
Local profile save (no login)	≥ 30% of completed calculations
“Save/print plan” usage	≥ 20% of completed calculations
Add-to-cart from calculator	≥ 6% of completed calculations
Repeat calculator use within 30 days	≥ 15%
CSAT	≥ 4.5/5
Support tickets about “how much to feed”	−25%
SEO: top-10 for target calculator queries	within 6 months
App Proxy uptime / error rate	≥ 99.9% / < 0.5% 5xx
Login prompts shown	0 (hard requirement)
Payment/checkout prompts shown	0 (hard requirement)
Static asset requests served by Vercel in production	0 (hard requirement — all via Shopify CDN)
5. Personas
Busy pet parent — wants a fast answer in cups/grams and a reorder reminder.

First-time dog owner — needs plain-English guidance, meal schedule, treat limits, and toxic-food warnings.

Multi-pet household — needs separate on-device profiles and combined food quantities.

Weight-management owner — needs BCS-aware guidance and a vet discussion sheet.

PawVortex shopper — wants to match a calculated portion to a food sold on PawVortex and add it to cart.

Common trait: none of them want to create an account to find out how much to feed their dog.

6. Scope
MVP
Public calculator served at https://www.pawvortex.com/tools/dog-food-calculator via Shopify App Proxy.

Inputs: dog name optional, weight lb/kg, age value/unit, life stage auto-detect, adult body condition, optional kcal/cup, optional food name.

Outputs: MER calories/day, RER, multiplier, grams, cups (exact if kcal/cup given, otherwise labeled approximate), meals/day, per-meal amount, treat calories, water range, feeding schedule, toxic-food warning, sources.

Local saving via localStorage / IndexedDB: pet profiles, last calculation, and kcal/cup memory persist on the user’s device. No account, no server PII.

Print/share/copy result. No login required at any step.

SEO metadata, FAQ schema, WebApplication schema, breadcrumb schema.

Mobile-first accessible UI.

CSS/JS/fonts served from Shopify assets (theme assets/ or Shopify Files), not Vercel.

V1
Multi-pet local profiles (device-only) with side-by-side comparison.

PDF vet summary.

PawVortex product matching + add-to-cart via Shopify Cart AJAX API (no calculator-side checkout).

Label OCR for kcal/cup (client-side where possible; falls back to server OCR with no PII retention).

Reminders delivered without accounts:

downloadable .ics calendar events,

browser Notification API (user opt-in, device-only),

optional email reminder only if the user voluntarily types an address (single-purpose, deletable, no account created).

Breed-specific pages and internal links.

Later
Barcode scan.

Weight-trend tracking (local).

Partner API.

Localization.

Native Shopify theme app-extension block embedding the calculator on PDPs.

Never: login, user accounts, subscriptions, checkout, or payment gateway inside the calculator.

7. Functional requirements
7.1 Input and calculation engine
FR-01: Accept weight in lb or kg; convert internally to kg.

FR-02: Accept age in weeks, months, or years; auto-detect puppy vs adult. Use Merck’s feeding schedule as the life-stage reference: puppies up to 12 months on puppy diet; older than 12 months = adult diet. Allow a user- or vet-set transition date for large/giant breeds.

FR-03: Compute RER = 70 × (kg ^ 0.75).

FR-04: Compute MER using Merck Veterinary Manual multipliers:

puppies < 4 months: 3 × RER

puppies > 4 months: 2 × RER

adult intact: 1.8 × RER

adult neutered: 1.6 × RER

adult obesity-prone: 1.4 × RER

FR-05: Show the formula and multiplier used, with a Merck citation.

FR-06: Accept optional kcal/cup; compute exact cups = daily kcal ÷ kcal/cup. AAFCO requires calorie statements as kcal/kg and per familiar unit.

FR-07: Compute grams using user-provided or selected food density; if unknown, label approximate.

FR-08: Compute meals/day using Merck’s Feeding Schedule for Puppies:

6–12 weeks: 4 meals · 3–6 months: 3 · 6–12 months: 2 · >12 months: 1 or 2 (default 2)

FR-09: Treat allowance ≤10% of daily calories; show remaining food calories.

FR-10: Water target as a range using Merck’s maintenance fluid formula (30 × kg + 70 mL/24h, or 
132 × kg^0.75
 mL/24h).

FR-11: Optional advanced inputs: BCS (1–9, WSAVA/Merck), activity level, goal. Adjustments clearly labeled and sourced.

FR-12: Never return a plan below a safe minimum without a strong vet warning and emergency CTA.

FR-13: All calculation must succeed client-side with no network call to our servers. Optional server calls (food lookup, OCR) must degrade gracefully.

7.2 Results and actionability
FR-14: Results must show: daily calories, RER and multiplier, grams/day, cups/day and per meal, meals/day, treat calories, water range, feeding schedule, and “what to confirm on the bag.”

FR-15: “Show the math” expansion for every number.

FR-16: “What this plan does not know” block (health conditions, medications, pregnancy, lactation, working/sport dogs, senior disease).

FR-17: Toxic-food warning citing FDA, including xylitol emergency warning.

FR-18: Printable/shareable plan + PDF “Questions for my vet.”

FR-19: “Copy results” action.

7.3 Local profiles (no login)
FR-20: Save pet profiles on the user’s device only (localStorage for the active profile, IndexedDB for history). No server-side PII.

FR-21: Support multiple pets on the same device, each with independent calculations.

FR-22: Remember the last entered kcal/cup per saved food name (device-only) to speed repeat use.

FR-23: Clear-all-data button that wipes local storage in one tap; documented in the privacy page.

FR-24: Export/import profiles as a JSON file so a user can move devices without creating an account.

FR-25: No login, no sign-up, no email verification, no password anywhere in the product.

7.4 Food and commerce integration
FR-26: Search PawVortex catalog by food name/brand.

FR-27: If a PawVortex product has verified kcal/cup, prefill it and show “verified from label.”

FR-28: If no verified value, do not invent one; prompt label entry.

FR-29: Recommendations clearly separated from the calculation and labeled “PawVortex product” or “sponsored.”

FR-30: “Calculate without product recommendations” toggle.

FR-31: Add-to-cart uses the Shopify Cart AJAX API (POST /cart/add.js) on the pawvortex.com origin. The calculator never renders a checkout, never collects card data, and never touches a payment gateway.

FR-32: Food data must have source, last-verified date, and reviewer.

FR-33: No “buy now” / no accelerated checkout inside the calculator. Only standard add-to-cart.

7.5 Safety, citations, and compliance
FR-34: Citation whitelist (enforced). Every formula, feeding schedule, and health claim must cite only:

Merck Veterinary Manual / MSD Veterinary Manual

AAFCO

FDA / Center for Veterinary Medicine

NIH / PubMed Central / Science.gov

WSAVA

National Research Council (NRC)

FR-35: Prohibited sources: AKC, breed clubs, breeder sites, pet-food brand sites (including PawVortex’s own), competitor calculators (including PlainBowl), retail/e-commerce sites, pet blogs.

FR-36: Disclaimer: educational information, not veterinary advice; consult a licensed veterinarian.

FR-37: Original copy and design; no PlainBowl assets.

FR-38: Emergency CTA for toxic ingestion and severe symptoms.

FR-39: Privacy-by-design: no PII collected by default; no tracking of pet health data server-side; analytics events carry no pet names, weights, or free-text fields.

7.6 SEO and content
FR-40: Page title/meta targeting “dog food calculator,” “dog calorie calculator,” “how much to feed my dog.”

FR-41: Structured data: WebApplication, FAQPage, BreadcrumbList, Organization.

FR-42: Internal links use the proxy base path (/tools/dog-food-calculator/...) so navigation stays on pawvortex.com.

FR-43: FAQ content matches visible page content and cited sources.

FR-44: Canonical = https://www.pawvortex.com/tools/dog-food-calculator.

FR-45: Proxied URL added to sitemap; submitted to Search Console under pawvortex.com.

7.7 Analytics and admin
FR-46: Track events: calculator_started, calculation_completed, result_expanded, kcal_cup_entered, profile_saved_local, profile_exported, food_selected, pdf_downloaded, add_to_cart, reminder_created.

FR-47: Admin can edit citations, multipliers, food kcal/cup data, and disclaimer copy with audit log.

FR-48: Admin can flag outdated food data.

FR-49: Analytics must not capture pet names, weights, or free-text input — only event names, counts, and non-identifying dimensions (life-stage bucket, device type).

7.8 Asset delivery
FR-50: All CSS, JS, fonts, and static images must be served from Shopify's CDN, not from Vercel, in production.

FR-51: Asset filenames must be content-hashed (app-<sha8>.css) to allow immutable caching and safe rollout.

FR-52: The HTML shell may be served by Vercel via the proxy; the HTML must reference the Shopify-hosted asset URLs.

FR-53: A CI job must upload/update assets and refresh the URLs used by Vercel on every production deploy.

FR-54: If asset URLs cannot be resolved (Shopify API failure), the deploy must fail closed — do not ship HTML pointing to missing assets.

8. UX flow (no login, no payment)
User lands on https://www.pawvortex.com/tools/dog-food-calculator.

HTML arrives via App Proxy (fast, cache-busted); CSS/JS arrive from Shopify CDN.

Sees calculator above the fold; no signup, no auth, no modal.

Enters weight, age, adult condition; optionally name.

Optional: enters kcal/cup or selects a PawVortex food.

Clicks “Calculate my dog’s plan.” Result appears instantly — no email, no account, no paywall.

Sees summary card; can expand math, treats, water, toxic foods, sources.

Optional: save to this device, download PDF, copy results, add food to cart, create a reminder.

Closing the tab loses nothing that wasn’t explicitly saved on-device.

9. Data model
9.1 Client-side (browser)
LocalPetProfile: id (uuid), name, species, breed, weight_kg, age_value, age_unit, life_stage, body_condition, activity_level, goal, updated_at.

LocalFoodMemory: food_name, kcal_per_cup, last_used_at.

LocalCalculationHistory: last N calculations (inputs + outputs) for quick recall.

9.2 Server-side (aggregate only, no PII)
FoodProduct: id, brand, name, kcal_per_cup, kcal_per_kg, source_type, source_url, last_verified_at, verified_by, shopify_variant_id.

Citation: id, org (whitelist-enforced), title, url, context_key, quote, last_verified_at.

AnalyticsEvent (anonymous): event_name, life_stage_bucket, device_type, shop_domain, created_at.

ProxySession: shop, signature_verified, created_at. No customer ID stored.

There is no User table. There is no Account table. There is no Payment table.

10. Non-functional requirements
Mobile-first, responsive, WCAG 2.2 AA.

No login wall. No auth. No paywall. No checkout in the calculator.

Calculations run fully client-side; server only for optional food lookup and OCR.

Input validation with clear errors.

lb/kg, oz/mL supported.

LCP < 2.5s on 4G as measured through the proxy.

External source links rel="noopener noreferrer", open in new tab.

No dark patterns; recommendations clearly labeled.

Privacy page documents local-only storage and the clear-all button.

Automated citation whitelist check in CI.

HTML served by Vercel; all static assets served by Shopify CDN.

Assets are content-hashed and shipped with Cache-Control: public, max-age=31536000, immutable.

HTML is served Cache-Control: no-store so asset URL bumps take effect immediately.

CSP allows cdn.shopify.com for style-src, script-src, font-src, img-src, connect-src.

11. Acceptance criteria
AC-01: 30 lb, 3-year-old, neutered adult dog → ~794 kcal/day; RER ≈ 496 kcal/day with Merck 1.6× multiplier.

AC-02: kcal/cup = 350 → cups/day ≈ 2.3; blank → labeled approximate + prompt to enter label value.

AC-03: Meals/day = 2 for adult (Merck >12 months).

AC-04: Treat allowance = 10% of daily kcal.

AC-05: Water shown as range from Merck’s maintenance fluid formula.

AC-06: Every formula, feeding claim, and safety warning cites only whitelist sources.

AC-07: Automated scan finds zero AKC, competitor, or brand-site citations.

AC-08: Lighthouse a11y ≥ 95, SEO ≥ 95; FAQ schema validates.

AC-09: No PlainBowl assets/copy.

AC-10: Recommendations can be disabled and are labeled.

AC-11: Proxied URL returns full HTML (not iframe), 
Content-Type: text/html
, 
X-Robots-Tag: index,follow
, canonical to pawvortex.com.

AC-12: Invalid/tampered proxy signatures → 401, no content leak.

AC-13: Add-to-cart from proxied page succeeds via Shopify Cart AJAX API.

AC-14: Preview Vercel deployments are auth-protected and noindex.

AC-15: From cold load to rendered result, the user encounters zero login prompts, sign-up forms, payment UI, and checkout redirects. Verified by automated E2E on every PR.

AC-16: Clearing browser storage removes all locally saved pet data; reload shows a fresh calculator.

AC-17: Export profile → import on a different browser → same calculation reproducible, with no account created.

AC-18: Network tab during a full calculation shows no request carrying pet name, weight, or free-text fields to our servers.

AC-19: In production (through the proxy), the Network tab shows every .css, .js, and font request resolving to cdn.shopify.com — none to vercel.app or to our Vercel deployment.

AC-20: Asset filenames are content-hashed; re-deploying with unchanged code does not change the hashed URL; changing code changes the hashed URL.

AC-21: If the Shopify asset upload step in CI fails, the Vercel production deploy is not promoted; the proxy keeps serving the previous good build.

12. Launch plan
Week	Milestone
1–2	Finalize formulas, whitelist, copy; vet advisor sign-off; scaffold Next.js locally.
3	Build calculator engine + UI locally; unit tests (RER/MER/cups/water/meals); local-profile layer.
4	GitHub repo + CI (lint, types, tests, whitelist scan, E2E “no login/no payment” test); Vercel preview. Asset upload pipeline prototyped (theme assets/ and Shopify Files paths both evaluated).
5	Shopify custom app + App Proxy → Vercel production; HMAC verification tested; assets uploading to Shopify, HTML referencing CDN URLs.
6	QA end-to-end through proxy; accessibility; analytics; legal/privacy review; Lighthouse on pawvortex.com; verify zero Vercel asset requests.
7	Soft launch via theme nav link (10% traffic); A/B test result layout and kcal/cup prompt.
8+	Full launch; V1 (multi-pet local, PDF, catalog, OCR, reminders).
13. Risks and mitigations
Risk	Mitigation
Veterinary liability	Disclaimer, whitelisted citations, vet review, no diagnosis
Food data stale	Last-verified date, admin audit, user label override
Commerce bias perception	Recommendations separated + labeled + disable toggle
Formula misuse for sick dogs	“Not for disease” warnings; vet CTA
Copying source tool	Original copy/design; legal review
OCR errors	User confirmation before use
Citation drift	CI whitelist scan + quarterly audit
App Proxy signature bypass	HMAC-SHA256 on every request; reject unsigned
Proxy latency / cold starts	Logic client-side; warm functions; p95 monitoring
Same-origin cookie confusion	Don’t rely on store cookies; use signed proxy params
Duplicate content (vercel.app vs pawvortex.com)	Canonical + noindex on all non-proxied URLs
Shopify theme changes breaking proxy path	Lock path; monitoring alert on 4xx/5xx
Privacy concerns with saved pet data	Device-only storage, clear-all button, documented on privacy page
Analytics accidentally capturing PII	Event schema with no free-text fields; automated PII check in CI
Accidental login/payment regression	E2E test in CI asserting no auth/payment UI (AC-15)
Theme rotation invalidates asset URLs	Either (a) CI re-uploads assets and refreshes Vercel env on every theme publish, or (b) host assets in account-scoped Shopify Files instead of theme assets. Decision required — see §16.12.
Asset upload failure during deploy	Fail-closed deploy (AC-21); previous good build stays live.
CSP misconfiguration blocks CDN assets	CSP whitelist cdn.shopify.com; smoke test asset loading in CI.
Stale cached HTML pointing to deleted assets	HTML served no-store; assets content-hashed and retained for ≥ 1 year.
14. Open questions
Which veterinary advisor signs off on BCS/WSAVA integration?

Should MVP require kcal/cup or allow approximate cups with a clear default?

Which PawVortex foods have verified kcal/cup at launch?

Dogs only at launch, or cats too?

PDF generator: client-side (e.g., pdf-lib) vs serverless? Prefer client-side for privacy.

Reminder channel priority at launch: .ics first, browser notification second, optional email last?

Asset home: theme assets/ (natural but rotates on theme publish) vs Shopify Files (account-scoped, stable)? Recommend Shopify Files for production stability; theme assets/ acceptable if a re-upload-on-theme-publish automation is in place.

Do we ever add a Shopify theme app-extension block on PDPs (V2), or keep a single proxied page forever?

15. Appendix — Approved citation whitelist
Allowed:

Merck Veterinary Manual — Daily Maintenance Energy Requirements; Feeding Schedule for Puppies; Maintenance Fluid Plan; Body Condition Score Scales.

AAFCO — Calorie content statement requirements.

FDA / CVM — Xylitol toxicity; toxic foods guidance.

NIH / PubMed Central / Science.gov — peer-reviewed energy requirement studies.

WSAVA — Global Nutrition Guidelines; BCS 1–9 scale.

NRC — primary energy requirement data.

Prohibited:

AKC, breed clubs, breeder sites.

Pet-food brand sites (including PawVortex’s own).

Competitor calculators (including PlainBowl).

Retail/e-commerce sites.

General pet blogs and content farms.

Disclaimer: Educational nutrition information based on published sources. Not veterinary advice. Consult a licensed veterinarian for decisions about an individual dog.

16. Build & deployment architecture
16.1 Stack
Framework: Next.js 15 (App Router), TypeScript, Tailwind CSS.

Hosting (HTML): Vercel (production + preview).

Hosting (CSS/JS/fonts): Shopify CDN (theme assets
/
 or Shopify Files — see §16.12).

Source control: GitHub (private repo pawvortex/dog-food-calculator).

Storefront integration: Shopify App Proxy on pawvortex.com.

Database (V1+): Postgres (Neon) for catalog and citations only — never user or pet data.

Auth: None.

Payments: None.

16.2 Repo layout
text
dog-food-calculator/
├── app/
│   ├── calculator/page.tsx
│   ├── api/
│   │   ├── proxy/verify/route.ts
│   │   ├── food/lookup/route.ts
│   │   └── ocr/route.ts
│   └── layout.tsx
├── components/
│   ├── calculator-form.tsx
│   ├── result-card.tsx
│   ├── local-profile-manager.tsx
│   ├── citation.tsx
│   └── math-explainer.tsx
├── lib/
│   ├── formulas.ts
│   ├── citations.ts
│   ├── shopify-proxy.ts
│   ├── local-storage.ts
│   ├── asset-urls.ts            # resolves NEXT_PUBLIC_ASSET_* at render time
│   └── units.ts
├── content/
│   ├── faq.ts
│   └── sources.ts
├── tests/
│   ├── formulas.test.ts
│   ├── whitelist.test.ts
│   ├── no-auth-no-payment.e2e.ts
│   └── assets-on-shopify.e2e.ts  # AC-19 guard
├── scripts/
│   ├── check-whitelist.ts
│   ├── upload-assets.ts          # builds → uploads to Shopify → returns CDN URLs
│   └── refresh-asset-urls.ts     # updates Vercel env vars with new URLs
├── .github/workflows/
│   ├── ci.yml
│   └── upload-assets.yml         # runs on main + on theme-publish webhook
├── vercel.json
└── README.md
16.3 Local development
pnpm install && pnpm dev → http://localhost:3000.

Calculator works standalone locally without Shopify.

In local dev, assets are served by Next.js dev server (fast refresh). Shopify CDN path only kicks in for production.

.env.local: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_BASE_PATH=/tools/dog-food-calculator, NEXT_PUBLIC_ASSET_CSS_URL (optional override), NEXT_PUBLIC_ASSET_JS_URL (optional override).

Internal links use NEXT_PUBLIC_BASE_PATH.

No auth env vars. No payment env vars.

16.4 GitHub
Protected main; PRs require CI green, 1 review, whitelist scan.

CI: install → type-check → lint → unit tests → whitelist scan → E2E no-auth/no-payment → E2E assets-on-shopify → next build.

Repo secrets: VERCEL_TOKEN, SHOPIFY_*, SHOPIFY_THEME_ID (or SHOPIFY_FILES_* for the Files path).

Separate workflow upload-assets.yml runs on main merge and on a manual/webhook trigger (theme publish event) — see §16.12.

16.5 Vercel
Project dog
-food-calculator
, production branch main.

vercel.json: rewrites for /tools/dog-food-calculator → /calculator; CSP header allowing cdn.shopify.com; X-Robots-Tag: noindex on previews.

Production canonical points to pawvortex.com.

No Vercel Auth, no Clerk, no NextAuth.

Env vars include asset URLs (NEXT_PUBLIC_ASSET_CSS_URL, NEXT_PUBLIC_ASSET_JS_URL, NEXT_PUBLIC_ASSET_FONT_BASE), refreshed by scripts/refresh-asset-urls.ts after each asset upload.

16.6 Shopify App + App Proxy
Custom app “PawVortex Tools” on pawvortex.com.

Scopes: none needed for proxy-only content.

Save SHOPIFY_API_KEY / SHOPIFY_API_SECRET.

App Proxy config:

Prefix tools · Subpath dog-food-calculator · Proxy URL https://dog-food-calculator.vercel.app/calculator.

Public URL: https://www.pawvortex.com/tools/dog-food-calculator.

Full HTML returned on pawvortex.com — no iframe.

HMAC-SHA256 signature verification on every proxied request (lib/shopify-proxy.ts), reject with 401 on mismatch.

Install the app to activate the proxy. No admin UI.

16.7 Same-origin behavior
Proxied page is same-origin with pawvortex.com.

Add-to-cart (V1): POST /cart/add.js from the proxied page — no CORS, no auth.

The calculator never renders checkout and never handles payment.

Internal links use the proxy base path.

Do not read PawVortex store cookies for identity; the calculator needs no identity.

16.8 SEO through the proxy
Canonical: https://www.pawvortex.com/tools/dog-food-calculator.

All vercel.app URLs noindex except when served through the proxy.

Add proxied URL to sitemap; submit under pawvortex.com in Search Console.

BreadcrumbList uses pawvortex.com paths.

16.9 Environments & rollout
Environment	HTML served by	Assets served by	Indexed?	Purpose
Local	Next.js dev	Next.js dev	No	Dev
Preview	Vercel (auth)	Next.js on Vercel (dev-mode assets)	No	PR review
Staging	Vercel	Shopify CDN	No	Smoke test
Production (proxy)	Vercel via App Proxy	Shopify CDN	Yes	Users
Feature flags via Vercel Edge Config for V1 items.

Rollback: revert main → Vercel redeploys HTML → previous asset URLs still live on Shopify CDN (content-hashed files retained).

16.10 Monitoring & alerts
Uptime check on the proxied URL every 1 min.

Alerts: 5xx rate > 0.5%, p95 > 800ms, proxy signature failures > 0.1%.

Asset 404 rate alert — any 4xx on cdn.shopify.com paths referenced by our HTML triggers an alert.

Vercel Analytics + Sentry (client errors, no PII).

Weekly automated citation whitelist crawl on rendered HTML.

Weekly automated E2E “no login / no payment / no Vercel asset” smoke test against production.

16.11 Pipeline summary (one line)
Local dev (pnpm dev) → GitHub PR (CI + whitelist + no-auth/no-payment + assets-on-Shopify E2E) → Vercel preview (auth, noindex) → merge to main → build → upload hashed assets to Shopify → refresh Vercel asset URLs → Vercel production → Shopify App Proxy at pawvortex.com/tools/dog-food-calculator (indexed, canonical, free, no login, no payment, all static bytes from Shopify CDN).

16.12 Static assets served from Shopify
Goal: All CSS, JS, fonts, and static images are hosted on Shopify's CDN via the store's own asset infrastructure, not on Vercel. This keeps all user-facing bytes on pawvortex.com's infrastructure, leverages Shopify's global CDN, and matches the store's existing asset pipeline.

How it works
next build produces hashed static files (e.g., app-<sha8>.css, app-<sha8>.js, inter-<sha8>.woff2).

scripts/upload-assets.ts uploads these to the chosen Shopify asset home:

Option A — theme assets/ folder via PUT /admin/api/{version}/themes/{theme_id}/assets.json.

Option B — Shopify Files (Content → Files) via GraphQL fileCreate + stagedUploadsCreate — account-scoped, stable URLs across theme changes.

CI reads back the resolved CDN 
public_url
 for each asset.

scripts/refresh-asset-urls.ts writes the URLs to Vercel env vars:

NEXT_PUBLIC_ASSET_CSS_URL=https://cdn.shopify.com/.../app-<sha8>.css

NEXT_PUBLIC_ASSET_JS_URL=https://cdn.shopify.com/.../app-<sha8>.js

NEXT_PUBLIC_ASSET_FONT_BASE=https://cdn.shopify.com/.../fonts/

Vercel rebuilds (or is redeployed) and the HTML shell now emits:

html
<link rel="stylesheet" href="https://cdn.shopify.com/.../app-<sha8>.css">
<script type="module" crossorigin src="https://cdn.shopify.com/.../app-<sha8>.js"></script>
Browser loads HTML from pawvortex.com (via proxy) and assets directly from cdn.shopify.com.

Why not serve assets from Vercel
Shopify CDN is closer to the user, cached at edge, and stores the store's own traffic anyway.

Keeps CSP tight: only cdn.shopify.com allowed for script-src / style-src.

Avoids duplicating the store's asset footprint.

Makes the "no Vercel asset requests in production" invariant (AC-19) trivial to test.

Theme rotation pitfall (must handle)
Theme asset URLs are bound to theme_id. Publishing a new theme changes the ID, invalidating old URLs.

Two mitigations — pick one:

Preferred: Option B (Shopify Files). Account-scoped, stable URLs, unaffected by theme publishing. Costs slightly more setup (GraphQL file API) but eliminates the class of failure.

Option A + automation. Add a GitHub Action triggered by a Shopify themes/publish webhook (or a scheduled/manual trigger) that re-uploads the current hashed assets to the new theme and refreshes Vercel env vars. Old hashed filenames must remain in the theme for the retention window.

The requirement "serve files on Shopify assets" is honored by either option; Shopify Files is the production recommendation, with theme assets/ acceptable if the re-upload automation is real and tested.

Caching
Filenames are content-hashed → Cache-Control: public, max-age=31536000, immutable (Shopify CDN sets this for theme assets and Files).

HTML is served Cache-Control: no-store via proxy so asset URL bumps take effect immediately.

Retain prior hashed assets for ≥ 1 year to avoid breaking long-lived browser caches.

Cross-origin notes
Assets are cross-origin relative to pawvortex.com. That is fine for <link rel="stylesheet">, <script src>, and <img>.

For ES module scripts, emit crossorigin="anonymous" — Shopify CDN returns Access-Control-Allow-Origin: * which satisfies module CORS.

Fonts: set font-display: swap; Shopify CDN serves CORS-friendly fonts.

CSP
style-src 'self'
https://cdn.shopify.com;

script-src 'self' https://cdn.shopify.com;

font-src 'self' https://cdn.shopify.com;

img-src 'self' https://cdn.shopify.com data:;

connect-src 'self' https://cdn.shopify.com; (only if any asset is fetched via fetch())

Source maps
Uploaded to Vercel/Sentry only. Never uploaded to Shopify assets.

Fail-closed deploy
If asset upload or URL refresh fails, the CI pipeline must block Vercel promotion (AC-21). The proxy keeps serving the previous build, whose asset URLs are still live on Shopify CDN.
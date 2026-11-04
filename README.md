# PawVortex Dog Food Calculator 2.0

Free dog calorie / food calculator for **pawvortex.com/tools/dog-food-calculator**.
No login, no account, no payment, no checkout. Calculations run in the browser; saved pets stay on the device.
Every number cites only government / veterinary authorities (Merck/MSD Vet Manual, AAFCO, FDA, NIH, WSAVA, NRC).

Spec: [`docs/PRD.md`](docs/PRD.md) (v1.5 - see the change log at the top).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  (same HTML shell the production function serves)
npm run ci         # typecheck + 36 tests + citation whitelist scan + production build
```

## How it fits together

```
Browser ──> pawvortex.com/tools/dog-food-calculator ──(Shopify App Proxy, HMAC-signed)──> Vercel  api/calculator.ts
                                                                                              │ returns the HTML shell (SEO + JSON-LD)
Browser <── app-<hash>.css / app-<hash>.js  <──────────────────── cdn.shopify.com <──── CI uploads hashed build output
```

| Path | Purpose |
|---|---|
| `src/lib/formulas.ts` | RER / MER / cups / grams / meals / treats / water + "show the math" steps |
| `src/lib/citations.ts`, `whitelist.ts` | Approved sources and the enforcement rules |
| `src/server/render.ts` | Server-rendered HTML shell: form, FAQ, sources, JSON-LD (WebApplication, FAQPage, BreadcrumbList, Organization) |
| `src/server/shopify-proxy.ts` | App Proxy HMAC-SHA256 verification |
| `api/calculator.ts` | Vercel function: verify signature, fail closed if assets missing, set CSP / robots / no-store |
| `src/client/*` | UI, device-only storage, .ics reminders, privacy-safe analytics hook, add-to-cart |
| `scripts/upload-assets.ts` | Upload hashed CSS/JS to Shopify Files (or theme assets) |
| `scripts/refresh-asset-urls.ts` | Verify assets are live, write URLs to Vercel env, trigger redeploy |
| `.github/workflows/` | `ci.yml` on PRs; `upload-assets.yml` on main (build → upload → refresh → redeploy; any failure stops promotion) |

## Deploy checklist

1. **GitHub** - push this repo (private), protect `main`, require `ci.yml`.
2. **Shopify** - create a custom app "PawVortex Tools". Admin API scope **`write_files`** (or `write_themes` if `ASSET_HOME=theme`) for the CI upload token. Configure the App Proxy: prefix `tools`, subpath `dog-food-calculator`, proxy URL `https://<your-project>.vercel.app/calculator`. Install the app.
3. **Vercel** - import the repo as a project. Set `SHOPIFY_API_SECRET`. Create a Deploy Hook. Do **not** set `ALLOW_UNSIGNED` in production (it is ignored there anyway).
4. **GitHub secrets** - `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN`, `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` (if any), `VERCEL_DEPLOY_HOOK_URL` (+ `SHOPIFY_THEME_ID` only for theme mode).
5. Run the **Upload assets** workflow once. Then open the public URL and check the Network tab: all `.css`/`.js` must come from `cdn.shopify.com` (AC-19).
6. Add the URL to the sitemap and submit it in Search Console under pawvortex.com.

## Before launch - human tasks (not done by this repo)

- **Verify every citation.** All entries in `src/lib/citations.ts` are `verified: false`. Open each URL, confirm it still supports the claim, then set `verified: true` and `lastVerifiedAt`. Deep links were written from memory and may have moved.
- **Veterinary sign-off** on multipliers (activity "light/moderate work" = 2x / 3x RER), BCS notices, and the 10% treat rule, plus the wording of every warning.
- **Fill the catalog.** `src/client/catalog.ts` ships empty on purpose (FR-28: never invent kcal/cup). Add only label-verified products with their Shopify variant IDs; the product UI appears automatically.
- **Wire analytics.** The client calls `window.PawVortexAnalytics(...)` if you define it. Event names and dimensions are type-restricted so pet names/weights cannot be sent.
- **Browser E2E.** Tests here include a jsdom UI test and static no-login / no-payment / assets-on-Shopify guards. Add Playwright against the live proxy URL for AC-11/13/19 and Lighthouse (AC-08).

## Known limits

- `scripts/upload-assets.ts` and `refresh-asset-urls.ts` follow Shopify's and Vercel's documented APIs but have **not** been run against a real store/project. Run the first deploy manually and watch the logs.
- Not built yet (PRD "Later"/V1): label OCR, barcode scan, browser-notification and email reminders, admin audit UI, breed pages, Neon catalog DB, PDF via a library (print-to-PDF stylesheet is used instead).

\# PawVortex Dog Food Calculator 2.0



Free dog food calculator and dog calorie calculator, live at \*\*https://www.pawvortex.com/tools/dog-food-calculator\*\*.



No login, no account, no payment, no checkout. Calculations run in the browser; saved pets stay on the device (localStorage). Every number cites only government / veterinary authorities — Merck Veterinary Manual, AAFCO, FDA, WSAVA, NRC. No AKC, no competitor tools, no brand sites.



\*\*Spec:\*\* \[`docs/PRD.md`](docs/PRD.md). \*\*Design system:\*\* \[`docs/DESIGN.md`](docs/DESIGN.md). \*\*SEO playbook:\*\* \[`docs/SEO.md`](docs/SEO.md). All three are reusable templates for future PawVortex tools.



\---



\## Status (2026-11-07)



| Area | State |

|---|---|

| Core calculator | ✅ Live and correct |

| Math audit vs US standards | ✅ Verified (Merck RER, AAHA multipliers, WSAVA 10%, AAFCO labels) |

| Water formula | ✅ Drinking-water target (44–66 mL/kg), not maintenance fluids |

| By-weight example table | ✅ Corrected — all 5 rows match `1.6 × 70 × kg^0.75` at 350 kcal/cup |

| Citation URLs | ✅ All 9 point at live pages |

| Citation `verified` flags | ⚠️ All still `false` — human verification pending |

| Brand palette applied | ✅ Amber system, WCAG AA text contrast |

| Mobile sticky action bar | ✅ `Save as PDF / Save / Copy` pinned to viewport bottom on ≤700px |

| Sign-in link | ✅ Storefront-parity link in hero (`https://account.pawvortex.com/`), approved exception to no-auth test |

| Save / PDF / print / compare | ✅ Working |

| Shopify App Proxy | ✅ HMAC-verified, live on pawvortex.com |

| SEO — calorie cluster | ✅ Meta description, H2, kcal FAQ, schema `alternateName` updated to capture GSC impressions |

| Client asset pipeline | ⚠️ \*\*Manual\*\* (CI workflows exist, secrets not yet set) |

| Search Console submission | ⚠️ Not yet done |

| Storefront nav link | ⚠️ Not yet added |



\---



\## Quick start



```bash

npm install

npm run dev        # http://localhost:5173 — renders the same shell as production

npm run ci         # typecheck + 36 tests + citation whitelist scan + production build

How it fits together

text

Browser ──> pawvortex.com/tools/dog-food-calculator

&#x20;            │  (Shopify App Proxy — HMAC-SHA256 signed)

&#x20;            ▼

&#x20;          Vercel  api/calculator.ts

&#x20;            │  · verifies signature

&#x20;            │  · sets CSP, robots, no-store headers

&#x20;            │  · returns server-rendered HTML shell (SEO + JSON-LD)

&#x20;            ▼

Browser <── app-<hash>.css / app-<hash>.js

&#x20;            from cdn.shopify.com  (Shopify Files upload)

Three environments, three deployment paths:



Layer	Deploys on	Notes

HTML shell (server function)	git push → Vercel auto-deploy	api/\*, src/server/\*, src/lib/\*, src/content/\*

Client bundle (CSS + JS)	Manual upload → Shopify Files → update Vercel env → redeploy	src/client/\*

Storefront route	Shopify App Proxy config	Must match tools / dog-food-calculator

Repository layout

Path	Purpose

src/lib/formulas.ts	RER / MER / cups / grams / meals / treats / water + math steps

src/lib/citations.ts	Approved sources — 9 entries, all verified: false until human review

src/lib/whitelist.ts	Enforcement rules; blocks AKC, competitors, retailers, social URLs

src/server/render.ts	Server HTML shell: hero, form, content sections, FAQ, sources, tools \& guides, JSON-LD @graph

src/server/shopify-proxy.ts	App Proxy HMAC-SHA256 verification

api/calculator.ts	Vercel function: signature gate, asset fail-closed, headers

src/client/main.ts	UI, form handling, save/PDF/print/compare, toast, mobile sticky action bar

src/client/styles.css	Brand palette + WCAG AA text colors + sticky bar CSS (see docs/DESIGN.md)

src/client/storage.ts	localStorage-only persistence (no server PII)

src/client/ics.ts	.ics reminder generation

src/client/catalog.ts	Product list — ships empty (FR-28: never invent kcal/cup)

scripts/upload-assets.ts	Upload hashed CSS/JS to Shopify Files

scripts/refresh-asset-urls.ts	Write URLs to Vercel env, trigger deploy hook

.github/workflows/	ci.yml on PRs; upload-assets.yml on main

docs/PRD.md	Product requirements (change log at top)

docs/DESIGN.md	Brand + component + accessibility system (reusable)

docs/SEO.md	Keyword strategy, on-page contract, monitoring, monitoring cadence (reusable)

How to make a change — the real workflow

The hardest lesson of this project: two different pipelines, one codebase. Get this wrong and you'll deploy old bytes to production while thinking everything is fine.



Change is in src/server/ or src/lib/ or src/content/ or api/

These compile into the Vercel function. Pure Git flow:



bat

npm run ci

git add -A \&\& git commit -m "..." \&\& git push

Vercel redeploys in \~60s. No Shopify upload. No env var change.



Change is in src/client/ (main.ts, styles.css, storage.ts, catalog.ts, analytics.ts, ics.ts)

These compile into dist/app-<hash>.{css,js}. Vercel will rebuild them, but the HTML shell references ASSET\_\*\_URL env vars — Vercel does not update those automatically. You must:



bat

npm run build

Note the two new hashes (both change if either CSS or JS changed):



text

dist/app-NEWHASH1.css

dist/app-NEWHASH2.js

Shopify → Content → Files → Upload files — upload both new files. Never overwrite an existing hashed file (CDN caches immutable, max-age=31536000 — one year — and will serve old bytes forever).



Click each file → Copy link. Both must be cdn.shopify.com/.../files/app-NEWHASH\*.



Vercel → Settings → Environment Variables → Production — update ASSET\_CSS\_URL AND ASSET\_JS\_URL. Both, every time.



Redeploy (Vercel → Deployments → ⋯ → Redeploy → uncheck cache).



Hard reload (Ctrl+Shift+R) and verify in View Source that the <link> and <script src> both show the new hashes.



Rule of thumb

Prefix	Pipeline	Verify by

src/server/, src/lib/, src/content/, api/, docs/	git push	Vercel Deployments page shows Ready

src/client/	git push + npm run build + manual Shopify upload + Vercel env update + redeploy	View Source shows new CSS/JS hash

Never edit an uploaded Shopify file's content in-place. Always upload under the new hash. Filename changes are the only reliable cache bust.



Deploy checklist (fresh install)

GitHub — push repo (private), protect main, require ci.yml.



Shopify — custom app "PawVortex Tools". App Proxy: prefix tools, subpath dog-food-calculator, proxy URL https://<project>.vercel.app/calculator. Install the app.



Vercel — import repo. Set SHOPIFY\_API\_SECRET on Production. Set ASSET\_CSS\_URL + ASSET\_JS\_URL on Production after first asset upload.



Shopify Files — upload dist/app-\*.{css,js} after npm run build. Copy CDN URLs into Vercel env.



Verify through the proxy — https://www.pawvortex.com/tools/dog-food-calculator renders with all static bytes from cdn.shopify.com (AC-19), zero from vercel.app.



Sitemap — add URL, submit to Search Console under pawvortex.com.



Optional: automate the client upload

The repo ships .github/workflows/upload-assets.yml. It runs on main and: builds → uploads hashed files → writes URLs to Vercel env → triggers deploy hook. Blocked only on 5 GitHub Secrets being set:



Secret	Source

SHOPIFY\_STORE\_DOMAIN	cv0utg-dv.myshopify.com

SHOPIFY\_ADMIN\_TOKEN	Custom app → Admin API token (scope write\_files)

VERCEL\_TOKEN	vercel.com/account/tokens

VERCEL\_PROJECT\_ID	Vercel → Settings → General

VERCEL\_DEPLOY\_HOOK\_URL	Vercel → Settings → Git → Deploy Hooks

Once set, git push is the only command needed for either change type. This is worth 20 minutes to set up — it eliminates the entire "did my client change deploy?" class of bug.



Pre-launch remaining tasks

Blocking

□ Verify all 9 citations. Open each URL in src/lib/citations.ts, confirm it still supports the claim, then set verified: true and lastVerifiedAt: 'YYYY-MM-DD'. CI will warn until done.

□ Veterinary sign-off on multipliers (AAHA ranges), BCS notices, 10% treat rule wording, and safety-card copy.

□ Verify /tools breadcrumb resolves. If /tools 404s, either create the page (Shopify → Pages → handle tools) or drop the middle breadcrumb from both visible nav and JSON-LD.

□ Upload OG image to Shopify Files as dog-food-calculator-us-1200x630.jpg. Verify at https://www.opengraph.xyz/url/https://www.pawvortex.com/tools/dog-food-calculator.

□ Verify @pawvortex exists on X. If not, delete <meta name="twitter:site"> from render.ts.

□ Add nav link — Shopify theme → Header menu → "Dog Food Calculator" → /tools/dog-food-calculator. Add to Footer menu. This is the highest-impact SEO action — turns the orphan into a linked entity.

□ Search Console — inspect https://www.pawvortex.com/tools

/dog-food-calculator

, request indexing.

Nice-to-have

□ Fill src/client/catalog.ts with label-verified products + Shopify variant IDs (adds "PawVortex product" recs under results).

□ Wire window.PawVortexAnalytics(...) — GA4, Meta Pixel, or Shopify Web Pixels.

□ Playwright E2E against the live proxy URL for AC-11/13/19 + Lighthouse for AC-08.

□ Set the 5 GitHub Secrets and let upload-assets.yml take over (see above).

Known gotchas (learned the hard way)

Symptom	Cause	Fix

Function returns 500, log shows Cannot find module '/var/task/src/server/render'	Node ESM requires .js extension on relative imports	All .ts → .js in imports (already fixed)

Function returns 500, log shows FUNCTION\_INVOCATION\_FAILED with no trace	Env var missing on Production scope, or missing redeploy after adding	Add on Production + redeploy (env changes don't apply to running deploys)

Proxied URL returns {"error":"unauthorized"}	SHOPIFY\_API\_SECRET on Vercel ≠ app's API secret key	Copy from Shopify → API credentials → API secret key (not API key), paste, redeploy

Proxied URL returns "There was an error in the third-party application"	Shopify forwarded, but Vercel returned non-2xx	Check Vercel function logs for the actual error

Proxied URL returns Shopify 404	App Proxy not installed on store	Uninstall + reinstall the app; verify proxy path in Shopify admin

Client change doesn't appear on live page after git push	Client bundle uploads manually — Vercel rebuilds dist/ but doesn't update ASSET\_\*\_URL	Follow "Change is in src/client/" workflow above

Uploaded new JS content to existing Shopify file, page still shows old	Shopify CDN caches immutable, max-age=31536000 per filename	Never overwrite — upload under the new hash (app-NEWHASH.js)

Asset URLs redirect to www.pawvortex.com	Uploaded to theme assets, not Files — or vice versa	Use the exact URL shape from Shopify admin → Content → Files → click file → Copy link

.env changes don't take effect	Vercel doesn't retroactively apply to running deploys	Redeploy after every env change

By-weight example table shows 394 kcal for 10 lb dog	Old table used a different formula	Fixed — all 5 rows now match 

1.6 × 70 × kg^0.75

&#x20;(see render.ts)

Mobile users miss the "Save as PDF" button	Button was at bottom of results, below the fold	Fixed — sticky action bar appears at viewport bottom on ≤700px

no-auth-no-payment.test.ts fails on sign-in link	Test blocks any "sign in" text or /account href	Test now permits one exact href (account.pawvortex.com/) with one exact label — see test comment

Testing

bash

npm run ci        # full suite: typecheck + test + whitelist scan + build

npm run test      # 36 tests

npm run whitelist # citation URL classification audit

Test files:



File	Coverage

tests/formulas.test.ts	RER, MER, cups, grams, water, meals, treats, validation + US-standards audit

tests/ui.test.ts	jsdom UI test — form, calculation, escape, save, clear

tests/shopify-proxy.test.ts	HMAC compute + verify (tampered, wrong secret, missing signature)

tests/no-auth-no-payment.test.ts	AC-15 guard — no login gate, no payment UI. One approved exception: storefront-parity sign-in link (account.pawvortex.com/) — calculator is fully usable without signing in

tests/assets-on-shopify.test.ts	AC-19 guard — every CSS/JS reference from cdn.shopify.com

tests/whitelist.test.ts	AC-07 guard — no AKC, competitor, or retailer citations

Known limits

scripts/upload-assets.ts and scripts/refresh-asset-urls.ts follow Shopify + Vercel documented APIs but have not been run end-to-end against this store — the current pipeline is manual. Set the 5 GitHub Secrets to enable them.



Not built (PRD "Later"/V1): label OCR, barcode scan, browser-notification reminders, email reminders, breed-specific pages, Neon catalog DB, server-side PDF rendering (print-to-PDF stylesheet is used instead).



Saved pet profiles are per-browser only. No account, no sync, no export to another device except the JSON Export/Import button.



The sign-in link in the hero is a convenience link for existing customers; it does not gate any calculator functionality.



License \& provenance

Private project for PawVortex. All copy, design, and code are original. Source citations in src/lib/citations.ts are referenced, not reproduced.



Contact: hello@pawvortex.com


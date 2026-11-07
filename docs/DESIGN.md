
---

## File 2 — `docs/DESIGN.md`

```markdown
# PawVortex Design System

**Purpose:** A single reference for brand, color, typography, components, and accessibility rules across every PawVortex web tool and app. The dog food calculator (`/tools/dog-food-calculator`) is the reference implementation.

**Version:** 1.1 · **Last updated:** 2026-11-07

---

## 1. Brand foundation

PawVortex is a **warm, trustworthy, pet-focused** brand. The visual signature is **amber** (energy, warmth, dogs/cats in sunlight) paired with **warm cream** (approachable, not clinical). Everything else is neutral.

The storefront (Dawn 15.3 theme) uses amber as the primary action color throughout: buttons, announcement bars, category cards, hover states. Any tool that ships under `pawvortex.com/tools/...` must feel native to that surface.

---

## 2. Color system

### 2.1 The two-amber rule (most important rule in this document)

Amber is **bright and energetic**, which makes it excellent for **backgrounds, borders, gradients, and fills** — and **terrible as text on light backgrounds**.

| Role | Color | Contrast on cream (#FFFEF2) | WCAG AA (text) |
|---|---|---|---|
| Bright amber (decorative) | `#FFB61A` | 1.9:1 | ❌ Fail |
| Bright amber (decorative) | `#FF8A00` | 2.4:1 | ❌ Fail |
| Bright amber (decorative) | `#FFCC33` | 1.6:1 | ❌ Fail |
| **Dark amber (text-safe)** | **`#8F4D00`** | **6.4:1** | ✅ **Pass** |
| Dark amber hover | `#6B3900` | 9.6:1 | ✅ Pass |

**Rule:** Bright amber is **never** used as text color. Any amber text — links, citations, tags, interactive labels, hover states — uses `#8F4D00` (hover: `#6B3900`).

The one exception: **white or near-black text on amber backgrounds** is fine. The Calculate button (`#1A0A00` text on `#FF8A00 → #FFCC33` gradient) is 7.9–12.7:1 and passes comfortably.

### 2.2 Full palette

**Primary amber — for decoration only**

| Hex | Role | CSS var |
|---|---|---|
| `#FFB61A` | Meta theme color, underlines, accents | `--pv-amber` |
| `#FF8A00` | Gradient start, hover shadow | `--pv-amber-dark` |
| `#FFCC33` | Gradient end | `--pv-amber-light` |
| `#FFF5E6` | Soft tint (notes, highlights, hover fills) | `--pv-amber-soft` |
| `#FFE9BF` | Deeper tint (tag chips) | — |

**Text-safe amber — for text only**

| Hex | Role | CSS var |
|---|---|---|
| `#8F4D00` | Links, citations, tags, interactive labels | `--pv-amber-text` |
| `#6B3900` | Hover / focus state | `--pv-amber-text-hover` |
| `#7A4A00` | Warning-card body copy (on `#FFF8EB`) | — |
| `#5E4400` | Warning-card secondary text | — |

**Neutrals**

| Hex | Role | CSS var |
|---|---|---|
| `#1A1A1A` | Primary text, headings | `--pv-ink` |
| `#1A0A00` | Text on amber gradient buttons | `--pv-button-text` |
| `#5E5E5E` | Muted / secondary text | `--pv-ink-soft` |
| `#767676` | Form placeholder (4.5:1 — WCAG AA) | — |
| `#FFFEF2` | Page background (warm cream) | `--pv-bg` |
| `#FFFFFF` | Card / input background | `--pv-card` |
| `#F0EDE0` | Card + input border | `--pv-border` |
| `#FFF5E6` | Mobile menu gradient start | — |
| `#FFFDF8` | Card accent background (pet rows, form sections) | — |

**Semantic / system**

| Hex | Role | CSS var |
|---|---|---|
| `#B42318` | Error / danger | `--pv-danger` |
| `#7A1210` | Error text (darkens for AA) | `--pv-danger-text` |
| `#FEF2F2` | Error background | — |
| `#FCA5A5` | Error border | — |
| `#FFF8EB` | Warning card background | — |
| `#FFE0A3` | Warning card border | — |

**Overlays / shadows**

| Value | Use |
|---|---|
| `rgba(0,0,0,0.05)` | Card shadow (default) |
| `rgba(0,0,0,0.25)` | Toast shadow |
| `rgba(255,138,0,0.25)` | Amber button glow |
| `rgba(255,182,26,0.22)` | Input focus ring |
| `rgba(0,0,0,0.5)` | Modal overlay |

### 2.3 Reserved from storefront (do not use in tools)

The storefront uses several colors for **Judge.me reviews**, **chat widget**, **cart drawer**, and **Shopify Pay** — these are third-party or theme-internal and must not appear in tools:

- `#108474` — Judge.me brand green (never use green — the tool has no green)
- `#C5F7F0` / `#EDF5F5` — Judge.me review form backgrounds
- `#FFAA00` / `#FA0` / `#FFB000` / `#FFD700` — star rating colors (reviews only)
- `#F8FAFC` / `#F1F5F9` / `#E2E8F0` — chat widget neutrals
- `#111827` — chat user message background

**If you see green, cyan, or "review yellow" in a tool, that's a bug — the palette has drifted.**

---

## 3. Contrast table (measured)

Every color pair used in the calculator is verified against WCAG 2.2 AA (4.5:1 normal text, 3:1 large text / UI components).

| Foreground | Background | Ratio | Normal text | Large text |
|---|---|---|---|---|
| `#1A1A1A` (ink) | `#FFFEF2` (cream) | 16.7:1 | ✅ AAA | ✅ AAA |
| `#1A1A1A` (ink) | `#FFFFFF` (card) | 17.6:1 | ✅ AAA | ✅ AAA |
| `#5E5E5E` (muted) | `#FFFEF2` | 6.4:1 | ✅ AA | ✅ AAA |
| `#5E5E5E` (muted) | `#FFFFFF` | 6.9:1 | ✅ AA | ✅ AAA |
| `#8F4D00` (amber text) | `#FFFEF2` | 6.4:1 | ✅ AA | ✅ AAA |
| `#8F4D00` (amber text) | `#FFFDF8` | 6.2:1 | ✅ AA | ✅ AAA |
| `#6B3900` (amber hover) | `#FFF5E6` | 8.6:1 | ✅ AAA | ✅ AAA |
| `#1A0A00` (button text) | `#FF8A00` (gradient start) | 8.2:1 | ✅ AAA | ✅ AAA |
| `#1A0A00` (button text) | `#FFCC33` (gradient end) | 12.4:1 | ✅ AAA | ✅ AAA |
| `#7A1210` (error text) | `#FEF2F2` (error bg) | 8.9:1 | ✅ AAA | ✅ AAA |
| `#7A4A00` (warning text) | `#FFF8EB` (warning bg) | 8.1:1 | ✅ AAA | ✅ AAA |
| `#767676` (placeholder) | `#FFFFFF` | 4.66:1 | ✅ AA | ✅ AAA |
| `#FFFFFF` (toast text) | `#1A1A1A` | 17.6:1 | ✅ AAA | ✅ AAA |

**No pairs on this page fail WCAG AA.** Before adding a new pair, measure at <https://webaim.org/resources/contrastchecker/>.

---

## 4. Typography

**Font stack** (no web font load — uses system UI to match storefront `Instrument Sans` fallback):

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Instrument Sans', Roboto, Helvetica, Arial, sans-serif;
Monospace (math steps, citations only):

css
'SF Mono', Consolas, Monaco, 'Courier New', monospace
Type scale
Element	Size	Weight	Line-height	Color
Page H1	36px (2.25rem)	700	1.15	#1A1A1A
Section H2	20–24px	700	1.25	#1A1A1A
Card H3	16px	600	1.35	#1A1A1A
Body	16px	400	1.55	#1A1A1A
Lead / intro	17px	400	1.5	#5E5E5E
Label	14px	600	1.35	#1A1A1A
Small / hint	13px	400	1.5	#5E5E5E
Stat value (large number)	22px	700	1.15	#1A1A1A
Stat label (uppercase)	12px	600	1.3	#5E5E5E, letter-spacing: 0.5px
Tag / pill	11–13px	600–700	1.3	varies
Min body size: 16px. Never smaller for primary reading text. Hints and captions may be 13px but must be #5E5E5E or darker.

Mobile inputs: 16px minimum to prevent iOS auto-zoom on focus.

5. Spacing & layout
Spacing scale (8px base):

Token	Value	Use
xs	4px	Icon gaps, inline
sm	8px	Form row gaps, tag padding
md	12px	Card padding (tight), button padding
lg	16px	Field gaps, card section gaps
xl	20–24px	Card padding, section gaps
2xl	32px	Section top/bottom
3xl	40–48px	Hero
Grid:

Max width: 1080px, centered, 20px side padding

Two-column at ≥900px: minmax(0, 1.7fr) minmax(0, 1fr) — form/results left, sidebar right

One column below 900px

Stat cards: repeat(auto-fit, minmax(200px, 1fr)) inside #results

Border radius:

Element	Radius
Card	10px (--pv-radius)
Button	8px
Input / select	6px
Tag / pill	4px or 999px
Toast	8px
Shadows:

Default card: 0 2px 8px rgba(0,0,0,0.05)

Toast: 0 6px 24px rgba(0,0,0,0.25)

Primary button glow: 0 4px 14px rgba(255,138,0,0.25)

6. Component library
Reference implementations live in src/client/styles.css and src/server/render.ts. Class names below are the canonical ones.

6.1 Buttons
Primary (.btn.primary)

css
background: linear-gradient(90deg, #FF8A00, #FFCC33);
color: #1A0A00;              /* 7.9–12.7:1 on gradient */
padding: 14px 22px;
font-size: 16px;
font-weight: 600;
border-radius: 8px;
box-shadow: 0 4px 14px rgba(255,138,0,0.25);
Full-width inside forms. Never put amber or cream text on this gradient. Only dark ink text.

Ghost (.btn.ghost)

css
background: #FFFFFF;
border: 1px solid #F0EDE0;
color: #1A1A1A;
Hover: border #FFB61A, background #FFF5E6, text #6B3900.

Danger (.btn.danger)

css
background: #FFFFFF;
border: 1px solid #E5C0BC;
color: #7A1210;
Hover: background #FEF2F2, border #B42318.

Rule: every button is ≥44px tall (WCAG touch target). Use min-height: 44px.

6.2 Cards
css
background: #FFFFFF;
border: 1px solid #F0EDE0;
border-radius: 10px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0,0,0,0.05);
Heading inside card: border-bottom: 2px solid #FFB61A — amber underline is the visual signature. Do not replace with green, blue, or gray.

Warning card variant (.danger-card):

css
background: #FFF8EB;
border: 1px solid #FFE0A3;
Body copy #7A4A00 (8.1:1). Links #8F4D00 underlined. Heading underline uses #FFAB0D.

6.3 Form fields
css
padding: 10px 12px;
font-size: 16px;             /* prevents iOS zoom */
border: 1px solid #F0EDE0;
border-radius: 6px;
background: #FFFFFF;
color: #1A1A1A;
Focus: border-color: #FFB61A; box-shadow: 0 0 0 3px rgba(255,182,26,0.22).

Placeholder: #767676 (4.66:1 — WCAG AA).

Labels: font-weight: 600; font-size: 14px; above the field, with optional .opt suffix in #5E5E5E for "(optional)".

6.4 Notes / callouts
Info callout:

css
background: #FFF5E6;
border-left: 3px solid #FFB61A;
border-radius: 0 6px 6px 0;
padding: 10px 14px;
color: #1A1A1A;
Warning note (.notes li.warn):

css
background: #FEF2F2;
border-left-color: #B42318;
color: #7A1210;
Rule: never use bright amber as text inside these blocks — only as border / background.

6.5 Stat cards
Grid layout showing:

Small uppercase label: 12px, 600, #5E5E5E, letter-spacing: 0.5px

Big value: 22px, 700, #1A1A1A with <small> units at 13px, 500, #5E5E5E

Sub-line: 12px, 400, #5E5E5E

Background #FFFDF8, border 1px solid #F0EDE0, padding 14px 16px, radius 8px.

6.6 Tags / pills
Pill (.pills li) — the "No account / Show-the-math / Veterinary sources only" trio at the top:

css
background: #FFFFFF;
border: 1px solid #F0EDE0;
border-radius: 999px;
padding: 6px 14px;
font-size: 13px;
font-weight: 500;
color: #1A1A1A;
Prefix with ::before { content: '✓'; color: #8F4D00; } — dark amber check, not bright amber.

Tag (.tag) — "PawVortex product" chip:

css
background: #FFE9BF;
color: #8F4D00;              /* 6.04:1 on this background */
font-size: 11px;
font-weight: 700;
padding: 2px 8px;
border-radius: 4px;
text-transform: uppercase;
letter-spacing: 0.5px;
6.7 Toast (save/error confirmation)
css
background: #1A1A1A;         /* dark ink, not amber */
color: #FFFFFF;
border-left: 4px solid #FFB61A;
padding: 12px 20px;
border-radius: 8px;
box-shadow: 0 6px 24px rgba(0,0,0,0.25);
font-size: 14px;
font-weight: 500;
Error variant (.pv-toast--err): background: #B42318; border-left-color: #FCA5A5;

Position: fixed, top 16px, center horizontally, z-index: 10000. Auto-dismiss at 3200ms. Transition 0.25s ease on opacity + translateY. Respect prefers-reduced-motion.

Why dark, not amber: a toast must interrupt — amber toasts blend into the amber page. A dark toast with an amber left-bar signals "new event" while staying on-brand.

6.8 Details / accordion
css
border: 1px solid #F0EDE0;
border-radius: 8px;
background: #FFFDF8;
padding: 14px 16px;
<summary> has list-style: none, no marker, and a custom + / − on the right in #8F4D00 (text-safe amber, not bright).

6.9 Sources list
Small list, one row per citation:

css
padding: 8px 0;
border-bottom: 1px solid #F0EDE0;
font-size: 13px;
Org name: font-weight: 600; color: #1A1A1A. Link: #8F4D00 underlined with text-underline-offset: 2px. word-break: break-word so long URLs don't overflow on mobile.

6.10 Mobile sticky action bar
On mobile (≤700px), the primary result actions — Save as PDF, Save, Copy — are pinned to the bottom of the viewport as a sticky bar. On desktop, no sticky bar; the inline button row is shown instead.

Behavior:

Hidden by default (.pv-mobile-actions { display: none })

Shown on mobile only after results render — JS adds body.pv-has-results when #results becomes visible

The inline .actions-primary row (Save / Copy / Print) is hidden on mobile because the sticky bar replaces it

Secondary .ics actions (feeding reminders, reorder reminder) stay inline at the bottom of results — not in the sticky bar

On clear-all-data, JS removes pv-has-results so the sticky bar disappears

CSS:

css
@media (max-width: 700px) {
  .pv-mobile-actions {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    border-top: 1px solid var(--pv-border);
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
    gap: 8px;
    z-index: 100;
  }
  .pv-mobile-actions .btn {
    flex: 1;
    font-size: 13px;
    padding: 10px 6px;
    min-height: 44px;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pv-mobile-actions .btn.primary {
    flex: 1.4;
  }
  #results .btnrow.actions-primary {
    display: none;
  }
  body.pv-has-results {
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }
}
Print exception — the sticky bar must not appear on printed pages:

css
@media print {
  .pv-mobile-actions,
  #results .pv-mobile-actions {
    display: none !important;
  }
  body.pv-has-results {
    padding-bottom: 0 !important;
  }
}
Accessibility:

role="region" + aria-label="Quick actions"

Each button has explicit type="button"

env(safe-area-inset-bottom) respects iPhone home-indicator area

44px min-height on each button (touch target)

When the sticky bar's Save is clicked, the label flips to "Update" — reflects state

Why a sticky bar: on mobile the user must scroll past the stats grid, 3 details accordions, and 4 sources to reach the inline Save button. Real users didn't find it. The sticky bar surfaces the actions immediately after calculation, when intent is highest.

6.11 Storefront-parity sign-in link
Optional — used only where the storefront already displays a sign-in CTA and the tool benefits from a native-feeling header. Not required and not a gate — the tool must remain fully usable without signing in.

css
.hero-signin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--pv-border);
  border-radius: 6px;
  background: #FFFFFF;
  color: var(--pv-ink);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}
.hero-signin:hover {
  border-color: var(--pv-amber);
  background: var(--pv-amber-soft);
  color: var(--pv-amber-text-hover);
}
.hero-signin img {
  width: 24px;
  height: 24px;
  display: block;
  border-radius: 3px;
}
@media (max-width: 640px) {
  .hero-signin span { display: none; }
  .hero-signin { padding: 6px; }
}
Rules:

Placed in .hero-top flex row alongside the breadcrumb

Icon images scaled to 24×24 (never use native 50×50 — too large in header)

Text hidden at ≤640px — icons only, matches storefront mobile pattern

Uses a CSS class, not inline style="..." — CSP blocks inline styles (style-src has no 'unsafe-inline')

rel="noopener" — cross-origin link

No login gate. If the tool ever prompts "sign in to see results" or gates a feature behind login, that violates AC-15 and no-auth-no-payment.test.ts will fail

7. Accessibility requirements (non-negotiable)
Every PawVortex tool must meet these before shipping:

Contrast
All text ≥4.5:1 (normal) or ≥3:1 (large text ≥18.66px bold or ≥24px)

All interactive components ≥3:1 (buttons, borders that convey state, icons)

All measurement in docs/DESIGN.md §3

Keyboard
Full tab order — no keyboard traps

Focus ring visible: outline: 2px solid; outline-offset: 2px or box-shadow — must pass 3:1 against adjacent colors

Enter activates <summary>, Space activates buttons, Escape closes modals

Skip link first in tab order: <a class="skip" href="#main">Skip to calculator</a>

Forms
Every input has a <label for="..."> — placeholder is not a label

Errors listed in role="alert" container, one <p> per error

aria-describedby for hints

novalidate on the form so custom messages show instead of browser-native ones

Motion
Every animation wrapped in @media (prefers-reduced-motion: reduce) { animation: none; transition: none; }

No auto-playing video, no parallax, no flashing >3Hz

Touch targets
Minimum 44×44px (WCAG 2.5.5). Padding counts, border doesn't.

Text on images
Never overlay text on busy photos — use a solid background or gradient

8. Do / Don't
✅ Do
Use #8F4D00 for all amber-coloured text (links, tags, labels, citations)

Use the amber gradient for primary buttons only — one per screen

Preserve the amber underline under every card <h2> — it's the brand's visual signature

Match storefront copy tone: plain-spoken, second person ("your dog"), no hype

Store user data in localStorage only — no server PII, ever

Cite sources inline next to every number that has a published origin

Use the print stylesheet so "Print / save as PDF" produces a clean one-page document

On mobile, use a sticky action bar for primary result actions (see § 6.10)

If adding a sign-in link, use a CSS class + rel="noopener" + no gate (see § 6.11)

❌ Don't
Use bright amber (#FFB61A, #FF8A00, #FFCC33) as text on any light background — WCAG fail

Use green, cyan, or "review yellow" — those are third-party widgets' colors

Use inline style="..." attributes — CSP blocks them (style-src has no 'unsafe-inline')

Overwrite a Shopify CDN file in-place — the CDN caches by filename for one year

Introduce a login gate, paywall, or checkout into a free tool — hard-require zero friction

Load web fonts — use system stack to match the storefront's fast first paint

Store pet health data server-side — the calculator never sends pet details over the wire

Add a "third-party ad slot" or "sponsored" recommendation without a clear visual separation

Scale storefront logos to native sizes (50×50) inside a header chip — scale to 24×24

9. Reusable for future PawVortex tools
The patterns in this document apply to any tool or app under pawvortex.com/tools/*. When starting a new tool:

9.1 Copy the baseline
src/client/styles.css — copy verbatim; only add tool-specific classes at the bottom

src/server/render.ts — structure is reusable: hero → main grid → results → content → FAQ → sources → tools & guides

src/lib/citations.ts — replace with your tool's sources, but keep the whitelist structure (Merck, AAFCO, FDA, WSAVA, NRC — no competitors, no brand sites)

src/server/shopify-proxy.ts — same HMAC verification, unchanged

api/calculator.ts — same signature gate, asset fail-closed, headers (rename to api/<tool>.ts)

9.2 Per-tool checklist
□ Amber palette + WCAG audit for any new colors
□ All citations go through src/lib/citations.ts + src/lib/whitelist.ts
□ Zero login gate, zero payment, zero checkout, zero server PII
□ Print stylesheet produces a clean one-page result
□ Mobile 320px tested — no horizontal scroll
□ Mobile sticky action bar for primary result actions (if tool produces a result)
□ ?__debug=1 removed before launch (if used during development)
□ Nav link added in Shopify theme menu
□ URL submitted to Search Console
□ Legal copy: "Educational information, not veterinary advice"
□ no-auth-no-payment.test.ts updated if any non-gated sign-in link is added (narrow exception only)
9.3 When to introduce a new color
Almost never. If a new tool needs to signal state (e.g., "feeding OK" vs "check weight"), use text + icon, not a new hue. If you truly need a new color, add it here first with a measured contrast pair, then use it.

Colors that must never appear in a PawVortex tool: green (#108474 — Judge.me), blue (#1C1C1C/#5A31F4 — payment brands), pink (#EB001B — Mastercard). These are reserved for third-party widgets.

10. File reference
What	Where
Palette + components	src/client/styles.css
HTML structure	src/server/render.ts
Print stylesheet	src/client/styles.css § @media print
Contrast audit	This file § 3
Mobile sticky bar CSS	src/client/styles.css § .pv-mobile-actions
Mobile sticky bar JS	src/client/main.ts → renderResults() + body.pv-has-results toggle
Sign-in link CSS	src/client/styles.css § .hero-signin
Whitelist (citation sources)	src/lib/whitelist.ts
Legal disclaimer copy	src/server/render.ts footer
11. Change log
Version	Date	Change
1.0	2026-11-04	Initial extraction from dog food calculator launch. Locked bright amber as decorative-only. Added WCAG AA contrast table. Extracted toast pattern.
1.1	2026-11-07	Added § 6.10 mobile sticky action bar (Save PDF / Save / Copy) — replaces inline actions on ≤700px. Added § 6.11 storefront-parity sign-in link (optional, non-gated, CSS-only). Added "no inline styles" and "no login gate" to Do/Don't. Documented print exception for sticky bar.
Every change to this document must include a new row here. The dog food calculator (and every future tool) reads from this file as the source of truth.

text

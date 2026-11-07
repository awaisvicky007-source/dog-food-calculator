import './styles.css';
import { calculate, validate, type CalcInput, type CalcResult, type Range } from '../lib/formulas.js';
import { citationList, CITATIONS } from '../lib/citations.js';
import { cupFraction, lbToKg, mlToFlOz, parseNum } from '../lib/units.js';
import type { FormValues, LocalPet } from './types.js';
import * as store from './storage.js';
import { mealsIcs, reorderIcs, download } from './ics.js';
import { track } from './analytics.js';
import { FOODS, addToCart } from './catalog.js';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- toast (visual save confirmation) ----------
function toast(msg: string, kind: 'ok' | 'err' = 'ok') {
  let host = document.getElementById('pv-toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'pv-toast-host';
    host.className = 'pv-toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `pv-toast pv-toast--${kind}`;
  el.textContent = msg;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('pv-toast--visible'));
  setTimeout(() => {
    el.classList.remove('pv-toast--visible');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

const FIELDS = [
  'name', 'weight', 'weightUnit', 'age', 'ageUnit', 'adultStatus', 'bcs', 'activity',
  'foodName', 'kcalCup', 'kcalKg', 'gramsCup', 'bagSize', 'bagUnit',
] as const;

const readValues = (): FormValues =>
  Object.fromEntries(FIELDS.map((f) => [f, ($<HTMLInputElement>(f)).value])) as unknown as FormValues;

function writeValues(v: FormValues) {
  FIELDS.forEach((f) => (($<HTMLInputElement>(f)).value = v[f] ?? ''));
  updateStageHint();
}

function toInput(v: FormValues): { input?: CalcInput; errors: string[] } {
  const weight = parseNum(v.weight);
  const age = parseNum(v.age);
  const bcs = parseNum(v.bcs);
  const opt = (s: string) => parseNum(s);
  const draft = {
    weightKg: weight === undefined ? undefined : v.weightUnit === 'lb' ? lbToKg(weight) : weight,
    ageValue: age,
    ageUnit: v.ageUnit,
    kcalPerCup: opt(v.kcalCup),
    kcalPerKg: opt(v.kcalKg),
    gramsPerCup: opt(v.gramsCup),
  };
  const errors = validate(draft);
  if (errors.length) return { errors };
  const input: CalcInput = {
    weightKg: draft.weightKg!,
    ageValue: age!,
    ageUnit: v.ageUnit,
    adultStatus: v.adultStatus,
    activity: v.activity,
    ...(bcs !== undefined ? { bcs } : {}),
    ...(draft.kcalPerCup !== undefined ? { kcalPerCup: draft.kcalPerCup } : {}),
    ...(draft.kcalPerKg !== undefined ? { kcalPerKg: draft.kcalPerKg } : {}),
    ...(draft.gramsPerCup !== undefined ? { gramsPerCup: draft.gramsPerCup } : {}),
  };
  return { input, errors: [] };
}

// ---------- formatting ----------
const n0 = (n: number) => Math.round(n).toLocaleString('en-US');
// Round outward so displayed ranges honestly bracket the true value
const floor1 = (n: number) => Math.floor(n * 10) / 10;
const ceil1 = (n: number) => Math.ceil(n * 10) / 10;

const cups = (r: Range, exact: boolean) =>
  exact
    ? `${r.low.toFixed(2)} <small>(\u2248 ${cupFraction(r.low)})</small>`
    : `${floor1(r.low)}\u2013${ceil1(r.high)}`;

const cupsText = (r: Range, exact: boolean) =>
  exact
    ? `${r.low.toFixed(2)} cups (about ${cupFraction(r.low)})`
    : `about ${floor1(r.low)}-${ceil1(r.high)} cups (approximate)`;

interface Current {
  values: FormValues;
  input: CalcInput;
  result: CalcResult;
  petId?: string;
}
let current: Current | null = null;
let started = false;

function stat(label: string, value: string, sub = '') {
  return `<div class="stat"><span class="stat-l">${label}</span><span class="stat-v">${value}</span>${sub ? `<span class="stat-s">${sub}</span>` : ''}</div>`;
}

function petName(v: FormValues) {
  return v.name.trim() || 'your dog';
}

function bagDays(c: Current): number | null {
  const bag = parseNum(c.values.bagSize);
  if (!bag || Number.isNaN(bag) || !c.result.grams) return null;
  const bagG = c.values.bagUnit === 'lb' ? lbToKg(bag) * 1000 : bag * 1000;
  return bagG / c.result.grams.perDayAfterTreats;
}

function renderResults(c: Current) {
  const r = c.result;
  const v = c.values;
  const approx = !r.cups.exact;
  const days = bagDays(c);
  const waterOz = `${Math.round(mlToFlOz(r.water.lowMl))}\u2013${Math.round(mlToFlOz(r.water.highMl))} fl oz`;
  const needs = [
    ...r.warnings.map((w) => `<li class="warn">${esc(w)}</li>`),
    ...r.notices.map((w) => `<li>${esc(w)}</li>`),
  ].join('');
  const cites = citationList(r.citations)
    .map((x) => `<li>${esc(x.org)} - <a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></li>`)
    .join('');

  const grams = r.grams
    ? stat('Grams per day', `${n0(r.grams.perDay)} g`, `${n0(r.grams.perMeal)} g per meal`)
    : stat('Grams per day', '\u2014', 'Add kcal/kg (or kcal/cup + grams/cup) from the bag');

  $('results').hidden = false;
  document.body.classList.add('pv-has-results');
  $('results').innerHTML = `
  <div class="pv-mobile-actions" role="region" aria-label="Quick actions">
    <button class="btn primary" data-action="print" type="button">Save as PDF</button>
    <button class="btn ghost" data-action="save" type="button">${c.petId ? 'Update' : 'Save'}</button>
    <button class="btn ghost" data-action="copy" type="button">Copy</button>
  </div>
  <div class="results-head">
    <h2>${esc(petName(v))}\u2019s plan</h2>
    <p class="muted">${esc(r.multiplierLabel)} \u00b7 ${r.weightKg.toFixed(1)} kg \u00b7 ${r.mealsPerDay} meals/day</p>
  </div>
  <ul class="notes">${needs}</ul>
  <div class="stats">
    ${stat('Calories per day', `${n0(r.mer)} <small>kcal</small>`, `RER ${n0(r.rer)} \u00d7 ${r.multiplier}`)}
    ${stat(approx ? 'Cups per day (approx.)' : 'Cups per day', cups(r.cups.perDay, r.cups.exact), approx ? 'Illustrative 300\u2013400 kcal/cup. Enter your bag\u2019s value for exact.' : `${cups(r.cups.perMeal, true)} per meal`)}
    ${grams}
    ${stat('Treat budget', `${n0(r.treatKcal)} <small>kcal</small>`, `\u2264 10% of daily calories \u00b7 food drops to ${n0(r.foodKcalAfterTreats)} kcal`)}
    ${stat('Water (drinking)', `${n0(r.water.lowMl)}\u2013${n0(r.water.highMl)} <small>mL</small>`, `${waterOz} \u00b7 target`)}
    ${stat('Per meal', approx
      ? `${floor1(r.cups.perMeal.low)}\u2013${ceil1(r.cups.perMeal.high)} <small>cups</small>`
      : `${r.cups.perMeal.low.toFixed(2)} <small>cups</small>`, r.mealsNote)}
  </div>
  ${approx ? `<p class="callout">Cups are approximate. Enter <strong>kcal per cup</strong> from the food bag (Food label section above) for an exact amount.</p>` : ''}
  ${r.cups.exact ? `<p class="muted">With the full treat budget used, feed ${cupsText(r.cups.perDayAfterTreats, true)} of food per day.</p>` : ''}
  ${days !== null ? `<p class="muted">At this amount, your bag lasts about <strong>${Math.floor(days)} days</strong>.</p>` : ''}

  <details data-expand><summary>Show the math</summary>
    <ol class="math">${r.math.map((m) => `<li><strong>${esc(m.label)}</strong><br><code>${esc(m.formula)}</code> = <b>${esc(m.result)}</b> <sup><a href="${esc(CITATIONS[m.cite].url)}" target="_blank" rel="noopener noreferrer" title="${esc(CITATIONS[m.cite].org)}">${esc(CITATIONS[m.cite].org.split(' ')[0] ?? '')}</a></sup></li>`).join('')}</ol>
  </details>
  <details><summary>What to confirm on the bag</summary>
    <ul><li>Calories as <em>kcal per kg</em> and <em>kcal per cup</em> in the calorie statement.</li><li>The feeding guide is a starting point; this plan uses your dog\u2019s own calorie estimate.</li><li>Use the same measuring cup every time, level not heaped.</li></ul>
  </details>
  <details><summary>What this plan does not know</summary>
    <ul><li>Health conditions or medications</li><li>Pregnancy or nursing</li><li>Working, sport, or very active dogs beyond the options given</li><li>Senior dogs with disease, or dogs recovering from illness</li></ul>
    <p class="muted">Adjust with your veterinarian by watching body condition and weight over time.</p>
  </details>
  <details><summary>Sources used for this plan</summary><ul class="sources">${cites}</ul></details>

  <div class="btnrow actions actions-primary">
    <button class="btn primary" data-action="save" type="button">${c.petId ? 'Update saved pet' : 'Save to this device'}</button>
    <button class="btn ghost" data-action="copy" type="button">Copy results</button>
    <button class="btn ghost" data-action="print" type="button">Print / save as PDF</button>
  </div>
  <div class="btnrow actions actions-secondary">
    <button class="btn ghost" data-action="ics-meals" type="button">Feeding reminders (.ics)</button>
    ${days !== null ? `<button class="btn ghost" data-action="ics-reorder" type="button">Reorder reminder (.ics)</button>` : ''}
  </div>
  <p id="actionMsg" class="hint" role="status"></p>
  <div class="vet-sheet" aria-label="Questions for my vet">
    <h3>Questions for my vet</h3>
    <ul><li>Is ${n0(r.mer)} kcal/day a good starting point for ${esc(petName(v))}?</li><li>What is ${esc(petName(v))}\u2019s ideal body weight and body condition score?</li><li>Should I change the amount for activity, medications, or health conditions?</li><li>How often should we re-check weight?</li></ul>
  </div>
  ${FOODS.length ? `<p class="muted">PawVortex products with verified label data are shown below. <label><input type="checkbox" id="noRecs"> Calculate without product recommendations</label></p><div id="recs"></div>` : ''}
  `;
  if (FOODS.length) renderRecs(c);
  $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderRecs(c: Current) {
  const box = document.getElementById('recs');
  if (!box) return;
  const off = (document.getElementById('noRecs') as HTMLInputElement | null)?.checked;
  if (off) return void (box.innerHTML = '');
  box.innerHTML = `<h3>PawVortex products <span class="tag">PawVortex product</span></h3>` + FOODS.map((f) => {
    const cupsPerDay = c.result.mer / f.kcalPerCup;
    return `<div class="rec"><div><strong>${esc(f.brand)} ${esc(f.name)}</strong><br><small>${f.kcalPerCup} kcal/cup - verified from label ${esc(f.lastVerifiedAt)}</small><br>Your dog: ${cupsPerDay.toFixed(2)} cups/day</div><button class="btn ghost" type="button" data-cart="${f.shopifyVariantId}">Add to cart</button></div>`;
  }).join('');
}

function summaryText(c: Current): string {
  const r = c.result;
  const lines = [
    `${petName(c.values)} - PawVortex Dog Food Calculator`,
    `Calories/day: ${n0(r.mer)} kcal (RER ${n0(r.rer)} x ${r.multiplier}, ${r.multiplierLabel})`,
    `Cups/day: ${cupsText(r.cups.perDay, r.cups.exact)}; per meal: ${cupsText(r.cups.perMeal, r.cups.exact)}`,
    r.grams ? `Grams/day: ${n0(r.grams.perDay)} g (${n0(r.grams.perMeal)} g per meal)` : '',
    `Meals/day: ${r.mealsPerDay}`,
    `Treat budget: up to ${n0(r.treatKcal)} kcal/day (10%)`,
    `Water (drinking): ${n0(r.water.lowMl)}-${n0(r.water.highMl)} mL/day`,
    'Educational information, not veterinary advice.',
  ];
  return lines.filter(Boolean).join('\n');
}

// ---------- PDF export (all saved pets) ----------
function buildAllPetsPdf(pets: LocalPet[]): string {
  const cards = pets
    .map((p) => {
      const { input } = toInput(p.values);
      if (!input) return '';
      const r = calculate(input);
      const name = p.values.name || 'Unnamed dog';
      const cupsDay = r.cups.exact
        ? `${r.cups.perDay.low.toFixed(2)} cups`
        : `${floor1(r.cups.perDay.low)}\u2013${ceil1(r.cups.perDay.high)} cups (approx.)`;
      const cupsMeal = r.cups.exact
        ? `${r.cups.perMeal.low.toFixed(2)} cups`
        : `${floor1(r.cups.perMeal.low)}\u2013${ceil1(r.cups.perMeal.high)} cups`;
      const gramsRow = r.grams
        ? `<tr><td>Grams per day</td><td>${n0(r.grams.perDay)} g (${n0(r.grams.perMeal)} g per meal)</td></tr>`
        : '';
      return `<article class="pdf-card">
        <h2>${esc(name)}</h2>
        <p class="pdf-sub">${esc(r.multiplierLabel)} \u00b7 ${r.weightKg.toFixed(1)} kg \u00b7 ${r.mealsPerDay} meals/day</p>
        <table class="pdf-table">
          <tr><td>Calories per day</td><td>${n0(r.mer)} kcal (RER ${n0(r.rer)} \u00d7 ${r.multiplier})</td></tr>
          <tr><td>Cups per day</td><td>${cupsDay}</td></tr>
          <tr><td>Per meal</td><td>${cupsMeal}</td></tr>
          ${gramsRow}
          <tr><td>Treat budget</td><td>\u2264 ${n0(r.treatKcal)} kcal/day (10% of daily)</td></tr>
          <tr><td>Water (drinking)</td><td>${n0(r.water.lowMl)}\u2013${n0(r.water.highMl)} mL (${Math.round(mlToFlOz(r.water.lowMl))}\u2013${Math.round(mlToFlOz(r.water.highMl))} fl oz)</td></tr>
        </table>
      </article>`;
    })
    .filter(Boolean)
    .join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>PawVortex \u2014 Saved Pet Plans</title>
<style>
  @page { margin: 18mm; }
  body { font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif; max-width: 720px; margin: 0 auto; color: #111; line-height: 1.5; }
  h1 { font-size: 20pt; margin: 0 0 4pt; }
  h2 { font-size: 14pt; margin: 0 0 4pt; }
  .subtitle { color: #666; font-size: 10pt; margin: 0 0 20pt; }
  .pdf-card { page-break-inside: avoid; margin-bottom: 18pt; border: 1pt solid #e5e5e5; padding: 14pt 16pt; border-radius: 6pt; }
  .pdf-sub { color: #666; font-size: 10pt; margin: 2pt 0 10pt; }
  .pdf-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
  .pdf-table td { padding: 5pt 0; border-bottom: 1pt solid #f0f0f0; vertical-align: top; }
  .pdf-table tr:last-child td { border-bottom: none; }
  .pdf-table td:first-child { font-weight: 600; width: 40%; color: #333; }
  footer { margin-top: 24pt; padding-top: 10pt; border-top: 1pt solid #ddd; font-size: 9pt; color: #666; line-height: 1.5; }
  @media print { body { max-width: none; } .pdf-card { box-shadow: none; } }
</style>
</head><body>
  <h1>PawVortex \u2014 Saved Pet Plans</h1>
  <p class="subtitle">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} \u00b7 ${pets.length} saved pet${pets.length === 1 ? '' : 's'}</p>
  ${cards}
  <footer>
    Educational nutrition information based on published sources (Merck Veterinary Manual, AAFCO, FDA, WSAVA, NRC). Not veterinary advice. Consult a licensed veterinarian for decisions about an individual dog.
  </footer>
</body></html>`;
}

// ---------- profiles ----------
function renderProfiles() {
  const pets = store.loadPets();
  const box = $('profiles');
  if (!pets.length) {
    box.innerHTML = '<p class="muted">No saved pets yet.</p>';
  } else {
    box.innerHTML = pets
      .map((p) => `<div class="pet"><button class="link" data-load="${esc(p.id)}" type="button">${esc(p.values.name || 'Unnamed dog')} <small>${esc(p.values.weight)} ${p.values.weightUnit}</small></button><button class="x" data-del="${esc(p.id)}" aria-label="Delete ${esc(p.values.name || 'pet')}" type="button">\u00d7</button></div>`)
      .join('');
  }
  renderCompare(pets);
  const list = $('foodList');
  list.innerHTML = Object.keys(store.loadFoods()).map((f) => `<option value="${esc(f)}">`).join('');
}

function renderCompare(pets: LocalPet[]) {
  const box = $('compare');
  const rows = pets
    .map((p) => ({ p, t: toInput(p.values) }))
    .filter((x): x is { p: LocalPet; t: { input: CalcInput; errors: string[] } } => !!x.t.input)
    .map(({ p, t }) => ({ p, r: calculate(t.input) }));
  if (rows.length < 2) return void (box.hidden = true);
  const total = rows.reduce((s, x) => s + Math.round(x.r.mer), 0);
  const sameFood = rows.every((x) => x.r.cups.exact && x.r.cups.kcalPerCup === rows[0]!.r.cups.kcalPerCup);
  const totalCups = rows.reduce((s, x) => s + x.r.cups.perDay.low, 0);
  box.hidden = false;
  box.innerHTML = `<h2>Your pets side by side</h2><div class="scroll"><table><thead><tr><th>Dog</th><th>kcal/day</th><th>Cups/day</th><th>Meals</th><th>Treats kcal</th></tr></thead><tbody>${rows
    .map(({ p, r }) => `<tr><td>${esc(p.values.name || 'Unnamed')}</td><td>${n0(r.mer)}</td><td>${r.cups.exact ? r.cups.perDay.low.toFixed(2) : `${r.cups.perDay.low.toFixed(1)}\u2013${r.cups.perDay.high.toFixed(1)}~`}</td><td>${r.mealsPerDay}</td><td>${n0(r.treatKcal)}</td></tr>`)
    .join('')}</tbody><tfoot><tr><th>Household</th><th>${n0(total)}</th><th>${sameFood ? totalCups.toFixed(2) + ' (same food)' : 'varies by food'}</th><th></th><th></th></tr></tfoot></table></div>`;
}

// ---------- events ----------
function updateStageHint() {
  const age = parseNum($<HTMLInputElement>('age').value);
  const unit = $<HTMLSelectElement>('ageUnit').value as FormValues['ageUnit'];
  const hint = $('stageHint');
  if (age === undefined || Number.isNaN(age) || age <= 0) return;
  const months = unit === 'years' ? age * 12 : unit === 'weeks' ? age / 4.348 : age;
  hint.textContent = months <= 12
    ? 'Puppy detected (12 months or younger): puppy factors are used automatically.'
    : 'Adult detected: choose the status that fits your dog.';
}

function onSubmit(e: Event) {
  e.preventDefault();
  const values = readValues();
  const { input, errors } = toInput(values);
  const box = $('formErrors');
  if (!input) {
    box.hidden = false;
    box.innerHTML = errors.map((x) => `<p>${esc(x)}</p>`).join('');
    return;
  }
  box.hidden = true;
  const result = calculate(input);
  current = { values, input, result, ...(current?.petId ? { petId: current.petId } : {}) };
  store.rememberFood(values.foodName, values.kcalCup, values.kcalKg, values.gramsCup);
  store.pushHistory({ at: new Date().toISOString(), name: values.name, mer: Math.round(result.mer) });
  track('calculation_completed', { life_stage: result.lifeStage });
  if (values.kcalCup) track('kcal_cup_entered');
  renderResults(current);
  renderProfiles();
}

function say(msg: string) {
  const el = document.getElementById('actionMsg');
  if (el) el.textContent = msg;
}

function onResultsClick(e: Event) {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-cart]');
  if (!t || !current) return;
  const c = current;
  const act = t.dataset.action;
  if (t.dataset.cart) {
    void addToCart(Number(t.dataset.cart)).then((ok) => {
      track('add_to_cart');
      say(ok ? 'Added to your PawVortex cart.' : 'Could not add to cart. Please try again from the product page.');
    });
    return;
  }
  if (act === 'save') {
    const pets = store.savePet(c.values, c.petId);
    current = { ...c, petId: c.petId ?? pets[pets.length - 1]?.id ?? '' };
    track('profile_saved_local');
    renderProfiles();
    // Re-render results so button label flips to "Update saved pet"
    renderResults(current);
    toast('Saved to this device \u2014 click "Update saved pet" to change it later, or "Print / save as PDF" for a copy.');
    say('Saved on this device only.');
  } else if (act === 'copy') {
    void navigator.clipboard?.writeText(summaryText(c)).then(
      () => { toast('Plan copied to clipboard.'); say('Copied.'); },
      () => say('Copy is blocked by your browser. Use Print instead.'),
    );
  } else if (act === 'print') {
    track('pdf_downloaded');
    window.print();
  } else if (act === 'ics-meals') {
    const per = c.result.cups.exact ? `${c.result.cups.perMeal.low.toFixed(2)} cups` : c.result.grams ? `${n0(c.result.grams.perMeal)} g` : 'see plan';
    download(`${petName(c.values).replace(/\W+/g, '-')}-feeding.ics`, mealsIcs(petName(c.values), c.result.mealsPerDay, per));
    track('reminder_created');
  } else if (act === 'ics-reorder') {
    const d = bagDays(c);
    if (d !== null) download(`${petName(c.values).replace(/\W+/g, '-')}-reorder.ics`, reorderIcs(petName(c.values), d));
    track('reminder_created');
  }
}

function boot() {
  $('calcForm').addEventListener('submit', onSubmit);
  $('calcForm').addEventListener('input', () => {
    if (!started) {
      started = true;
      track('calculator_started');
    }
  });
  $('age').addEventListener('input', updateStageHint);
  $('ageUnit').addEventListener('change', updateStageHint);
  $('results').addEventListener('click', onResultsClick);
  $('results').addEventListener('toggle', (e) => {
    if ((e.target as HTMLElement).hasAttribute('data-expand')) track('result_expanded');
  }, true);
  $('results').addEventListener('change', (e) => {
    if ((e.target as HTMLElement).id === 'noRecs' && current) renderRecs(current);
  });

  $('foodName').addEventListener('change', () => {
    const f = store.loadFoods()[$<HTMLInputElement>('foodName').value.trim()];
    if (!f) return;
    if (!$<HTMLInputElement>('kcalCup').value) $<HTMLInputElement>('kcalCup').value = f.kcalPerCup;
    if (!$<HTMLInputElement>('kcalKg').value) $<HTMLInputElement>('kcalKg').value = f.kcalPerKg;
    if (!$<HTMLInputElement>('gramsCup').value) $<HTMLInputElement>('gramsCup').value = f.gramsPerCup;
    track('food_selected');
  });

  $('profiles').addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const load = t.closest<HTMLElement>('[data-load]')?.dataset.load;
    const del = t.closest<HTMLElement>('[data-del]')?.dataset.del;
    if (load) {
      const p = store.loadPets().find((x) => x.id === load);
      if (p) {
        writeValues(p.values);
        current = null;
        const { input } = toInput(p.values);
        if (input) {
          current = { values: p.values, input, result: calculate(input), petId: p.id };
          renderResults(current);
        }
      }
    } else if (del) {
      store.deletePet(del);
      if (current?.petId === del) current = null;
      renderProfiles();
    }
  });

  // ✅ Export = visual PDF of all saved pet plans (opens print dialog → user saves as PDF)
  $('exportBtn').addEventListener('click', () => {
    const pets = store.loadPets();
    if (!pets.length) {
      toast('No saved pets to export yet. Calculate a plan and save it first.', 'err');
      return;
    }
    const w = window.open('', '_blank');
    if (!w) {
      toast('Popup blocked. Allow popups for this site to export.', 'err');
      return;
    }
    w.document.open();
    w.document.write(buildAllPetsPdf(pets));
    w.document.close();
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch {
        /* user can print manually from the tab */
      }
    }, 250);
    track('profile_exported');
    toast(`Opened ${pets.length} pet plan${pets.length === 1 ? '' : 's'} — choose "Save as PDF" in the print dialog.`);
  });

  // Import accepts the JSON backup (kept for restoring data across devices)
  $<HTMLInputElement>('importFile').addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const n = store.importJson(await file.text());
      $('storageMsg').textContent = `Imported ${n} pet${n === 1 ? '' : 's'}.`;
      renderProfiles();
      toast(`Imported ${n} pet${n === 1 ? '' : 's'}.`);
    } catch (err) {
      $('storageMsg').textContent = err instanceof Error ? err.message : 'Import failed.';
      toast(err instanceof Error ? err.message : 'Import failed.', 'err');
    }
    (e.target as HTMLInputElement).value = '';
  });

  $('clearBtn').addEventListener('click', () => {
    if (!confirm('Erase all pets and food memory saved on this device?')) return;
    store.clearAll();
    current = null;
    $('results').hidden = true;
    document.body.classList.remove('pv-has-results');
    $<HTMLFormElement>('calcForm').reset();
    renderProfiles();
    $('storageMsg').textContent = 'All saved data erased from this device.';
    toast('All saved data erased.');
  });

  renderProfiles();
}

boot();
import type { CitationKey } from './citations.js';
import { cupFraction } from './units.js';

export type AgeUnit = 'weeks' | 'months' | 'years';
export type AdultStatus = 'neutered' | 'intact' | 'obesity_prone';
export type Activity = 'typical' | 'light_work' | 'moderate_work';
export type LifeStage = 'puppy_under_4m' | 'puppy_4_12m' | 'adult';

export interface CalcInput {
  weightKg: number;
  ageValue: number;
  ageUnit: AgeUnit;
  adultStatus: AdultStatus;
  activity?: Activity;
  /** 1-9 WSAVA scale; informs notices only, never silently changes calories. */
  bcs?: number;
  kcalPerCup?: number;
  kcalPerKg?: number;
  gramsPerCup?: number;
}

export interface Range {
  low: number;
  high: number;
}

export interface MathStep {
  label: string;
  formula: string;
  result: string;
  cite: CitationKey;
}

export interface CalcResult {
  weightKg: number;
  ageMonths: number;
  lifeStage: LifeStage;
  rer: number;
  multiplier: number;
  multiplierLabel: string;
  mer: number;
  mealsPerDay: number;
  mealsNote: string;
  treatKcal: number;
  foodKcalAfterTreats: number;
  cups: {
    exact: boolean;
    kcalPerCup: number | null;
    perDay: Range;
    perMeal: Range;
    perDayAfterTreats: Range;
    perMealAfterTreats: Range;
  };
  grams: { perDay: number; perMeal: number; perDayAfterTreats: number; perMealAfterTreats: number } | null;
  water: { lowMl: number; highMl: number };
  notices: string[];
  warnings: string[];
  math: MathStep[];
  citations: CitationKey[];
}

/** Illustrative range used ONLY when the user has not entered a label value. Not a citation. */
export const APPROX_KCAL_PER_CUP: Range = { low: 300, high: 400 };
export const TREAT_FRACTION = 0.1;

const WEEKS_PER_MONTH = 30.4375 / 7;

export const rer = (kg: number) => 70 * Math.pow(kg, 0.75);

export function ageToMonths(value: number, unit: AgeUnit): number {
  if (unit === 'weeks') return value / WEEKS_PER_MONTH;
  if (unit === 'years') return value * 12;
  return value;
}

/** Merck: puppies up to 12 months on puppy diet; older = adult. */
export function lifeStageOf(ageMonths: number): LifeStage {
  if (ageMonths < 4) return 'puppy_under_4m';
  if (ageMonths <= 12) return 'puppy_4_12m';
  return 'adult';
}

export function mealsFor(ageMonths: number): { meals: number; note: string } {
  const weeks = ageMonths * WEEKS_PER_MONTH;
  if (weeks < 6)
    return { meals: 4, note: 'Under 6 weeks is a weaning age - follow your veterinarian\u2019s feeding plan.' };
  if (weeks < 12) return { meals: 4, note: '6-12 weeks: 4 meals a day.' };
  if (ageMonths < 6) return { meals: 3, note: '3-6 months: 3 meals a day.' };
  if (ageMonths <= 12) return { meals: 2, note: '6-12 months: 2 meals a day.' };
  return { meals: 2, note: 'Adults: 1 or 2 meals a day. 2 is the default here.' };
}

export function pickMultiplier(
  stage: LifeStage,
  status: AdultStatus,
  activity: Activity = 'typical',
): { value: number; label: string } {
  if (stage === 'puppy_under_4m') return { value: 3, label: 'Puppy under 4 months' };
  if (stage === 'puppy_4_12m') return { value: 2, label: 'Puppy over 4 months' };
  if (activity === 'moderate_work') return { value: 3, label: 'Adult, moderate work' };
  if (activity === 'light_work') return { value: 2, label: 'Adult, light work' };
  if (status === 'intact') return { value: 1.8, label: 'Adult, intact' };
  if (status === 'obesity_prone') return { value: 1.4, label: 'Adult, obesity-prone / inactive' };
  return { value: 1.6, label: 'Adult, neutered' };
}

/** Maintenance fluid range, mL/24 h (Merck): 30 x kg + 70  to  132 x kg^0.75. */
export function waterRange(kg: number): { lowMl: number; highMl: number } {
  const a = 30 * kg + 70;
  const b = 132 * Math.pow(kg, 0.75);
  return { lowMl: Math.min(a, b), highMl: Math.max(a, b) };
}

export function validate(i: Partial<CalcInput> & { weightKg?: number }): string[] {
  const e: string[] = [];
  const w = i.weightKg;
  if (w === undefined || Number.isNaN(w)) e.push('Enter your dog\u2019s weight as a number.');
  else if (w < 0.5 || w > 100) e.push('Weight must be between 0.5 kg (1 lb) and 100 kg (220 lb).');
  const a = i.ageValue;
  if (a === undefined || Number.isNaN(a)) e.push('Enter your dog\u2019s age as a number.');
  else if (a <= 0) e.push('Age must be greater than zero.');
  else if (i.ageUnit && ageToMonths(a, i.ageUnit) > 360) e.push('Age must be 30 years or less.');
  const chk = (v: number | undefined, lo: number, hi: number, msg: string) => {
    if (v !== undefined && (Number.isNaN(v) || v < lo || v > hi)) e.push(msg);
  };
  chk(i.kcalPerCup, 100, 1000, 'kcal per cup should be between 100 and 1000. Check the bag.');
  chk(i.kcalPerKg, 1000, 7000, 'kcal per kg should be between 1000 and 7000. Check the bag.');
  chk(i.gramsPerCup, 50, 250, 'Grams per cup should be between 50 and 250.');
  return e;
}

const scale = (r: Range, k: number): Range => ({ low: r.low * k, high: r.high * k });

export function calculate(input: CalcInput): CalcResult {
  const kg = input.weightKg;
  const ageMonths = ageToMonths(input.ageValue, input.ageUnit);
  const stage = lifeStageOf(ageMonths);
  const baseRer = rer(kg);
  const m = pickMultiplier(stage, input.adultStatus, input.activity);
  const mer = baseRer * m.value;
  const { meals, note: mealsNote } = mealsFor(ageMonths);
  const treatKcal = mer * TREAT_FRACTION;
  const foodKcalAfterTreats = mer - treatKcal;
  const water = waterRange(kg);

  // Resolve kcal/cup (exact) from the label, directly or via kcal/kg x g/cup.
  let kcalPerCup: number | null = input.kcalPerCup ?? null;
  if (kcalPerCup === null && input.kcalPerKg && input.gramsPerCup)
    kcalPerCup = (input.kcalPerKg * input.gramsPerCup) / 1000;

  const exact = kcalPerCup !== null;
  const per: Range = exact
    ? { low: mer / kcalPerCup!, high: mer / kcalPerCup! }
    : { low: mer / APPROX_KCAL_PER_CUP.high, high: mer / APPROX_KCAL_PER_CUP.low };

  // Grams only when we can compute them from label data (never guessed).
  let grams: CalcResult['grams'] = null;
  const kcalPerG =
    input.kcalPerKg !== undefined
      ? input.kcalPerKg / 1000
      : kcalPerCup !== null && input.gramsPerCup
        ? kcalPerCup / input.gramsPerCup
        : null;
  if (kcalPerG) {
    const d = mer / kcalPerG;
    const t = foodKcalAfterTreats / kcalPerG;
    grams = { perDay: d, perMeal: d / meals, perDayAfterTreats: t, perMealAfterTreats: t / meals };
  }

  const warnings: string[] = [];
  const notices: string[] = [];
  if (kg < 2)
    warnings.push('Very small dogs can be fragile. Ask your veterinarian before using any calculator for feeding.');
  if (ageMonths * WEEKS_PER_MONTH < 6)
    warnings.push('Puppies under 6 weeks are usually still weaning. Follow your veterinarian\u2019s plan.');
  if (stage !== 'adult')
    notices.push(
      'Growing puppies - especially large and giant breeds - need a vet-guided growth plan. Treat this as a starting point and re-check as your puppy grows.',
    );
  if (input.activity && input.activity !== 'typical' && stage === 'adult')
    notices.push(
      'Working-dog multipliers are wide ranges in the veterinary literature. Confirm the amount with your veterinarian and adjust to body condition.',
    );
  if (input.bcs !== undefined) {
    if (input.bcs >= 7)
      notices.push(
        'A body condition score of 7 or higher suggests your dog may be above ideal weight. This plan estimates maintenance energy; it is not a weight-loss plan. Ask your veterinarian for a target weight and a plan.',
      );
    else if (input.bcs === 6)
      notices.push('A score of 6 can mean slightly above ideal. Re-check body condition every few weeks and adjust with your veterinarian.');
    else if (input.bcs <= 3)
      warnings.push(
        'A body condition score of 3 or lower suggests your dog may be underweight. Book a veterinary check before changing food amounts.',
      );
  }

  const citations: CitationKey[] = ['merck_energy', 'merck_puppy_feeding', 'merck_fluids', 'nrc_energy'];
  if (exact) citations.push('aafco_calories');
  if (input.bcs !== undefined) citations.push('wsava_bcs');

  const math: MathStep[] = [
    {
      label: 'Weight in kg',
      formula: `${input.weightKg.toFixed(2)} kg`,
      result: `${kg.toFixed(2)} kg`,
      cite: 'merck_energy',
    },
    {
      label: 'Resting energy requirement (RER)',
      formula: `70 \u00d7 ${kg.toFixed(2)}^0.75`,
      result: `${Math.round(baseRer)} kcal/day`,
      cite: 'merck_energy',
    },
    {
      label: `Maintenance energy (MER) - ${m.label}`,
      formula: `${m.value} \u00d7 ${Math.round(baseRer)}`,
      result: `${Math.round(mer)} kcal/day`,
      cite: 'merck_energy',
    },
    {
      label: 'Meals per day',
      formula: mealsNote,
      result: `${meals}`,
      cite: 'merck_puppy_feeding',
    },
    {
      label: 'Treat allowance (10% of daily calories)',
      formula: `0.10 \u00d7 ${Math.round(mer)}`,
      result: `${Math.round(treatKcal)} kcal/day`,
      cite: 'wsava_nutrition',
    },
    {
      label: 'Water range (total, including water in food)',
      formula: `30 \u00d7 ${kg.toFixed(2)} + 70  to  132 \u00d7 ${kg.toFixed(2)}^0.75`,
      result: `${Math.round(water.lowMl)}-${Math.round(water.highMl)} mL/day`,
      cite: 'merck_fluids',
    },
  ];
  if (exact)
    math.splice(3, 0, {
      label: 'Cups per day (from your label)',
      formula: `${Math.round(mer)} \u00f7 ${kcalPerCup!.toFixed(0)} kcal/cup`,
      result: `${per.low.toFixed(2)} cups (\u2248 ${cupFraction(per.low)})`,
      cite: 'aafco_calories',
    });
  if (grams)
    math.splice(exact ? 4 : 3, 0, {
      label: 'Grams per day',
      formula: `${Math.round(mer)} kcal \u00f7 ${(kcalPerG! * 1000).toFixed(0)} kcal/kg`,
      result: `${Math.round(grams.perDay)} g`,
      cite: 'aafco_calories',
    });

  return {
    weightKg: kg,
    ageMonths,
    lifeStage: stage,
    rer: baseRer,
    multiplier: m.value,
    multiplierLabel: m.label,
    mer,
    mealsPerDay: meals,
    mealsNote,
    treatKcal,
    foodKcalAfterTreats,
    cups: {
      exact,
      kcalPerCup,
      perDay: per,
      perMeal: scale(per, 1 / meals),
      perDayAfterTreats: scale(per, 0.9),
      perMealAfterTreats: scale(per, 0.9 / meals),
    },
    grams,
    water,
    notices,
    warnings,
    math,
    citations,
  };
}

import { describe, expect, it } from 'vitest';
import { calculate, validate, mealsFor, waterRange, rer, lifeStageOf } from '../src/lib/formulas';
import { lbToKg, cupFraction } from '../src/lib/units';

const adult = { weightKg: lbToKg(30), ageValue: 3, ageUnit: 'years' as const, adultStatus: 'neutered' as const };

describe('PRD acceptance criteria', () => {
  it('AC-01: 30 lb neutered 3-year-old -> RER ~496, MER ~794', () => {
    const r = calculate(adult);
    expect(Math.round(r.rer)).toBe(496);
    expect(r.multiplier).toBe(1.6);
    expect(Math.abs(r.mer - 794)).toBeLessThanOrEqual(2);
  });
  it('AC-02: 350 kcal/cup -> ~2.3 cups exact; blank -> approximate range', () => {
    const exact = calculate({ ...adult, kcalPerCup: 350 });
    expect(exact.cups.exact).toBe(true);
    expect(exact.cups.perDay.low).toBeCloseTo(2.27, 1);
    const approx = calculate(adult);
    expect(approx.cups.exact).toBe(false);
    expect(approx.cups.perDay.low).toBeLessThan(approx.cups.perDay.high);
  });
  it('AC-03: adult meals/day = 2', () => expect(calculate(adult).mealsPerDay).toBe(2));
  it('AC-04: treats are 10% of daily kcal', () => {
    const r = calculate(adult);
    expect(r.treatKcal).toBeCloseTo(r.mer * 0.1, 6);
    expect(r.foodKcalAfterTreats).toBeCloseTo(r.mer * 0.9, 6);
  });
  it('AC-05: water is a range from Merck formulas', () => {
    const w = waterRange(lbToKg(30));
    expect(w.lowMl).toBeCloseTo(30 * lbToKg(30) + 70, 3);
    expect(w.highMl).toBeCloseTo(132 * Math.pow(lbToKg(30), 0.75), 3);
    expect(w.lowMl).toBeLessThan(w.highMl);
  });
});

describe('multipliers and stages', () => {
  const base = { weightKg: 10, adultStatus: 'neutered' as const, ageUnit: 'months' as const };
  it('puppy <4 months = 3x, 4-12 months = 2x', () => {
    expect(calculate({ ...base, ageValue: 3 }).multiplier).toBe(3);
    expect(calculate({ ...base, ageValue: 8 }).multiplier).toBe(2);
  });
  it('12 months is still a puppy; 13 is an adult', () => {
    expect(lifeStageOf(12)).toBe('puppy_4_12m');
    expect(lifeStageOf(13)).toBe('adult');
  });
  it('adult intact 1.8, obesity-prone 1.4', () => {
    expect(calculate({ ...base, ageValue: 3, ageUnit: 'years', adultStatus: 'intact' }).multiplier).toBe(1.8);
    expect(calculate({ ...base, ageValue: 3, ageUnit: 'years', adultStatus: 'obesity_prone' }).multiplier).toBe(1.4);
  });
  it('meal schedule follows Merck bands', () => {
    expect(mealsFor(2).meals).toBe(4); // ~8.7 weeks
    expect(mealsFor(4).meals).toBe(3);
    expect(mealsFor(8).meals).toBe(2);
    expect(mealsFor(36).meals).toBe(2);
  });
  it('weeks are converted to months', () => {
    expect(calculate({ ...base, ageValue: 8, ageUnit: 'weeks' }).lifeStage).toBe('puppy_under_4m');
  });
});

describe('grams, cups and honesty', () => {
  it('grams only appear when label data allows (never guessed)', () => {
    expect(calculate(adult).grams).toBeNull();
    expect(calculate({ ...adult, kcalPerCup: 350 }).grams).toBeNull();
    const g = calculate({ ...adult, kcalPerKg: 3500 });
    expect(g.grams!.perDay).toBeCloseTo((g.mer / 3500) * 1000, 3);
  });
  it('kcal/kg x g/cup resolves exact cups', () => {
    const r = calculate({ ...adult, kcalPerKg: 3500, gramsPerCup: 100 });
    expect(r.cups.exact).toBe(true);
    expect(r.cups.kcalPerCup).toBe(350);
  });
  it('BCS 7+ adds a not-a-weight-loss-plan notice; BCS<=3 warns', () => {
    expect(calculate({ ...adult, bcs: 8 }).notices.join(' ')).toMatch(/not a weight-loss plan/);
    expect(calculate({ ...adult, bcs: 2 }).warnings.length).toBeGreaterThan(0);
  });
  it('tiny dogs and very young puppies get a vet warning', () => {
    expect(calculate({ ...adult, weightKg: 1.2 }).warnings.length).toBeGreaterThan(0);
    expect(calculate({ ...adult, ageValue: 4, ageUnit: 'weeks' }).warnings.length).toBeGreaterThan(0);
  });
  it('every math step has a citation key', () => {
    calculate({ ...adult, kcalPerCup: 350, kcalPerKg: 3500 }).math.forEach((m) => expect(m.cite).toBeTruthy());
  });
  it('rer matches the formula', () => expect(rer(10)).toBeCloseTo(70 * Math.pow(10, 0.75), 6));
});

describe('validation and formatting', () => {
  it('rejects junk', () => {
    expect(validate({ weightKg: NaN, ageValue: 3, ageUnit: 'years' }).length).toBe(1);
    expect(validate({ weightKg: 0.1, ageValue: 3, ageUnit: 'years' }).length).toBe(1);
    expect(validate({ weightKg: 10, ageValue: -1, ageUnit: 'years' }).length).toBe(1);
    expect(validate({ weightKg: 10, ageValue: 3, ageUnit: 'years', kcalPerCup: 5 }).length).toBe(1);
    expect(validate({ weightKg: 10, ageValue: 3, ageUnit: 'years', kcalPerCup: 350 })).toEqual([]);
  });
  it('cup fractions', () => {
    expect(cupFraction(2.27)).toBe('2 1/4');
    expect(cupFraction(0.5)).toBe('1/2');
    expect(cupFraction(3)).toBe('3');
  });
});

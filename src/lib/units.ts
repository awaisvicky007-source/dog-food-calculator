export const LB_PER_KG = 2.20462262185;
export const lbToKg = (lb: number) => lb / LB_PER_KG;
export const kgToLb = (kg: number) => kg * LB_PER_KG;
export const mlToFlOz = (ml: number) => ml / 29.5735295625;
export const ozToG = (oz: number) => oz * 28.349523125;

/** Parse a user-typed number; accepts comma decimals. Returns undefined for blank, NaN for junk. */
export function parseNum(s: string | undefined): number | undefined {
  if (s === undefined) return undefined;
  const t = s.trim().replace(',', '.');
  if (t === '') return undefined;
  return Number(t);
}

/** Nearest 1/8 cup as a readable string, e.g. 2.27 -> "2 1/4". */
export function cupFraction(cups: number): string {
  const eighths = Math.round(cups * 8);
  const whole = Math.floor(eighths / 8);
  let rem = eighths % 8;
  let den = 8;
  while (rem !== 0 && rem % 2 === 0 && den % 2 === 0) {
    rem /= 2;
    den /= 2;
  }
  if (rem === 0) return `${whole}`;
  return whole > 0 ? `${whole} ${rem}/${den}` : `${rem}/${den}`;
}

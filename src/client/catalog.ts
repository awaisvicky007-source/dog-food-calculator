/**
 * PawVortex catalog (FR-26..33). Ships EMPTY on purpose: FR-28 forbids inventing kcal/cup values.
 * Fill `FOODS` only with entries a reviewer has verified against the physical label.
 * While empty, no product UI is rendered.
 */
export interface FoodProduct {
  id: string;
  brand: string;
  name: string;
  kcalPerCup: number;
  kcalPerKg?: number;
  gramsPerCup?: number;
  source: 'label';
  sourceUrl: string;
  lastVerifiedAt: string; // ISO date
  verifiedBy: string;
  shopifyVariantId: number;
}

export const FOODS: FoodProduct[] = [];

/** Standard add-to-cart only (FR-31/33). Same-origin on pawvortex.com; no checkout, no payment. */
export async function addToCart(variantId: number, quantity = 1): Promise<boolean> {
  try {
    const r = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity }] }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

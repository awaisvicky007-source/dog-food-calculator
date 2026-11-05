/**
 * Approved citations (PRD §15). Every number / claim in the UI points at one of these keys.
 * `verified` must be flipped to true (with a date) by a human reviewer after opening the URL
 * and confirming it still supports the claim. CI warns while any entry is unverified.
 */
export type CitationKey =
  | 'merck_energy'
  | 'merck_puppy_feeding'
  | 'merck_fluids'
  | 'merck_food_hazards'
  | 'aafco_calories'
  | 'fda_xylitol'
  | 'wsava_bcs'
  | 'wsava_nutrition'
  | 'nrc_energy';

export interface Citation {
  key: CitationKey;
  org: string;
  title: string;
  url: string;
  verified: boolean;
  lastVerifiedAt: string | null;
}

const c = (key: CitationKey, org: string, title: string, url: string): Citation => ({
  key,
  org,
  title,
  url,
  verified: false,
  lastVerifiedAt: null,
});

export const CITATIONS: Record<CitationKey, Citation> = {
  merck_energy: c(
    'merck_energy',
    'Merck Veterinary Manual',
    'Nutritional requirements of small animals — daily maintenance energy requirements and water intake',
    'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/nutritional-requirements-of-small-animals',
  ),
  merck_puppy_feeding: c(
    'merck_puppy_feeding',
    'Merck Veterinary Manual',
    'Feeding and nutrition of dogs — feeding schedules for puppies and adults',
    'https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/dog-and-cat-foods',
  ),
  merck_fluids: c(
    'merck_fluids',
    'Merck Veterinary Manual',
    'Maintenance fluid plan in animals',
    'https://www.merckvetmanual.com/therapeutics/fluid-therapy/maintenance-fluid-plan-in-animals',
  ),
  merck_food_hazards: c(
    'merck_food_hazards',
    'Merck Veterinary Manual',
    'Food hazards for dogs',
    'https://www.merckvetmanual.com/special-pet-topics/poisoning/food-hazards',
  ),
  aafco_calories: c(
    'aafco_calories',
    'AAFCO',
    'Pet food labeling requirements — calorie content statement',
    'https://aafco.org/resources/startups/labeling-labeling-requirements/',
  ),
  fda_xylitol: c(
    'fda_xylitol',
    'U.S. FDA — Center for Veterinary Medicine',
    "Paws off xylitol; it's dangerous for dogs",
    'https://www.fda.gov/consumers/consumer-updates/paws-xylitol-its-dangerous-dogs',
  ),
  wsava_bcs: c(
    'wsava_bcs',
    'WSAVA',
    'Body condition score (1–9 scale) — dogs',
    'https://wsava.org/wp-content/uploads/2020/01/Body-Condition-Score-Dog.pdf',
  ),
  wsava_nutrition: c(
    'wsava_nutrition',
    'WSAVA',
    'Global nutrition guidelines',
    'https://wsava.org/global-guidelines/global-nutrition-guidelines/',
  ),
  nrc_energy: c(
    'nrc_energy',
    'National Research Council (NRC)',
    'Nutrient requirements of dogs and cats',
    'https://www.nationalacademies.org/read/10668/chapter/1',
  ),
};

export const citationList = (keys: Iterable<CitationKey>): Citation[] =>
  [...new Set(keys)].map((k) => CITATIONS[k]);
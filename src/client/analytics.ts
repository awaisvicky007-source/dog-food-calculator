/**
 * Privacy-safe analytics (FR-46, FR-49). Only whitelisted event names and non-identifying dimensions.
 * No pet names, weights or free text can be passed (enforced by types). Delivery is delegated to
 * the store's own analytics via a window hook; with no hook installed this is a no-op.
 */
export type EventName =
  | 'calculator_started'
  | 'calculation_completed'
  | 'result_expanded'
  | 'kcal_cup_entered'
  | 'profile_saved_local'
  | 'profile_exported'
  | 'food_selected'
  | 'pdf_downloaded'
  | 'add_to_cart'
  | 'reminder_created';

export interface Dims {
  life_stage?: 'puppy_under_4m' | 'puppy_4_12m' | 'adult';
  device?: 'mobile' | 'desktop';
}

declare global {
  interface Window {
    PawVortexAnalytics?: (e: { event: EventName } & Dims) => void;
  }
}

export function track(event: EventName, dims: Dims = {}) {
  try {
    const device = window.matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop';
    window.PawVortexAnalytics?.({ event, device, ...dims });
  } catch {
    /* never break the UI for analytics */
  }
}

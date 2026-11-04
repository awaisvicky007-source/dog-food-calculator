import type { FormValues, LocalPet } from './types';

/** Device-only persistence (FR-20..24). Nothing here ever touches the network. */
const K = { pets: 'pv.pets.v1', foods: 'pv.foods.v1', history: 'pv.history.v1' } as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
}

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const loadPets = (): LocalPet[] => read<LocalPet[]>(K.pets, []);

export function savePet(values: FormValues, id?: string): LocalPet[] {
  const pets = loadPets();
  const now = new Date().toISOString();
  const i = id ? pets.findIndex((p) => p.id === id) : -1;
  if (i >= 0) pets[i] = { id: pets[i]!.id, values, updatedAt: now };
  else pets.push({ id: uid(), values, updatedAt: now });
  write(K.pets, pets);
  return pets;
}

export function deletePet(id: string): LocalPet[] {
  const pets = loadPets().filter((p) => p.id !== id);
  write(K.pets, pets);
  return pets;
}

export type FoodMemory = Record<string, { kcalPerCup: string; kcalPerKg: string; gramsPerCup: string; lastUsedAt: string }>;
export const loadFoods = (): FoodMemory => read<FoodMemory>(K.foods, {});
export function rememberFood(name: string, kcalPerCup: string, kcalPerKg: string, gramsPerCup: string) {
  const n = name.trim();
  if (!n || (!kcalPerCup && !kcalPerKg)) return;
  const f = loadFoods();
  f[n] = { kcalPerCup, kcalPerKg, gramsPerCup, lastUsedAt: new Date().toISOString() };
  write(K.foods, f);
}

export interface HistoryItem {
  at: string;
  name: string;
  mer: number;
}
export function pushHistory(item: HistoryItem) {
  const h = [item, ...read<HistoryItem[]>(K.history, [])].slice(0, 10);
  write(K.history, h);
}

export function exportJson(): string {
  return JSON.stringify(
    { app: 'pawvortex-dog-food-calculator', version: 1, pets: loadPets(), foods: loadFoods() },
    null,
    2,
  );
}

const isStr = (v: unknown) => typeof v === 'string';
function validPet(p: unknown): p is LocalPet {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  const v = o.values as Record<string, unknown> | undefined;
  return isStr(o.id) && !!v && ['name', 'weight', 'weightUnit', 'age', 'ageUnit', 'adultStatus'].every((k) => isStr(v[k]));
}

/** Returns number of pets imported, or throws a readable Error. */
export function importJson(text: string): number {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const d = data as { app?: string; pets?: unknown[]; foods?: FoodMemory };
  if (d?.app !== 'pawvortex-dog-food-calculator' || !Array.isArray(d.pets))
    throw new Error('That file is not a PawVortex export.');
  const incoming = d.pets.filter(validPet);
  const existing = loadPets();
  const ids = new Set(existing.map((p) => p.id));
  write(K.pets, [...existing, ...incoming.filter((p) => !ids.has(p.id))]);
  if (d.foods && typeof d.foods === 'object') write(K.foods, { ...loadFoods(), ...d.foods });
  return incoming.length;
}

export function clearAll() {
  try {
    Object.values(K).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
}

/** Citation whitelist enforcement (PRD FR-34 / FR-35, AC-06 / AC-07). */
export const ALLOWED_SOURCE_HOSTS = [
  'merckvetmanual.com',
  'msdvetmanual.com',
  'aafco.org',
  'fda.gov',
  'nih.gov',
  'ncbi.nlm.nih.gov',
  'science.gov',
  'wsava.org',
  'nationalacademies.org',
] as const;

/** Our own origins - allowed as links/assets, never as a *citation*. */
export const INTERNAL_HOSTS = ['pawvortex.com', 'cdn.shopify.com'] as const;

/** Machine-readable namespaces (JSON-LD), not user-facing citations. */
export const TECHNICAL_HOSTS = ['schema.org'] as const;

export const PROHIBITED_PATTERNS = [
  'akc.org',
  'plainbowl',
  'petmd.com',
  'chewy.com',
  'amazon.',
  'petco.com',
  'petsmart.com',
  'dogfoodadvisor',
  'wikipedia.org',
] as const;

export type UrlClass = 'source' | 'internal' | 'technical' | 'prohibited' | 'unknown';

const hostMatches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

export function classifyUrl(raw: string): UrlClass {
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
  const lower = raw.toLowerCase();
  if (PROHIBITED_PATTERNS.some((p) => lower.includes(p))) return 'prohibited';
  if (ALLOWED_SOURCE_HOSTS.some((d) => hostMatches(host, d))) return 'source';
  if (INTERNAL_HOSTS.some((d) => hostMatches(host, d))) return 'internal';
  if (TECHNICAL_HOSTS.some((d) => hostMatches(host, d))) return 'technical';
  return 'unknown';
}

export function extractUrls(text: string): string[] {
  return [...new Set(text.match(/https?:\/\/[^\s"'<>)\\]+/g) ?? [])];
}

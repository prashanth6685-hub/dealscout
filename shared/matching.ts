import type { Product } from './types.js';

/** Matching priority: GTIN → MPN → brand+model → attributes → title similarity.
 *  A cheaper but materially different product is NEVER an exact match. */
const STOP = new Set(['the','a','an','new','with','for','and','inch','in','pack']);

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokens(s: string): Set<string> {
  return new Set(normalize(s).split(' ').filter(t => t && !STOP.has(t)));
}
export function titleSimilarity(a: string, b: string): number {
  const ta = tokens(a), tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0; ta.forEach(t => { if (tb.has(t)) inter++; });
  return inter / Math.max(ta.size, tb.size);
}

const KEY_ATTRS = ['storage', 'capacity', 'size', 'color', 'generation', 'ram', 'count'] as const;

export type MatchKind = 'exact' | 'compatible' | 'similar' | 'different';

export function matchKind(a: Product, b: Product): MatchKind {
  if (a.gtin && b.gtin) return a.gtin === b.gtin ? 'exact' : 'different';
  if (a.mpn && b.mpn && normalize(a.brand) === normalize(b.brand))
    return normalize(a.mpn) === normalize(b.mpn) ? 'exact' : 'different';
  if (a.model && b.model && normalize(a.brand) === normalize(b.brand)) {
    if (normalize(a.model) !== normalize(b.model)) return 'different';
    // same brand+model: any conflicting key attribute breaks exactness
    for (const k of KEY_ATTRS) {
      const va = a.attributes[k], vb = b.attributes[k];
      if (va && vb && normalize(va) !== normalize(vb)) return 'similar';
    }
    return 'exact';
  }
  const sim = titleSimilarity(a.title, b.title);
  if (sim >= 0.85) return 'compatible';
  if (sim >= 0.55) return 'similar';
  return 'different';
}

/** Group products into exact-match clusters; similar/different stay separate. */
export function dedupeProducts(products: Product[]): Product[] {
  const out: Product[] = [];
  for (const p of products) {
    const dup = out.find(o => matchKind(o, p) === 'exact');
    if (dup) { // merge richer metadata
      dup.gtin ??= p.gtin; dup.mpn ??= p.mpn; dup.image ??= p.image;
      dup.attributes = { ...p.attributes, ...dup.attributes };
    } else out.push({ ...p });
  }
  return out;
}

export function detectInputKind(input: string): 'name' | 'model' | 'barcode' | 'url' | 'sku' {
  const s = input.trim();
  if (/^https?:\/\//i.test(s)) return 'url';
  if (/^\d{12,13}$/.test(s.replace(/[-\s]/g, ''))) return 'barcode';
  if (/^[A-Z0-9-]{6,}$/i.test(s) && /\d/.test(s) && !s.includes(' ')) return 'model';
  return 'name';
}

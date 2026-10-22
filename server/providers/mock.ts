import { ALL_OFFERS, ALL_PRODUCTS, COUPONS } from '../catalog.js';
import { normalize, titleSimilarity } from '../../shared/matching.js';
import { emptyResult, type ProviderAdapter } from './types.js';
import type { ProviderResult } from '../../shared/types.js';

/** Development-only provider over the labeled mock catalog. Retailer names in
 *  results are illustrative; every offer carries isMock: true. */
export const MockProvider: ProviderAdapter = {
  id: 'mock', name: 'DealScout Demo Catalog', configured: true,
  configureNote: 'Development only. Disable with ENABLE_MOCK_PROVIDER=false.',
  generateAffiliateUrl: (url) => url,
  async search(query): Promise<ProviderResult> {
    const q = normalize(query);
    const matched = ALL_PRODUCTS.filter(p =>
      titleSimilarity(p.title, query) >= 0.25 || normalize(p.title).includes(q) ||
      (p.gtin && query.replace(/\D/g, '') === p.gtin) ||
      (p.model && normalize(query).includes(normalize(p.model))) ||
      q.split(' ').some(t => t.length > 3 && normalize(p.title).includes(t) && normalize(p.brand).includes(q.split(' ')[0] ?? '')));
    const ids = new Set(matched.map(p => p.id));
    const stamp = new Date().toISOString();
    return { retailerId: 'mock', retailerName: this.name, status: 'ok',
      products: matched, offers: ALL_OFFERS.filter(o => ids.has(o.productId)).map(o => ({ ...o, lastCheckedAt: stamp })), coupons: COUPONS };
  },
};
export const notConfigured = (id: string, name: string, note: string): ProviderAdapter => ({
  id, name, configured: false, configureNote: note,
  generateAffiliateUrl: (url) => url,
  async search() { return emptyResult(this, 'not-configured', note); },
});

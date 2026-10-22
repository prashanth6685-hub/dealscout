import type { Coupon, Offer, Product, ProviderResult } from '../../shared/types.js';

/** Every retailer implements this adapter. New retailer = new adapter, no core rewrite.
 *  Adapters must return explicit unknowns (shipping: null) — never invented values. */
export interface ProviderAdapter {
  id: string;
  name: string;
  configured: boolean;
  configureNote: string;
  search(query: string, timeoutMs: number): Promise<ProviderResult>;
  getProduct?(externalId: string): Promise<Product | null>;
  getOffers?(product: Product): Promise<Offer[]>;
  getPromotions?(): Promise<Coupon[]>;
  generateAffiliateUrl(productUrl: string): string;
}

export function emptyResult(p: ProviderAdapter, status: ProviderResult['status'], message?: string): ProviderResult {
  return { retailerId: p.id, retailerName: p.name, status, message, offers: [], products: [], coupons: [] };
}
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

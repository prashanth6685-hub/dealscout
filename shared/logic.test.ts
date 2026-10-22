import { describe, expect, it } from 'vitest';
import { finalPrice, rankOffers, couponEligibleForRanking } from './price.js';
import { matchKind, detectInputKind, dedupeProducts } from './matching.js';
import { summarizeHistory } from './history.js';
import { isSafeProductUrl, retailerFromUrl } from './urlSafety.js';
import type { Offer, Product } from './types.js';

const offer = (p: Partial<Offer>): Offer => ({ id: 'o1', productId: 'p1', retailerId: 'amazon', retailerName: 'Amazon', seller: 'Amazon', title: 'X', condition: 'new', itemPrice: 100, currency: 'USD', shipping: 0, tax: null, availability: 'in-stock', url: 'https://x', lastCheckedAt: new Date().toISOString(), ...p });
const prod = (p: Partial<Product>): Product => ({ id: 'a', title: 'Apple iPad Air 128GB', brand: 'Apple', model: 'MUWF3', category: 'Computers', attributes: {}, matchConfidence: 'exact', ...p });

describe('final price', () => {
  it('adds shipping + tax, subtracts verified coupon', () => {
    const f = finalPrice(offer({ tax: 8, shipping: 5, coupon: { id: 'c', retailerId: 'amazon', code: 'X', description: '', discountPercent: 10, verified: true } }));
    expect(f.discountApplied).toBe(10); expect(f.total).toBe(103);
  });
  it('unknown shipping => no total, subtotal shown, never assumed free', () => {
    const f = finalPrice(offer({ shipping: null }));
    expect(f.total).toBeNull(); expect(f.shippingConfirmed).toBe(false); expect(f.subtotalBeforeTax).toBe(100);
  });
  it('unknown tax is flagged excluded', () => { expect(finalPrice(offer({})).taxIncluded).toBe(false); });
  it('unverified coupon never affects ranking price', () => {
    const f = finalPrice(offer({ coupon: { id: 'c', retailerId: 'a', code: 'FAKE', description: '', discountPercent: 50, verified: false } }));
    expect(f.discountApplied).toBe(0);
  });
  it('membership/conditional coupons are displayed but never counted in the default total', () => {
    const c = { id: 'c', retailerId: 'a', code: null, description: '', discountPercent: 5, verified: true, requirements: 'Requires Walmart+ membership' };
    expect(couponEligibleForRanking(c, 200)).toBe(false);
    expect(finalPrice(offer({ coupon: c })).discountApplied).toBe(0);
  });
  it('expired coupon is ineligible; min-spend enforced', () => {
    expect(couponEligibleForRanking({ id: 'c', retailerId: 'a', code: null, description: '', verified: true, expiresAt: '2000-01-01' }, 100)).toBe(false);
    expect(couponEligibleForRanking({ id: 'c', retailerId: 'a', code: null, description: '', verified: true, minSpend: 200 }, 100)).toBe(false);
  });
  it('discount already in price is not double-counted', () => {
    const f = finalPrice(offer({ discountAlreadyInPrice: true, coupon: { id: 'c', retailerId: 'a', code: null, description: '', discountPercent: 10, verified: true } }));
    expect(f.discountApplied).toBe(0);
  });
  it('confirmed totals rank before unconfirmed, regardless of item price', () => {
    const ranked = rankOffers([offer({ id: 'u', itemPrice: 50, shipping: null }), offer({ id: 'c', itemPrice: 90, shipping: 0 })]);
    expect(ranked[0].id).toBe('c');
  });
  it('mixed currencies are the caller\u2019s data problem — amounts stay numeric per-offer', () => {
    expect(finalPrice(offer({ currency: 'EUR' })).subtotalBeforeTax).toBe(100);
  });
});

describe('matching', () => {
  it('same GTIN = exact, different GTIN = different', () => {
    expect(matchKind(prod({ gtin: '111', id: 'a' }), prod({ gtin: '111', id: 'b' }))).toBe('exact');
    expect(matchKind(prod({ gtin: '111' }), prod({ gtin: '222' }))).toBe('different');
  });
  it('different model is never exact (wrong-model guard)', () => {
    expect(matchKind(prod({ model: 'MUWF3' }), prod({ model: 'MUWG3' }))).toBe('different');
  });
  it('same model but different storage = similar, not exact', () => {
    expect(matchKind(prod({ attributes: { storage: '128GB' } }), prod({ attributes: { storage: '256GB' } }))).toBe('similar');
  });
  it('refurbished is a condition, not a product difference', () => {
    expect(matchKind(prod({}), prod({}))).toBe('exact'); // condition lives on Offer, not Product
  });
  it('dedupe merges exact duplicates only', () => {
    expect(dedupeProducts([prod({ id: 'a', gtin: '1' }), prod({ id: 'b', gtin: '1' }), prod({ id: 'c', gtin: '2' })])).toHaveLength(2);
  });
  it('input detection: barcode, url, model', () => {
    expect(detectInputKind('195949052484')).toBe('barcode');
    expect(detectInputKind('https://www.amazon.com/dp/B123')).toBe('url');
    expect(detectInputKind('WH1000XM5')).toBe('model');
    expect(detectInputKind('sony headphones')).toBe('name');
  });
});

describe('history', () => {
  const obs = (days: number, n: number) => Array.from({ length: n }, (_, i) => ({
    productId: 'p', retailerId: 'r', price: 100 + i, condition: 'new' as const,
    observedAt: new Date(Date.now() - (days - i * (days / n)) * 864e5).toISOString(), source: 'test' }));
  it('insufficient coverage => no low label', () => {
    const h = summarizeHistory(obs(5, 2), 100); expect(h.lowLabel).toBeNull();
  });
  it('90 days of data is labeled 90-day low, NOT 52-week', () => {
    const h = summarizeHistory(obs(90, 30), 100); expect(h.lowLabel).toBe('90-day low'); expect(h.sufficientFor52Week).toBe(false);
  });
  it('full year + enough observations earns 52-week low and pct math', () => {
    const h = summarizeHistory(obs(365, 40), 110);
    expect(h.lowLabel).toBe('52-week low'); expect(h.low).toBe(100);
    expect(h.pctAboveLow).toBe(10); // ((110-100)/100)*100
  });
});

describe('SSRF guard', () => {
  it('blocks private/loopback/credential URLs', () => {
    expect(isSafeProductUrl('http://127.0.0.1/admin').ok).toBe(false);
    expect(isSafeProductUrl('http://169.254.169.254/latest/meta-data').ok).toBe(false);
    expect(isSafeProductUrl('https://user:pass@amazon.com/x').ok).toBe(false);
    expect(isSafeProductUrl('file:///etc/passwd').ok).toBe(false);
  });
  it('allows supported retailer URLs', () => {
    expect(retailerFromUrl('https://www.walmart.com/ip/123')).toBe('walmart');
    expect(retailerFromUrl('https://evil.example/x')).toBeNull();
  });
});

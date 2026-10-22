import type { Coupon, Offer, PriceObservation, Product } from '../shared/types.js';

/**
 * DEVELOPMENT / DEMO CATALOG — clearly labeled mock data (isMock: true on every
 * offer, DEMO banner in the UI). It exists so the full UX can be exercised
 * before retailer API approvals land. It is NEVER mixed silently with live
 * results: SearchResponse.isMockData is true and the UI discloses it.
 * In production set ENABLE_MOCK_PROVIDER=false.
 */
const now = new Date().toISOString();

type Seed = {
  product: Omit<Product, 'matchConfidence'>;
  offers: [retailer: string, seller: string, price: number, shipping: number | null, tax: number | null, condition: Offer['condition'], availability: Offer['availability'], rating?: number, days?: [number, number]][];
  historyBase: number; // anchor for generated observations
};
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=60`;

export const PRODUCTS: Seed[] = [
  { product: { id: 'airpods-pro-2', title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case', brand: 'Apple', model: 'MTJV3', gtin: '195949052484', category: 'Electronics', image: img('1600294037681-f1a1895f83fc'), attributes: { generation: '2nd Gen', color: 'White' } },
    offers: [['amazon','Amazon.com',189.99,0,15.2,'new','in-stock',4.7,[1,2]],['walmart','Walmart',194.0,0,null,'new','in-stock',4.6,[2,3]],['bestbuy','Best Buy',199.99,0,16.0,'new','low-stock',4.8,[1,1]],['target','Target',199.99,5.99,null,'new','in-stock',4.5,[3,5]],['ebay','eBay — TechDeals',174.5,0,null,'refurbished','in-stock',4.4,[2,4]]],
    historyBase: 249 },
  { product: { id: 'sony-xm5', title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones', brand: 'Sony', model: 'WH1000XM5', gtin: '0027242919798', category: 'Electronics', image: img('1505740420928-5e560c06d30e'), attributes: { color: 'Black', generation: 'XM5' } },
    offers: [['amazon','Amazon.com',328.0,0,26.24,'new','in-stock',4.8,[1,2]],['bestbuy','Best Buy',329.99,0,null,'new','in-stock',4.7,[1,2]],['walmart','Walmart',348.0,0,null,'new','in-stock',4.5,[2,4]],['ebay','eBay — AudioSavings',299.0,12.0,null,'open-box','low-stock',4.3,[3,6]]],
    historyBase: 399 },
  { product: { id: 'samsung-neo-qled-65', title: 'Samsung 65" Class Neo QLED 4K TV QN90C', brand: 'Samsung', model: 'QN65QN90C', gtin: '887276741713', category: 'Electronics', image: img('1593359677879-a4bb92f829d1'), attributes: { size: '65"', generation: 'QN90C' } },
    offers: [['bestbuy','Best Buy',1099.99,0,88.0,'new','in-stock',4.6,[3,7]],['amazon','Amazon.com',1147.99,0,null,'new','in-stock',4.5,[2,5]],['walmart','Walmart',1198.0,49.0,null,'new','in-stock',4.4,[5,8]],['costco','Costco Wholesale',1099.99,null,null,'new','in-stock',4.9]],
    historyBase: 1599 },
  { product: { id: 'dyson-v15', title: 'Dyson V15 Detect Cordless Vacuum Cleaner', brand: 'Dyson', model: 'V15 Detect', gtin: '885609023113', category: 'Home and Kitchen', image: img('1558317374-067fb5f30001'), attributes: { color: 'Yellow/Nickel' } },
    offers: [['amazon','Amazon.com',549.99,0,44.0,'new','in-stock',4.6,[1,3]],['walmart','Walmart',559.0,0,null,'new','low-stock',4.4,[2,4]],['target','Target',649.99,0,null,'new','in-stock',4.3,[2,3]],['ebay','Dyson Official Refurbished (eBay)',399.99,0,null,'refurbished','in-stock',4.7,[2,5]]],
    historyBase: 749 },
  { product: { id: 'ipad-air-m2', title: 'Apple iPad Air 11" M2 chip Wi-Fi 128GB', brand: 'Apple', model: 'MUWF3', gtin: '195949268803', category: 'Computers', image: img('1544244015-0df4b3ffc6b0'), attributes: { storage: '128GB', size: '11"', color: 'Starlight' } },
    offers: [['amazon','Amazon.com',499.0,0,39.92,'new','in-stock',4.9,[1,2]],['bestbuy','Best Buy',499.99,0,null,'new','in-stock',4.8,[1,1]],['walmart','Walmart',529.0,0,null,'new','in-stock',4.6,[2,3]],['target','Target',549.99,5.99,null,'new','in-stock',4.5,[3,5]]],
    historyBase: 599 },
  { product: { id: 'ipad-air-m2-256', title: 'Apple iPad Air 11" M2 chip Wi-Fi 256GB', brand: 'Apple', model: 'MUWG3', gtin: '195949268865', category: 'Computers', image: img('1544244015-0df4b3ffc6b0'), attributes: { storage: '256GB', size: '11"', color: 'Starlight' } },
    offers: [['amazon','Amazon.com',649.0,0,null,'new','in-stock',4.9,[1,2]],['bestbuy','Best Buy',649.99,0,null,'new','in-stock',4.8,[1,2]]],
    historyBase: 699 },
  { product: { id: 'ninja-af101', title: 'Ninja AF101 Air Fryer 4-Quart', brand: 'Ninja', model: 'AF101', gtin: '622356554761', category: 'Home and Kitchen', image: img('1626074353765-517a681e40be'), attributes: { capacity: '4QT', color: 'Black' } },
    offers: [['amazon','Amazon.com',89.99,0,7.2,'new','in-stock',4.7,[1,2]],['walmart','Walmart',94.0,5.99,null,'new','in-stock',4.6,[2,3]],['target','Target',99.99,0,null,'new','in-stock',4.5,[2,4]],['kohls',"Kohl's",89.99,null,null,'new','unknown']],
    historyBase: 129 },
  { product: { id: 'kitchenaid-k45', title: 'KitchenAid Classic Series 4.5-Quart Tilt-Head Stand Mixer', brand: 'KitchenAid', model: 'K45SS', gtin: '050946000012', category: 'Home and Kitchen', image: img('1594385208974-2e75f8d7bb48'), attributes: { capacity: '4.5QT', color: 'White' } },
    offers: [['amazon','Amazon.com',259.99,0,null,'new','in-stock',4.8,[1,3]],['walmart','Walmart',249.0,0,null,'new','in-stock',4.7,[2,4]],['target','Target',279.99,0,22.4,'new','in-stock',4.6,[2,3]]],
    historyBase: 329 },
  { product: { id: 'lego-millennium', title: 'LEGO Star Wars Millennium Falcon 75192 UCS Set', brand: 'LEGO', model: '75192', gtin: '673419267691', category: 'Toys and Games', image: img('1587654780291-39c9404d746b'), attributes: { count: '7541 pieces' } },
    offers: [['amazon','Amazon.com',849.95,0,null,'new','low-stock',4.9,[2,4]],['walmart','Walmart',849.0,0,null,'new','in-stock',4.7,[3,5]],['ebay','eBay — BrickVault',799.99,24.99,null,'new','in-stock',4.8,[4,7]]],
    historyBase: 849 },
  { product: { id: 'instant-pot-duo', title: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker 6-Quart', brand: 'Instant Pot', model: 'Duo 6QT', gtin: '859716001151', category: 'Home and Kitchen', image: img('1585515320310-259814833e62'), attributes: { capacity: '6QT' } },
    offers: [['amazon','Amazon.com',79.95,0,6.4,'new','in-stock',4.7,[1,2]],['walmart','Walmart',79.0,0,null,'new','in-stock',4.6,[1,3]],['target','Target',99.99,5.99,null,'new','in-stock',4.5,[2,4]]],
    historyBase: 99 },
];

export const RETAILER_META: Record<string, { name: string; base: string }> = {
  amazon: { name: 'Amazon', base: 'https://www.amazon.com' }, walmart: { name: 'Walmart', base: 'https://www.walmart.com' },
  target: { name: 'Target', base: 'https://www.target.com' }, bestbuy: { name: 'Best Buy', base: 'https://www.bestbuy.com' },
  ebay: { name: 'eBay', base: 'https://www.ebay.com' }, costco: { name: 'Costco', base: 'https://www.costco.com' },
  kohls: { name: "Kohl's", base: 'https://www.kohls.com' },
};

export function buildOffers(): Offer[] {
  const out: Offer[] = [];
  for (const s of PRODUCTS) for (const [rid, seller, price, shipping, tax, condition, availability, rating, days] of s.offers) {
    out.push({
      id: `${s.product.id}-${rid}`, productId: s.product.id, retailerId: rid,
      retailerName: RETAILER_META[rid].name, seller, sellerRating: rating,
      title: s.product.title, image: s.product.image, condition,
      itemPrice: price, currency: 'USD', shipping, tax,
      deliveryDays: days, availability,
      url: `${RETAILER_META[rid].base}/search?q=${encodeURIComponent(s.product.title)}`,
      lastCheckedAt: now, isMock: true,
    });
  }
  // attach verified coupons to specific offers
  const ap = out.find(o => o.id === 'airpods-pro-2-walmart'); if (ap) ap.coupon = COUPONS[0];
  const dy = out.find(o => o.id === 'dyson-v15-amazon'); if (dy) dy.coupon = COUPONS[1];
  return out;
}

export const COUPONS: Coupon[] = [
  { id: 'c1', retailerId: 'walmart', code: null, description: 'Walmart+ members: extra savings on select electronics (automatic at checkout)', discountPercent: 5, requirements: 'Requires Walmart+ membership', verified: true, verifiedAt: now, sourceUrl: 'https://www.walmart.com/plus', expiresAt: new Date(Date.now() + 6 * 864e5).toISOString() },
  { id: 'c2', retailerId: 'amazon', code: 'CLIP10DYSON', description: 'Clip-on coupon on product page — 10% off Dyson V15 (already reflected in some listings; check product page)', discountPercent: 10, verified: false, verifiedAt: now, sourceUrl: 'https://www.amazon.com', expiresAt: new Date(Date.now() + 3 * 864e5).toISOString() },
  { id: 'c3', retailerId: 'target', code: null, description: 'Target Circle: 15% off one kitchen appliance', discountPercent: 15, requirements: 'Requires free Target Circle account; exclusions apply', exclusions: 'Excludes KitchenAid, Dyson', verified: true, verifiedAt: now, sourceUrl: 'https://www.target.com/circle', expiresAt: new Date(Date.now() + 9 * 864e5).toISOString() },
  { id: 'c4', retailerId: 'bestbuy', code: null, description: 'My Best Buy Plus members: member pricing on TVs', discountAmount: 50, minSpend: 999, requirements: 'Requires paid My Best Buy Plus membership', verified: true, verifiedAt: now, sourceUrl: 'https://www.bestbuy.com', expiresAt: new Date(Date.now() + 12 * 864e5).toISOString() },
  { id: 'c5', retailerId: 'ebay', code: 'REFURB15', description: '15% off select eBay Refurbished items, up to $50', discountPercent: 15, minSpend: 100, verified: false, sourceUrl: 'https://www.ebay.com', expiresAt: new Date(Date.now() - 864e5).toISOString() },
];

/** Deterministic 400-day price walk so history charts/lows are real within
 *  this dataset (never random per-request). */
export function buildHistory(): PriceObservation[] {
  const obs: PriceObservation[] = [];
  for (const s of PRODUCTS) {
    let seed = [...s.product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const cheapest = Math.min(...s.offers.map(o => o[2]));
    let price = s.historyBase;
    for (let d = 400; d >= 0; d -= 5) {
      price = Math.max(cheapest - 15, Math.min(s.historyBase, price + (rnd() - 0.52) * s.historyBase * 0.03));
      // final observation = today's cheapest so the low math is honest
      const p = d === 0 ? cheapest : +price.toFixed(2);
      obs.push({ productId: s.product.id, retailerId: 'aggregate', price: p, condition: 'new', observedAt: new Date(Date.now() - d * 864e5).toISOString(), source: 'mock-feed' });
    }
  }
  return obs;
}
export const HISTORY = buildHistory();
export const ALL_OFFERS = buildOffers();
export const ALL_PRODUCTS: Product[] = PRODUCTS.map(s => ({ ...s.product, matchConfidence: 'exact' as const }));

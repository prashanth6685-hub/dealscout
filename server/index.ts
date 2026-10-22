import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { getProviders, RETAILER_CAPABILITIES } from './providers/index.js';
import { ALL_OFFERS, ALL_PRODUCTS, COUPONS, HISTORY } from './catalog.js';
import { finalPrice, rankOffers } from '../shared/price.js';
import { dealScore, summarizeHistory } from '../shared/history.js';
import { dedupeProducts, detectInputKind } from '../shared/matching.js';
import { isSafeProductUrl, retailerFromUrl } from '../shared/urlSafety.js';
import type { Offer, Product } from '../shared/types.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
app.use(cors());
app.use(express.json({ limit: '32kb' }));

/** Privacy by architecture: no search logging, no cookies, no user tables.
 *  Only aggregate counters (provider status, click counts) are kept, in memory. */
const aggregate = { searches: 0, clicks: {} as Record<string, number> };

// Simple per-IP rate limit (counts only — IPs are not stored beyond the window)
const hits = new Map<string, { n: number; reset: number }>();
app.use('/api', (req, res, next) => {
  const key = req.ip ?? 'unknown'; const now = Date.now();
  const h = hits.get(key);
  if (!h || now > h.reset) hits.set(key, { n: 1, reset: now + 60000 });
  else if (++h.n > 120) { res.status(429).json({ error: 'Too many requests, please slow down.' }); return; }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, providers: getProviders().map(p => ({ id: p.id, name: p.name, configured: p.configured })), mockData: process.env.ENABLE_MOCK_PROVIDER !== 'false' });
});

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim().slice(0, 200);
  if (q.length < 2) { res.status(400).json({ error: 'Enter at least 2 characters.' }); return; }
  const kind = detectInputKind(q);
  if (kind === 'url') {
    const check = isSafeProductUrl(q);
    if (!check.ok) { res.status(400).json({ error: `That URL can't be used: ${check.reason}` }); return; }
    if (!retailerFromUrl(q)) { res.status(400).json({ error: 'That retailer is not supported yet. Try searching the product name or model instead.' }); return; }
  }
  aggregate.searches++;
  const providers = getProviders();
  const results = await Promise.all(providers.map(async p => {
    try { return await p.search(q, 6000); }
    catch { return { retailerId: p.id, retailerName: p.name, status: 'error' as const, message: 'Provider failed', offers: [], products: [], coupons: [] }; }
  }));
  const products = dedupeProducts(results.flatMap(r => r.products));
  const offers = results.flatMap(r => r.offers);
  const grouped = products.map(p => ({ ...p, offers: rankOffers(offers.filter(o => o.productId === p.id)) })).filter(p => p.offers.length > 0);
  const suggestions: string[] = [];
  const storages = new Set(grouped.flatMap(p => p.attributes.storage ? [p.attributes.storage] : []));
  if (storages.size > 1) suggestions.push(`Multiple storage sizes found (${[...storages].join(', ')}) — they are priced separately, not merged.`);
  if (grouped.some(p => p.offers.some(o => o.condition !== 'new'))) suggestions.push('Results include used/refurbished/open-box offers — use the condition filter to separate them.');
  res.json({
    query: q, inputKind: kind, products: grouped,
    providers: results.map(r => ({ retailerId: r.retailerId, retailerName: r.retailerName, status: r.status, message: r.message, count: r.offers.length })),
    searchedAt: new Date().toISOString(),
    isMockData: results.some(r => r.retailerId === 'mock' && r.status === 'ok'),
    suggestions,
  });
});

function productDetail(id: string) {
  const product = ALL_PRODUCTS.find(p => p.id === id);
  if (!product) return null;
  const offers = rankOffers(ALL_OFFERS.filter(o => o.productId === id));
  const best = offers.find(o => finalPrice(o).total != null) ?? offers[0];
  const history = summarizeHistory(HISTORY.filter(h => h.productId === id), best?.itemPrice ?? 0);
  const series = HISTORY.filter(h => h.productId === id);
  return { product, offers, history, series, coupons: COUPONS.filter(c => offers.some(o => o.retailerId === c.retailerId)) };
}
app.get('/api/products/:id', (req, res) => {
  const d = productDetail(req.params.id);
  if (!d) { res.status(404).json({ error: 'Product not found in the shared catalog yet. Search for it to populate live results.' }); return; }
  res.json({ ...d, isMockData: process.env.ENABLE_MOCK_PROVIDER !== 'false' });
});

app.get('/api/deals', (_req, res) => {
  const deals = ALL_OFFERS.map(o => {
    const product = ALL_PRODUCTS.find(p => p.id === o.productId)!;
    const hist = summarizeHistory(HISTORY.filter(h => h.productId === o.productId), o.itemPrice);
    const fp = finalPrice(o);
    const discountPercent = hist.average ? Math.max(0, Math.round((1 - o.itemPrice / hist.average) * 100)) : 0;
    return { ...o, product, referencePrice: hist.average ?? undefined, discountPercent,
      dealScore: dealScore({ discountPercent, pctAboveLow: hist.pctAboveLow, comparableOffers: ALL_OFFERS.filter(x => x.productId === o.productId).length, matchExact: true, hoursSinceChecked: 1, couponVerified: o.coupon?.verified }),
      history: hist, total: fp.total };
  });
  const byProduct = new Map<string, typeof deals[number]>();
  for (const d of deals) { const cur = byProduct.get(d.productId); if (!cur || d.dealScore > cur.dealScore) byProduct.set(d.productId, d); }
  const uniq = [...byProduct.values()];
  res.json({
    bestDeals: [...uniq].sort((a, b) => b.dealScore - a.dealScore).slice(0, 6),
    biggestDrops: [...uniq].sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)).slice(0, 4),
    nearLows: uniq.filter(d => d.history.pctAboveLow != null && d.history.pctAboveLow <= 5).sort((a, b) => (a.history.pctAboveLow ?? 99) - (b.history.pctAboveLow ?? 99)).slice(0, 4),
    isMockData: process.env.ENABLE_MOCK_PROVIDER !== 'false',
  });
});

app.get('/api/coupons', (_req, res) => res.json({ coupons: COUPONS, isMockData: process.env.ENABLE_MOCK_PROVIDER !== 'false' }));
app.get('/api/retailers', (_req, res) => res.json({ retailers: RETAILER_CAPABILITIES }));
app.get('/api/categories', (_req, res) => res.json({ categories: [...new Set(ALL_PRODUCTS.map(p => p.category))] }));

/** Aggregate-only outbound click counting. Body carries retailer+product ids
 *  only — never a search query or any user identifier. */
app.post('/api/click', (req, res) => {
  const rid = String(req.body?.retailerId ?? '').slice(0, 40);
  if (rid) aggregate.clicks[rid] = (aggregate.clicks[rid] ?? 0) + 1;
  res.json({ ok: true });
});
app.get('/api/stats', (_req, res) => res.json(aggregate));

// Production: serve the built frontend
const dist = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.listen(PORT, () => console.log(`DealScout API on :${PORT} (mock=${process.env.ENABLE_MOCK_PROVIDER !== 'false'})`));

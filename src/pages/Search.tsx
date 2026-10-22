import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { AffiliateNote, Badge, EmptyState, ErrorState, MockBanner, OfferButton, PriceBlock, SearchBar, SkeletonCards } from '../components/ui';
import { finalPrice, fmt } from '@shared/price';
import type { SearchResponse } from '@shared/types';
import { useRecent } from '../App';

type Sort = 'total' | 'item' | 'discount' | 'rating' | 'delivery';
export default function SearchPage() {
  const [params] = useSearchParams(); const q = params.get('q') ?? '';
  const nav = useNavigate(); const { add } = useRecent();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [err, setErr] = useState('');
  const [sort, setSort] = useState<Sort>('total');
  const [retailer, setRetailer] = useState('all'); const [cond, setCond] = useState('all');
  const [freeShip, setFreeShip] = useState(false); const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');
  useEffect(() => { if (!q) return; add(q); setData(null); setErr('');
    api<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`).then(setData).catch(e => setErr(e.message));
  }, [q]); // eslint-disable-line
  const go = (nq: string) => nav(`/search?q=${encodeURIComponent(nq)}`);
  const flat = useMemo(() => {
    if (!data) return [];
    let rows = data.products.flatMap(p => p.offers.map(o => ({ product: p, offer: o })));
    rows = rows.filter(({ offer: o }) =>
      (retailer === 'all' || o.retailerId === retailer) && (cond === 'all' || o.condition === cond) &&
      (!freeShip || o.shipping === 0) && (!inStock || o.availability === 'in-stock') &&
      (!maxPrice || finalPrice(o).subtotalBeforeTax <= Number(maxPrice)));
    const key = (o: typeof rows[number]['offer']) => finalPrice(o);
    rows.sort((a, b) => sort === 'item' ? a.offer.itemPrice - b.offer.itemPrice
      : sort === 'rating' ? (b.offer.sellerRating ?? 0) - (a.offer.sellerRating ?? 0)
      : sort === 'delivery' ? (a.offer.deliveryDays?.[0] ?? 99) - (b.offer.deliveryDays?.[0] ?? 99)
      : (key(a.offer).total ?? key(a.offer).subtotalBeforeTax + 1e6) - (key(b.offer).total ?? key(b.offer).subtotalBeforeTax + 1e6));
    return rows;
  }, [data, sort, retailer, cond, freeShip, inStock, maxPrice]);
  const bestTotalId = useMemo(() => { const withTotal = flat.filter(r => finalPrice(r.offer).total != null); return withTotal.length ? withTotal.reduce((m, r) => finalPrice(r.offer).total! < finalPrice(m.offer).total! ? r : m).offer.id : null; }, [flat]);
  const lowestItemId = useMemo(() => flat.length ? flat.reduce((m, r) => r.offer.itemPrice < m.offer.itemPrice ? r : m).offer.id : null, [flat]);
  return <main className="mx-auto max-w-7xl px-4 py-6">
    <MockBanner show={!!data?.isMockData} />
    <div className="mt-3"><SearchBar onSearch={go} size="sm" /></div>
    <h1 className="mt-5 text-2xl font-bold">Results for “{q}”</h1>
    {!data && !err && <div className="mt-6"><SkeletonCards n={4} /><p className="mt-3 text-sm text-slate-500">Searching configured retailers in parallel…</p></div>}
    {err && <div className="mt-6"><ErrorState msg={err} /></div>}
    {data && <>
      <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Retailers searched">
        {data.providers.map(p => <Badge key={p.retailerId} tone={p.status === 'ok' ? 'lime' : p.status === 'not-configured' ? 'gray' : 'red'}>
          {p.retailerName}: {p.status === 'ok' ? `${p.count} offers` : p.status === 'not-configured' ? 'not connected' : p.status}</Badge>)}
      </div>
      <p className="mt-2 text-sm text-slate-500">{flat.length} comparable offer{flat.length === 1 ? '' : 's'} · searched {new Date(data.searchedAt).toLocaleTimeString()} · We only claim coverage of the retailers listed above.</p>
      {data.suggestions.map(s => <p key={s} className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">⚠ {s}</p>)}
      <div className="mt-4 flex flex-wrap gap-2 items-center rounded-2xl bg-white border border-slate-200 p-3">
        <label className="text-sm font-medium">Sort <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="ml-1 rounded-lg border border-slate-300 px-2 py-2 min-h-[40px]">
          <option value="total">Lowest estimated final price</option><option value="item">Lowest item price</option>
          <option value="rating">Highest seller rating</option><option value="delivery">Fastest delivery</option></select></label>
        <label className="text-sm font-medium">Retailer <select value={retailer} onChange={e => setRetailer(e.target.value)} className="ml-1 rounded-lg border border-slate-300 px-2 py-2 min-h-[40px]">
          <option value="all">All</option>{[...new Set(flat.map(r => r.offer.retailerId))].map(r => <option key={r} value={r}>{r}</option>)}</select></label>
        <label className="text-sm font-medium">Condition <select value={cond} onChange={e => setCond(e.target.value)} className="ml-1 rounded-lg border border-slate-300 px-2 py-2 min-h-[40px]">
          <option value="all">All</option><option>new</option><option>used</option><option>refurbished</option><option>open-box</option><option>renewed</option></select></label>
        <label className="text-sm font-medium">Max total <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} inputMode="numeric" placeholder="$" className="ml-1 w-20 rounded-lg border border-slate-300 px-2 py-2" /></label>
        <label className="text-sm inline-flex items-center gap-1.5 py-2"><input type="checkbox" checked={freeShip} onChange={e => setFreeShip(e.target.checked)} className="h-5 w-5" /> Free shipping (verified)</label>
        <label className="text-sm inline-flex items-center gap-1.5 py-2"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="h-5 w-5" /> In stock</label>
        <button onClick={() => { setRetailer('all'); setCond('all'); setFreeShip(false); setInStock(false); setMaxPrice(''); }} className="text-sm font-semibold text-lime-700 underline px-2 py-2">Clear filters</button>
      </div>
      {flat.length === 0 ? <div className="mt-6"><EmptyState title="No comparable offers found" body="No configured retailer returned this exact product. Try the brand + model number, or a barcode. Failed or unconnected retailers are listed above — we don't present a partial search as a complete one." /></div>
      : <div className="mt-5 grid gap-3">
        {flat.map(({ product, offer: o }) => <article key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid sm:grid-cols-[110px_1fr_240px_auto] gap-4 items-center">
          <Link to={`/product/${product.id}`}>{o.image ? <img src={o.image} alt="" loading="lazy" className="h-24 w-full sm:w-[110px] rounded-xl object-cover bg-slate-100" /> : <div className="h-24 rounded-xl bg-slate-100" />}</Link>
          <div><Link to={`/product/${product.id}`} className="font-semibold hover:underline leading-snug">{product.title}</Link>
            <div className="mt-1.5 flex flex-wrap gap-1.5"><Badge>{o.retailerName}</Badge><Badge tone="gray">{o.seller}</Badge><Badge tone="gray">{o.condition}</Badge>
            {o.id === lowestItemId && <Badge tone="navy">Lowest Item Price</Badge>}
            {o.sellerRating && <Badge tone="gray">★ {o.sellerRating} seller</Badge>}
            {o.deliveryDays && <Badge tone="gray">{o.deliveryDays[0]}–{o.deliveryDays[1]} day delivery</Badge>}</div>
            <p className="mt-1 text-xs text-slate-500">{product.brand}{product.model ? ` · Model ${product.model}` : ''}{product.gtin ? ` · UPC ${product.gtin}` : ''} · Exact match</p>
            {o.coupon && <p className="mt-1 text-xs font-medium text-lime-700">Coupon: {o.coupon.description}{o.coupon.requirements ? ` (${o.coupon.requirements})` : ''} {o.coupon.verified ? '· Verified' : '· Unconfirmed'}</p>}
          </div>
          <PriceBlock offer={o} best={o.id === bestTotalId} />
          <OfferButton offer={o} />
        </article>)}
      </div>}
      <AffiliateNote />
      <p className="mt-1 text-xs text-slate-400">“Best Total Price” = lowest item + confirmed shipping + estimated tax − verified eligible coupons. Offers with unconfirmed shipping are ranked after confirmed totals and labeled — never assumed free.</p>
    </>}
  </main>;
}
export { fmt };

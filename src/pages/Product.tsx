import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { AffiliateNote, Badge, CouponCard, EmptyState, ErrorState, MockBanner, OfferButton, PriceBlock } from '../components/ui';
import { finalPrice, fmt } from '@shared/price';
import type { Coupon, HistorySummary, Offer, PriceObservation, Product } from '@shared/types';

type Detail = { product: Product; offers: Offer[]; history: HistorySummary; series: PriceObservation[]; coupons: Coupon[]; isMockData: boolean };
const RANGES: Record<string, number> = { '30 days': 30, '90 days': 90, '6 months': 182, '1 year': 365, 'All history': 100000 };
export default function ProductPage() {
  const { id } = useParams(); const [d, setD] = useState<Detail | null>(null); const [err, setErr] = useState(''); const [range, setRange] = useState('1 year');
  useEffect(() => { if (id) api<Detail>(`/api/products/${id}`).then(setD).catch(e => setErr(e.message)); }, [id]);
  const chart = useMemo(() => { if (!d) return []; const cutoff = Date.now() - RANGES[range] * 864e5;
    return d.series.filter(s => +new Date(s.observedAt) >= cutoff).map(s => ({ date: new Date(s.observedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }), price: s.price })); }, [d, range]);
  if (err) return <main className="mx-auto max-w-5xl px-4 py-8"><ErrorState msg={err} /></main>;
  if (!d) return <main className="mx-auto max-w-5xl px-4 py-8"><div className="skeleton h-64 rounded-2xl" /></main>;
  const bestId = d.offers.find(o => finalPrice(o).total != null)?.id ?? d.offers[0]?.id;
  const drops = useMemo(() => { const out: { date: string; from: number; to: number }[] = []; let prev = Infinity;
    for (const s of d.series) { if (s.price < prev - 0.01 && prev !== Infinity) out.push({ date: s.observedAt, from: prev, to: s.price }); prev = Math.min(prev, s.price); } return out.slice(-5).reverse(); }, [d]);
  return <main className="mx-auto max-w-7xl px-4 py-6">
    <MockBanner show={d.isMockData} />
    <div className="grid lg:grid-cols-[380px_1fr] gap-6 mt-3">
      <div>{d.product.image && <img src={d.product.image} alt={d.product.title} className="w-full rounded-2xl border border-slate-200 object-cover bg-white" />}
        <p className="mt-2 text-xs text-slate-500">{d.product.brand} · {d.product.model ? `Model ${d.product.model}` : ''} {d.product.gtin ? `· UPC ${d.product.gtin}` : ''} · {Object.entries(d.product.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p></div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{d.product.title}</h1>
        {d.history.lowLabel ? <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label={d.history.lowLabel} value={fmt(d.history.low!)} sub={d.history.lowDate ? new Date(d.history.lowDate).toLocaleDateString() : ''} />
          <Stat label="Current best" value={fmt(d.history.current)} sub={d.history.pctAboveLow != null ? `${d.history.pctAboveLow}% above low` : ''} />
          <Stat label="Historical average" value={d.history.average ? fmt(d.history.average) : '—'} sub={`${d.history.observations} observations`} />
          <Stat label="Data coverage" value={`${d.history.coverageDays} days`} sub={d.history.sufficientFor52Week ? 'Enough for a 52-week claim' : 'Not yet 52 weeks — label reflects actual coverage'} />
        </div> : <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">Not enough historical data to claim a low yet (needs ≥14 days and ≥3 observations). We won't invent one.</p>}
        <h2 className="mt-6 text-lg font-bold">Price history</h2>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Chart range">{Object.keys(RANGES).map(r => <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-2 text-sm font-semibold min-h-[36px] ${range === r ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300'}`}>{r}</button>)}</div>
        <div className="mt-2 h-64 rounded-2xl bg-white border border-slate-200 p-2">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip formatter={(v) => [`$${v}`, 'Observed price']} /> <Line type="monotone" dataKey="price" stroke="#65a30d" strokeWidth={2.5} dot={false} />
            {d.history.low != null && <ReferenceLine y={d.history.low} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: d.history.lowLabel ?? 'Low', fontSize: 11 }} />}
            {d.history.average != null && <ReferenceLine y={d.history.average} stroke="#94a3b8" strokeDasharray="2 4" label={{ value: 'Average', fontSize: 11 }} />}
          </LineChart></ResponsiveContainer>
        </div>
        {drops.length > 0 && <div className="mt-3"><h3 className="font-semibold">Recent price-drop events</h3><ul className="mt-1 text-sm text-slate-600 space-y-1">{drops.map((x, i) => <li key={i}>{new Date(x.date).toLocaleDateString()}: {fmt(x.from)} → <b className="text-lime-700">{fmt(x.to)}</b></li>)}</ul></div>}
      </div>
    </div>
    <h2 className="mt-8 text-xl font-bold">All comparable offers</h2>
    <div className="mt-3 grid gap-3">{d.offers.map(o => <article key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid sm:grid-cols-[1fr_240px_auto] gap-4 items-center">
      <div><div className="flex flex-wrap gap-1.5"><Badge>{o.retailerName}</Badge><Badge tone="gray">{o.seller}</Badge><Badge tone="gray">{o.condition}</Badge>{o.sellerRating && <Badge tone="gray">★ {o.sellerRating}</Badge>}</div>
      <p className="mt-1 text-sm text-slate-500">{o.availability.replace('-', ' ')}{o.deliveryDays ? ` · ${o.deliveryDays[0]}–${o.deliveryDays[1]} day delivery` : ''}</p></div>
      <PriceBlock offer={o} best={o.id === bestId} /><OfferButton offer={o} /></article>)}
    </div>
    {d.offers.length === 0 && <EmptyState title="No offers" body="No configured retailer currently lists this product." />}
    {d.coupons.length > 0 && <><h2 className="mt-8 text-xl font-bold">Coupons for these retailers</h2><div className="mt-3 grid sm:grid-cols-2 gap-3">{d.coupons.map(c => <CouponCard key={c.id} coupon={c} />)}</div></>}
    <AffiliateNote />
  </main>;
}
const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-3"><div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="text-xl font-extrabold mt-0.5">{value}</div>{sub && <div className="text-[11px] text-slate-500">{sub}</div>}</div>
);

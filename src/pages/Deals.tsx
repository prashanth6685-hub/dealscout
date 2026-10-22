import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DealCard, EmptyState, ErrorState, MockBanner, SkeletonCards } from '../components/ui';
import type { Deal } from '@shared/types';
type Resp = { bestDeals: Deal[]; biggestDrops: Deal[]; nearLows: Deal[]; isMockData: boolean };
export default function DealsPage() {
  const [d, setD] = useState<Resp | null>(null); const [err, setErr] = useState(''); const [cat, setCat] = useState('all');
  useEffect(() => { api<Resp>('/api/deals').then(setD).catch(e => setErr(e.message)); }, []);
  const filter = (list: Deal[]) => cat === 'all' ? list : list.filter(x => x.product.category === cat);
  const cats = d ? [...new Set([...d.bestDeals, ...d.biggestDrops, ...d.nearLows].map(x => x.product.category))] : [];
  const Section = ({ title, sub, list }: { title: string; sub: string; list: Deal[] }) => (
    <section className="mt-8"><h2 className="text-xl sm:text-2xl font-bold">{title}</h2><p className="text-sm text-slate-500">{sub}</p>
      <div className="mt-3">{list.length ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{list.map(x => <DealCard key={x.id} deal={x} />)}</div> : <EmptyState title="Nothing here yet" body="This section fills only from observed prices — never invented discounts." />}</div></section>);
  return <main className="mx-auto max-w-7xl px-4 py-6">
    <MockBanner show={!!d?.isMockData} />
    <h1 className="text-3xl font-extrabold mt-2">Best Deals</h1>
    <p className="text-slate-600 mt-1 max-w-2xl">Ranked by a transparent deal score: verified reduction vs the observed historical average, distance from the historical low, number of comparable offers, match confidence, freshness, and coupon reliability — never discount % alone, and never affiliate commission.</p>
    <div className="mt-4 flex gap-2 flex-wrap">{['all', ...cats].map(c => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm font-semibold min-h-[40px] ${cat === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300'}`}>{c === 'all' ? 'All categories' : c}</button>)}</div>
    {err && <div className="mt-6"><ErrorState msg={err} /></div>}
    {!d && !err && <div className="mt-6"><SkeletonCards n={4} /></div>}
    {d && <><Section title="Today's Best Deals" sub="Strongest deal scores right now." list={filter(d.bestDeals)} />
      <Section title="Biggest Price Drops" sub="Largest reductions versus the observed historical average (not MSRP)." list={filter(d.biggestDrops)} />
      <Section title="Near Historical Lows" sub="Within 5% of the low for the period we actually have data for — the label on each card says which." list={filter(d.nearLows)} /></>}
  </main>;
}

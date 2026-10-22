import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Dumbbell, Gamepad2, Home as HomeIcon, Shirt, Sparkles, Car, Briefcase, Trash2, WashingMachine, UtensilsCrossed } from 'lucide-react';
import { api } from '../lib/api';
import { CouponCard, DealCard, EmptyState, ErrorState, MockBanner, SearchBar, SkeletonCards } from '../components/ui';
import type { Coupon, Deal } from '@shared/types';
import { useRecent } from '../App';

const CATEGORIES = [
  { name: 'Electronics', icon: Cpu }, { name: 'Computers', icon: Briefcase }, { name: 'Home and Kitchen', icon: UtensilsCrossed },
  { name: 'Appliances', icon: WashingMachine }, { name: 'Clothing and Footwear', icon: Shirt }, { name: 'Beauty and Personal Care', icon: Sparkles },
  { name: 'Toys and Games', icon: Gamepad2 }, { name: 'Sports and Outdoor', icon: Dumbbell }, { name: 'Automotive', icon: Car }, { name: 'Office Supplies', icon: HomeIcon },
];
const EXAMPLES = ['Apple AirPods Pro', 'Sony WH-1000XM5 headphones', 'Samsung 65" Neo QLED TV', 'Dyson V15 Detect', 'Ninja AF101 air fryer', '195949052484'];
type DealsResp = { bestDeals: Deal[]; biggestDrops: Deal[]; nearLows: Deal[]; isMockData: boolean };

export default function HomePage() {
  const nav = useNavigate(); const { recent, add, clear } = useRecent();
  const [deals, setDeals] = useState<DealsResp | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api<DealsResp>('/api/deals').then(setDeals).catch(e => setErr(e.message));
    api<{ coupons: Coupon[] }>('/api/coupons').then(r => setCoupons(r.coupons.filter(c => !c.expiresAt || +new Date(c.expiresAt) > Date.now()).slice(0, 3))).catch(() => {});
  }, []);
  const go = (q: string) => { add(q); nav(`/search?q=${encodeURIComponent(q)}`); };
  return <main>
    <MockBanner show={!!deals?.isMockData} />
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Find the lowest price <span className="text-lime-400">before you buy.</span></h1>
        <p className="mt-3 text-slate-300 max-w-2xl mx-auto">Compare prices, shipping, coupons, and historical trends across supported shopping websites. No account. No tracking of your searches.</p>
        <div className="mt-7 text-left"><SearchBar onSearch={go} /></div>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          <span className="text-slate-400 py-2">Try:</span>
          {EXAMPLES.map(e => <button key={e} onClick={() => go(e)} className="rounded-full bg-slate-800 hover:bg-slate-700 px-3 py-2 min-h-[36px]">{e}</button>)}
        </div>
        {recent.length > 0 && <div className="mt-6 rounded-2xl bg-slate-900 p-3 text-left">
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-300">Recent searches — this session only</h2>
            <button onClick={clear} className="text-xs inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1"><Trash2 size={13} /> Clear all</button></div>
          <div className="mt-2 flex flex-wrap gap-2">{recent.map(r => <button key={r} onClick={() => go(r)} className="rounded-full bg-slate-800 px-3 py-1.5 text-sm">{r}</button>)}</div>
          <p className="mt-2 text-[11px] text-slate-500">Stored in memory only. Refresh the page and this list is gone — by design.</p>
        </div>}
      </div>
    </section>
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      {err && <ErrorState msg={`We couldn't load deals: ${err}`} />}
      <Section title="Today's Best Deals" link="/deals" linkLabel="See all deals">
        {!deals ? <SkeletonCards n={4} /> : deals.bestDeals.length ? <Grid deals={deals.bestDeals} /> : <EmptyState title="No verified deals right now" body="Deal sections populate from live retailer feeds. Nothing is ever filled in with invented discounts." />}
      </Section>
      <Section title="Biggest Price Drops" link="/deals">
        {!deals ? <SkeletonCards n={4} /> : deals.biggestDrops.length ? <Grid deals={deals.biggestDrops} /> : <EmptyState title="No price drops detected" body="Drops are calculated against observed historical averages, not MSRP." />}
      </Section>
      <Section title="Near 52-Week Lows" link="/deals">
        {!deals ? <SkeletonCards n={4} /> : deals.nearLows.length ? <Grid deals={deals.nearLows} /> : <EmptyState title="Nothing near its low" body="A product only appears here when real historical data puts it within 5% of its low for the covered period." />}
      </Section>
      <Section title="Best Coupon Offers" link="/coupons" linkLabel="See all coupons">
        {coupons.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{coupons.map(c => <CouponCard key={c.id} coupon={c} />)}</div> : <EmptyState title="No coupons loaded" body="Coupons appear only when a source provides them, with verification status shown honestly." />}
      </Section>
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-3">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(({ name, icon: Icon }) => <button key={name} onClick={() => go(name)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md min-h-[88px]">
            <Icon className="text-lime-600" size={26} /><div className="mt-2 font-semibold text-sm">{name}</div></button>)}
        </div>
      </section>
    </div>
  </main>;
}
function Section({ title, children, link, linkLabel = 'View more' }: { title: string; children: React.ReactNode; link: string; linkLabel?: string }) {
  return <section><div className="flex items-end justify-between mb-3"><h2 className="text-xl sm:text-2xl font-bold">{title}</h2><Link to={link} className="text-sm font-semibold text-lime-700 hover:underline py-1">{linkLabel} →</Link></div>{children}</section>;
}
const Grid = ({ deals }: { deals: Deal[] }) => <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{deals.slice(0, 4).map(d => <DealCard key={d.id} deal={d} />)}</div>;

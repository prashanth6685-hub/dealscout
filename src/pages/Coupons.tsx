import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CouponCard, EmptyState, ErrorState, MockBanner, SkeletonCards } from '../components/ui';
import type { Coupon } from '@shared/types';
export default function CouponsPage() {
  const [list, setList] = useState<Coupon[] | null>(null); const [mock, setMock] = useState(false); const [err, setErr] = useState(''); const [retailer, setRetailer] = useState('all');
  useEffect(() => { api<{ coupons: Coupon[]; isMockData: boolean }>('/api/coupons').then(r => { setList(r.coupons); setMock(r.isMockData); }).catch(e => setErr(e.message)); }, []);
  const shown = (list ?? []).filter(c => retailer === 'all' || c.retailerId === retailer);
  return <main className="mx-auto max-w-7xl px-4 py-6">
    <MockBanner show={mock} />
    <h1 className="text-3xl font-extrabold mt-2">Coupons & Promotions</h1>
    <p className="text-slate-600 mt-1 max-w-2xl">Only coupons from a real source are listed, each with its verification status. “Unconfirmed” means a retailer may require checkout to validate it — we never claim a code works without evidence, and we never invent codes.</p>
    <div className="mt-4 flex gap-2 flex-wrap">{['all', ...new Set((list ?? []).map(c => c.retailerId))].map(r => <button key={r} onClick={() => setRetailer(r)} className={`rounded-full px-4 py-2 text-sm font-semibold min-h-[40px] capitalize ${retailer === r ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300'}`}>{r === 'all' ? 'All retailers' : r}</button>)}</div>
    {err && <div className="mt-6"><ErrorState msg={err} /></div>}
    {!list && !err && <SkeletonCards n={3} />}
    {list && (shown.length ? <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{shown.map(c => <CouponCard key={c.id} coupon={c} />)}</div> : <EmptyState title="No coupons for this filter" body="Try another retailer, or check back — expired coupons are removed, not recycled." />)}
  </main>;
}

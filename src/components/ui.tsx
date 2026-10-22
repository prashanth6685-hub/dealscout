import { Link } from 'react-router-dom';
import { BadgePercent, CheckCircle2, ExternalLink, HelpCircle, Search, Tag, TrendingDown, X } from 'lucide-react';
import { useState } from 'react';
import { finalPrice, fmt } from '@shared/price';
import type { Deal, Offer } from '@shared/types';
import { timeAgo, trackClick } from '../lib/api';

export const Badge = ({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'lime' | 'navy' | 'amber' | 'gray' | 'red' }) => {
  const tones = { lime: 'bg-lime-100 text-lime-800 border-lime-300', navy: 'bg-slate-900 text-white border-slate-900', amber: 'bg-amber-50 text-amber-800 border-amber-300', gray: 'bg-slate-100 text-slate-700 border-slate-200', red: 'bg-red-50 text-red-700 border-red-200' };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
};

export function MockBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return <div role="note" className="bg-amber-400 text-amber-950 text-center text-[13px] font-semibold px-3 py-2">
    DEMO DATA — prices below come from a labeled sample catalog, not live retailers. Connect retailer APIs (see docs) to go live. Nothing here is a real offer.
  </div>;
}

export function AffiliateNote() {
  return <p className="text-xs text-slate-500 mt-2">DealScout may earn a commission from qualifying purchases made through links on this page — it never changes the price ranking. <Link className="underline" to="/affiliate-disclosure">Full disclosure</Link>. As an Amazon Associate I earn from qualifying purchases.</p>;
}

export function OfferButton({ offer }: { offer: Offer }) {
  const url = offer.affiliateUrl || offer.url;
  return <a href={url} target="_blank" rel="noopener noreferrer sponsored"
    onClick={() => trackClick(offer.retailerId, offer.productId)}
    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 min-h-[44px]">
    View Deal at {offer.retailerName} <ExternalLink size={15} /></a>;
}

export function PriceBlock({ offer, best }: { offer: Offer; best?: boolean }) {
  const fp = finalPrice(offer);
  return <div>
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-2xl font-extrabold tracking-tight">{fp.total != null ? fmt(fp.total) : fmt(fp.subtotalBeforeTax)}</span>
      {best && <Badge tone="lime"><Tag size={12} /> Best Total Price</Badge>}
    </div>
    <dl className="mt-1 space-y-0.5 text-[13px] text-slate-600">
      <div className="flex gap-2"><dt>Item</dt><dd className="ml-auto font-medium text-slate-800">{fmt(offer.itemPrice)}</dd></div>
      <div className="flex gap-2"><dt>Shipping</dt><dd className="ml-auto font-medium text-slate-800">{offer.shipping == null ? <span className="text-amber-700 font-semibold">Shipping not confirmed</span> : offer.shipping === 0 ? 'FREE (verified)' : fmt(offer.shipping)}</dd></div>
      <div className="flex gap-2"><dt>Tax</dt><dd className="ml-auto font-medium text-slate-800">{offer.tax == null ? 'Excluded (unknown)' : fmt(offer.tax)}</dd></div>
      {fp.discountApplied > 0 && <div className="flex gap-2 text-lime-700"><dt>Coupon</dt><dd className="ml-auto font-semibold">−{fmt(fp.discountApplied)}</dd></div>}
    </dl>
    <p className="mt-1 text-[11px] text-slate-400">Checked {timeAgo(offer.lastCheckedAt)} · {offer.availability.replace('-', ' ')}</p>
  </div>;
}

export function DealCard({ deal }: { deal: Deal }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition flex flex-col gap-2">
    <Link to={`/product/${deal.product.id}`} className="block">
      {deal.image && <img src={deal.image} alt="" loading="lazy" className="h-36 w-full rounded-xl object-cover bg-slate-100" />}
      <h3 className="mt-2 font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">{deal.product.title}</h3>
    </Link>
    <div className="flex gap-1.5 flex-wrap">
      <Badge>{deal.retailerName}</Badge>
      {deal.discountPercent ? <Badge tone="lime"><TrendingDown size={12} /> {deal.discountPercent}% vs avg</Badge> : null}
      <Badge tone="navy">Score {deal.dealScore}</Badge>
      {deal.history?.lowLabel && deal.history.pctAboveLow != null && <Badge tone="amber">{deal.history.pctAboveLow.toFixed(1)}% above {deal.history.lowLabel}</Badge>}
    </div>
    <PriceBlock offer={deal} />
    <div className="mt-auto"><OfferButton offer={deal} /></div>
  </article>;
}

export function SkeletonCards({ n = 4 }: { n?: number }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Loading">{Array.from({ length: n }).map((_, i) => <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3"><div className="skeleton h-36 rounded-xl" /><div className="skeleton h-4 mt-3 rounded" /><div className="skeleton h-4 mt-2 w-2/3 rounded" /><div className="skeleton h-8 mt-3 rounded" /></div>)}</div>;
}
export const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><HelpCircle className="mx-auto text-slate-300" size={36} /><h3 className="mt-2 font-semibold">{title}</h3><p className="text-sm text-slate-500 mt-1">{body}</p></div>
);
export const ErrorState = ({ msg }: { msg: string }) => (
  <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800 text-sm font-medium">{msg}</div>
);

export function CouponCard({ coupon }: { coupon: import('@shared/types').Coupon }) {
  const [copied, setCopied] = useState(false);
  const expired = coupon.expiresAt && +new Date(coupon.expiresAt) < Date.now();
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-semibold flex items-center gap-2"><BadgePercent className="text-lime-600" size={18} />{coupon.description}</h3>
      {coupon.verified && !expired ? <Badge tone="lime"><CheckCircle2 size={12} /> Verified</Badge> : <Badge tone="amber">{expired ? 'Expired' : 'Unconfirmed — checkout confirmation required'}</Badge>}
    </div>
    <dl className="mt-2 text-[13px] text-slate-600 space-y-1">
      {coupon.minSpend != null && <div>Minimum spend: <b>{fmt(coupon.minSpend)}</b></div>}
      {coupon.requirements && <div className="font-medium text-amber-800">⚠ {coupon.requirements}</div>}
      {coupon.exclusions && <div>Exclusions: {coupon.exclusions}</div>}
      {coupon.expiresAt && <div>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</div>}
      {coupon.verifiedAt && <div>Verified {timeAgo(coupon.verifiedAt)}</div>}
    </dl>
    {coupon.code
      ? <button className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-lime-500 bg-lime-50 px-4 py-2 font-mono font-bold min-h-[44px]"
          onClick={() => { navigator.clipboard?.writeText(coupon.code!); setCopied(true); }}>{coupon.code} <span className="font-sans text-xs font-semibold">{copied ? 'Copied ✓' : 'Tap to copy'}</span></button>
      : <p className="mt-3 text-sm font-semibold text-slate-700">No code needed — discount applies via the offer link.</p>}
  </article>;
}

export function SearchBar({ onSearch, size = 'lg' }: { onSearch: (q: string) => void; size?: 'lg' | 'sm' }) {
  const [q, setQ] = useState('');
  return <form role="search" onSubmit={e => { e.preventDefault(); if (q.trim().length >= 2) onSearch(q.trim()); }} className="w-full">
    <label htmlFor="ds-search" className="sr-only">Search any product, brand, or model</label>
    <div className={`flex items-center gap-2 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 ${size === 'lg' ? 'p-2' : 'p-1.5'}`}>
      <Search className="ml-2 text-slate-400 shrink-0" size={size === 'lg' ? 24 : 19} />
      <input id="ds-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search any product, brand, or model…"
        className={`flex-1 min-w-0 outline-none bg-transparent ${size === 'lg' ? 'text-lg py-2' : 'text-base py-1.5'}`} autoComplete="off" />
      {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')} className="p-2 text-slate-400 hover:text-slate-700"><X size={18} /></button>}
      <button type="submit" className={`rounded-xl bg-lime-500 px-5 font-bold text-slate-950 hover:bg-lime-400 min-h-[44px] ${size === 'lg' ? 'text-base' : 'text-sm px-4'}`}>Search</button>
    </div>
  </form>;
}

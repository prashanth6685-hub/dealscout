import type { HistorySummary, PriceObservation } from './types.js';

const DAY = 86400000;

/** Historical low is labeled by ACTUAL coverage. 52-week claims require
 *  ≥350 days of coverage and ≥20 observations — otherwise label what it is
 *  (e.g. "90-day low") or return null when data is too thin (<14 days / <3 obs). */
export function summarizeHistory(obs: PriceObservation[], current: number, now = new Date()): HistorySummary {
  const sorted = [...obs].sort((a, b) => +new Date(a.observedAt) - +new Date(b.observedAt));
  const coverageDays = sorted.length ? Math.floor((+now - +new Date(sorted[0].observedAt)) / DAY) : 0;
  if (sorted.length < 3 || coverageDays < 14) {
    return { coverageDays, observations: sorted.length, low: null, lowDate: null, lowLabel: null, average: null, current, pctAboveLow: null, sufficientFor52Week: false };
  }
  const lowObs = sorted.reduce((m, o) => (o.price < m.price ? o : m), sorted[0]);
  const average = +(sorted.reduce((s, o) => s + o.price, 0) / sorted.length).toFixed(2);
  const sufficientFor52Week = coverageDays >= 350 && sorted.length >= 20;
  const windowDays = sufficientFor52Week ? 364 : coverageDays >= 180 ? 180 : coverageDays >= 90 ? 90 : 30;
  const label = sufficientFor52Week ? '52-week low' : `${windowDays}-day low`;
  return {
    coverageDays, observations: sorted.length,
    low: lowObs.price, lowDate: lowObs.observedAt, lowLabel: label,
    average, current,
    pctAboveLow: lowObs.price > 0 ? +(((current - lowObs.price) / lowObs.price) * 100).toFixed(1) : null,
    sufficientFor52Week,
  };
}

/** Transparent deal score 0–100 — never discount % alone. */
export function dealScore(opts: {
  discountPercent?: number; pctAboveLow?: number | null;
  comparableOffers: number; matchExact: boolean; hoursSinceChecked: number; couponVerified?: boolean;
}): number {
  let s = 0;
  s += Math.min(35, (opts.discountPercent ?? 0) * 0.9);
  if (opts.pctAboveLow != null) s += opts.pctAboveLow <= 0 ? 25 : opts.pctAboveLow <= 3 ? 20 : opts.pctAboveLow <= 10 ? 10 : 0;
  s += Math.min(15, opts.comparableOffers * 3);
  s += opts.matchExact ? 10 : 0;
  s += opts.hoursSinceChecked <= 24 ? 10 : opts.hoursSinceChecked <= 72 ? 5 : 0;
  s += opts.couponVerified ? 5 : 0;
  return Math.round(Math.min(100, s));
}

import type { Coupon, Offer } from './types.js';

/** Coupon is eligible for default final-price ranking only when verified,
 *  unexpired, min-spend met, and not already reflected in the item price.
 *  A coupon with eligibility requirements (membership, specific payment
 *  method, first order) is NEVER counted by default — DealScout has no
 *  accounts, so it cannot know the user is eligible. It is displayed with
 *  its condition, but the ranked total stays the everyone's-price. */
export function couponEligibleForRanking(coupon: Coupon | undefined, subtotal: number, now = new Date()): boolean {
  if (!coupon || !coupon.verified) return false;
  if (coupon.requirements) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return false;
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
  if (coupon.minSpend != null && subtotal < coupon.minSpend) return false;
  return true;
}

export function couponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discountAmount != null) return Math.min(coupon.discountAmount, subtotal);
  if (coupon.discountPercent != null) return +(subtotal * coupon.discountPercent / 100).toFixed(2);
  return 0;
}

export interface FinalPrice {
  /** null when shipping is unknown — we rank those after confirmed totals and label them. */
  total: number | null;
  subtotalBeforeTax: number;
  discountApplied: number;
  taxIncluded: boolean;
  shippingConfirmed: boolean;
  breakdown: string;
}

/** Estimated final price = item + shipping + tax + fees − discounts.
 *  Unknown shipping ⇒ total is null (shown as subtotal + "Shipping not confirmed").
 *  Unknown tax ⇒ total excludes tax and is flagged. */
export function finalPrice(offer: Offer, now = new Date()): FinalPrice {
  const eligible = !offer.discountAlreadyInPrice && couponEligibleForRanking(offer.coupon, offer.itemPrice, now);
  const discountApplied = eligible && offer.coupon ? couponDiscount(offer.coupon, offer.itemPrice) : 0;
  const afterDiscount = +(offer.itemPrice - discountApplied).toFixed(2);
  const tax = offer.tax ?? 0;
  const subtotalBeforeTax = +(afterDiscount + (offer.shipping ?? 0)).toFixed(2);
  return {
    total: offer.shipping == null ? null : +(afterDiscount + offer.shipping + tax).toFixed(2),
    subtotalBeforeTax,
    discountApplied,
    taxIncluded: offer.tax != null,
    shippingConfirmed: offer.shipping != null,
    breakdown: offer.shipping == null
      ? 'Shipping not confirmed — total excludes unknown shipping' + (offer.tax == null ? ' and tax' : '')
      : offer.tax == null ? 'Tax excluded (unknown)' : 'Includes estimated tax',
  };
}

/** Ranking: confirmed totals first (ascending), then unconfirmed by subtotal.
 *  Affiliate commission NEVER participates. */
export function rankOffers(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => {
    const fa = finalPrice(a), fb = finalPrice(b);
    if (fa.total != null && fb.total != null) return fa.total - fb.total;
    if (fa.total != null) return -1;
    if (fb.total != null) return 1;
    return fa.subtotalBeforeTax - fb.subtotalBeforeTax;
  });
}

export const fmt = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);

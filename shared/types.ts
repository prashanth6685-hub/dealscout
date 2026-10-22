export type Condition = 'new' | 'used' | 'refurbished' | 'open-box' | 'renewed';
export type Availability = 'in-stock' | 'low-stock' | 'out-of-stock' | 'unknown';
/** Explicit unknown — we never invent shipping/tax. `null` means "not confirmed". */
export type MoneyOrUnknown = number | null;

export interface Product {
  id: string;
  title: string;
  brand: string;
  model?: string;
  gtin?: string; // UPC/EAN
  mpn?: string; // manufacturer part number
  category: string;
  image?: string;
  attributes: Record<string, string>; // storage, color, size, generation…
  matchConfidence: 'exact' | 'probable' | 'similar';
}

export interface Coupon {
  id: string;
  retailerId: string;
  code: string | null; // null = automatic promotion, use "View Offer"
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  startsAt?: string;
  expiresAt?: string;
  requirements?: string; // membership / payment / first-order conditions
  exclusions?: string;
  sourceUrl?: string;
  verified: boolean; // only true with evidence
  verifiedAt?: string;
  eligibleSubtotal?: number;
}

export interface Offer {
  id: string;
  productId: string;
  retailerId: string;
  retailerName: string;
  seller: string;
  sellerRating?: number; // only when comparable data exists
  title: string;
  image?: string;
  condition: Condition;
  itemPrice: number;
  currency: string;
  shipping: MoneyOrUnknown; // null = "Shipping not confirmed"
  tax: MoneyOrUnknown; // null = tax excluded / unknown
  coupon?: Coupon;
  /** true when coupon discount is already reflected in itemPrice (never double-count) */
  discountAlreadyInPrice?: boolean;
  deliveryDays?: [number, number];
  availability: Availability;
  url: string;
  affiliateUrl?: string;
  lastCheckedAt: string; // ISO
  isMock?: boolean;
}

export interface PriceObservation {
  productId: string;
  retailerId: string;
  price: number;
  condition: Condition;
  observedAt: string; // ISO date
  source: string;
}

export interface HistorySummary {
  coverageDays: number;
  observations: number;
  low: number | null;
  lowDate: string | null;
  lowLabel: string | null; // "52-week low" | "90-day low" | null when insufficient
  average: number | null;
  current: number;
  pctAboveLow: number | null;
  sufficientFor52Week: boolean;
}

export interface ProviderResult {
  retailerId: string;
  retailerName: string;
  status: 'ok' | 'error' | 'timeout' | 'not-configured';
  message?: string;
  offers: Offer[];
  products: Product[];
  coupons: Coupon[];
}

export interface SearchResponse {
  query: string;
  inputKind: 'name' | 'model' | 'barcode' | 'url' | 'sku';
  products: (Product & { offers: Offer[] })[];
  providers: { retailerId: string; retailerName: string; status: ProviderResult['status']; message?: string; count: number }[];
  searchedAt: string;
  isMockData: boolean;
  suggestions: string[];
}

export interface Deal extends Offer {
  product: Product;
  referencePrice?: number; // previous observed / MSRP — labeled by caller
  discountPercent?: number;
  dealScore: number;
  history?: HistorySummary;
}

# DealScout — Find it cheaper. Buy it smarter.

A privacy-first price comparison & deal discovery platform. No accounts, no
login, no stored search history — recent searches live in browser memory only
and vanish on refresh.

## What works today
- Homepage: hero search, Today's Best Deals, Biggest Price Drops, Near
  Historical Lows, Best Coupon Offers, Popular Categories, session-only
  Recent Searches — each with loading / empty / error states.
- Search: name / brand / model / UPC barcode / supported product URL input
  detection, parallel provider queries with timeouts, per-provider status
  shown honestly (including "not connected"), exact-match grouping, sorting
  (final price, item price, seller rating, delivery), filters (retailer,
  condition, price, verified free shipping, in-stock, coupon), and separate
  **Best Total Price** vs **Lowest Item Price** badges.
- Product detail: offers table, price-history chart (30d / 90d / 6mo / 1yr /
  all), historical low labeled by *actual* coverage (a 90-day dataset is a
  "90-day low", never a fake "52-week low"), price-drop events.
- Deals page with a transparent deal score; Coupons page with verification
  status, conditions, expirations and copy-code.
- Affiliate-ready: retailer-named outbound buttons, `rel="sponsored"`,
  aggregate-only click counting, FTC + Amazon Associates disclosure pages.
- Demo catalog provider (clearly bannered DEMO DATA) so the full UX runs
  before retailer approvals land. Set `ENABLE_MOCK_PROVIDER=false` in
  production.

## Run it
```bash
cp .env.example .env   # ENABLE_MOCK_PROVIDER=true for local demo
npm install
npm run dev            # web http://localhost:5173 · API http://localhost:4000
npm test               # matching, pricing, history, coupons, SSRF, privacy
npm run build && npm start   # production build, API serves the frontend
```

## Going live with a retailer
1. Get approved for that retailer's API/affiliate program (see
   `docs/RETAILERS.md` — approval is never automatic).
2. Put the credentials in `.env` (server-only; never in frontend code).
3. The adapter activates automatically (eBay Browse API adapter is fully
   implemented; others document exactly what's needed).

## Architecture
- `src/` React + TypeScript + Tailwind frontend (Vite)
- `server/` Express API — search orchestration, provider adapters
  (`server/providers/`), labeled demo catalog (`server/catalog.ts`)
- `shared/` pure logic shared by both: types, price math, product matching,
  history/lows, SSRF URL guard — all unit-tested
- `db/migrations/` PostgreSQL schema for the shared catalog (products,
  offers, price observations, coupons, aggregate clicks). Deliberately no
  user or search-history tables; a test enforces this.

Docs: [Retailers](docs/RETAILERS.md) · [Affiliate setup](docs/AFFILIATE.md) ·
[Deployment](docs/DEPLOYMENT.md) · [Limitations & roadmap](docs/LIMITATIONS.md)

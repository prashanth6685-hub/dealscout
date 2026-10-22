# Known limitations

1. **Live data today: none by default.** Retailer APIs require approvals
   DealScout cannot grant itself. Until credentials are added, the app runs
   on the bannered demo catalog. The eBay adapter is production code; the
   rest are documented stubs that report "not configured" honestly.
2. Tax is shown only when a provider supplies an estimate; otherwise totals
   are labeled "Tax excluded (unknown)". No tax engine is bundled.
3. Shipping is unknown for many listings/feeds and is labeled "Shipping not
   confirmed"; such offers rank after confirmed totals.
4. Historical data starts accumulating only when a real feed is connected;
   the demo history is generated sample data inside the demo catalog.
5. Product matching beyond GTIN/MPN relies on brand+model+attributes;
   marketplace listings with poor metadata land in "probable/similar" and
   are not merged into exact-match pricing.
6. No price alerts, wishlists, or accounts — by design (privacy spec), not
   an omission.
7. Coupon "verified" status in demo data illustrates the workflow; live
   verification requires each retailer's promotion feed or checkout-level
   validation, which some programs prohibit automating.

# Roadmap
- Activate eBay (credentials) → Best Buy (free key) → Walmart → Amazon PA-API.
- Scheduled price-observation ingestion into PostgreSQL + drop detection.
- Barcode/image search (camera) once a GTIN lookup provider is approved.
- Category landing pages with SEO from the shared catalog.
- More affiliate networks (Impact, Awin, CJ) as feed-based adapters for
  Target / Home Depot / Lowe's.
- Redis caching respecting each program's freshness rules.

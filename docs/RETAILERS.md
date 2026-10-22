# Supported retailers & real data capabilities

DealScout only claims coverage of retailers whose adapter actually returned
results — every search response lists each provider's status.

| Retailer | Status | Search source | Shipping | Coupons | Affiliate | Needs |
|---|---|---|---|---|---|---|
| eBay | **Adapter built** | Browse API (official) | When the listing exposes it, else "not confirmed" | Promotions feed | eBay Partner Network | Developer account, `EBAY_CLIENT_ID/SECRET`, EPN `EBAY_CAMPAIGN_ID` |
| Amazon | Pending approval | Product Advertising API | Not exposed by PA-API → unknown | Limited | Amazon Associates | PA-API access (requires Associates account with qualifying sales) + `AMAZON_ASSOCIATE_TAG` |
| Walmart | Pending approval | Content/Affiliate API | Partial | Feed-dependent | Walmart Affiliate | API approval, `WALMART_API_KEY` |
| Best Buy | Adapter pending key | Products API | Partial | Offers feed | Best Buy Affiliate | Free developer key, `BESTBUY_API_KEY` |
| AliExpress | Pending approval | Affiliate API | When exposed | Affiliate promotions | AliExpress Affiliate | App key/secret + tracking id |
| Target | No public API | Approved affiliate feed only | Feed-dependent | Target Circle via feed | Target Partners | Network (e.g. impact.com) feed agreement |
| Home Depot | No public API | Affiliate feed only | Feed-dependent | Feed-dependent | Affiliate networks | Network feed agreement |
| Lowe's | No public API | Affiliate feed only | Feed-dependent | Feed-dependent | Affiliate networks | Network feed agreement |
| Newegg | Pending approval | Partner API | Partial | Partial | Newegg Affiliate | Partner approval |
| Costco | No public API | Authorized access only (rarely granted) | Unknown | Unknown | None public | Direct agreement |

Rules enforced in code: no scraping, no CAPTCHA bypass, per-provider
timeouts (6s), partial results are labeled partial, unknown shipping/tax is
rendered as unknown — never as $0/free.

## Adding a retailer
Implement `ProviderAdapter` in `server/providers/<name>.ts` (search,
optional product/offers/promotions, `generateAffiliateUrl`), register it in
`server/providers/index.ts`, add its row above, and add credentials to
`.env.example`. Nothing else changes.

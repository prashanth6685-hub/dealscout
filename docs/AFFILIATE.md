# Affiliate integration

- Credentials live **only** in server environment variables (see
  `.env.example`). They are never shipped to the browser.
- Each adapter's `generateAffiliateUrl()` builds the program-approved
  tracking link. If no affiliate ID is configured, the adapter returns the
  ordinary retailer URL — DealScout never fakes tracking parameters.
- Outbound buttons always name the destination ("View Deal at Walmart")
  and use `rel="noopener noreferrer sponsored"`.
- Click reporting is aggregate-only: `POST /api/click` accepts a retailer
  and product id and increments a daily counter. No query, no user id, no IP
  is stored. A click is never reported as a commission — commissions exist
  only when the retailer's own dashboard confirms a qualifying purchase.
- Ranking is commission-blind: `shared/price.ts` `rankOffers()` has no
  commission input, and tests cover the final-price math.
- Disclosures: a short note under every results list, plus
  `/affiliate-disclosure` with the FTC language and the exact Amazon
  Associates sentence: "As an Amazon Associate I earn from qualifying purchases."
  Also in the site footer.

Before enabling a program, confirm in its current operating agreement:
link format, price-display freshness requirements, image usage, caching
limits, and prohibited placements (e.g. Amazon price display rules are
strict — prices must include a timestamp and refresh cadence).

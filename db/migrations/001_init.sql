-- DealScout shared catalog schema (PostgreSQL).
-- PRIVACY INVARIANT: there is deliberately NO user table, NO search_history
-- table, and no column anywhere that associates a product/offer with a person,
-- device, IP, or session. Enforced by tests (server/privacy.test.ts).
CREATE TABLE retailers (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, integration_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', supported_features JSONB NOT NULL DEFAULT '{}',
  attribution TEXT
);
CREATE TABLE products (
  id TEXT PRIMARY KEY, brand TEXT NOT NULL, title TEXT NOT NULL, model TEXT,
  gtin TEXT, mpn TEXT, category TEXT NOT NULL, attributes JSONB NOT NULL DEFAULT '{}',
  image_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX products_gtin_idx ON products (gtin) WHERE gtin IS NOT NULL;
CREATE INDEX products_brand_model_idx ON products (brand, model);
CREATE TABLE offers (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
  retailer_id TEXT NOT NULL REFERENCES retailers(id), seller TEXT NOT NULL,
  seller_rating NUMERIC(3,2), item_price NUMERIC(12,2) NOT NULL, currency CHAR(3) NOT NULL DEFAULT 'USD',
  shipping NUMERIC(12,2),            -- NULL = shipping not confirmed (never invent)
  tax NUMERIC(12,2),                 -- NULL = tax unknown/excluded
  condition TEXT NOT NULL, availability TEXT NOT NULL,
  product_url TEXT NOT NULL, affiliate_url TEXT,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX offers_product_price_idx ON offers (product_id, item_price);
CREATE TABLE price_observations (
  id BIGSERIAL PRIMARY KEY, product_id TEXT NOT NULL REFERENCES products(id),
  retailer_id TEXT NOT NULL, offer_id TEXT, price NUMERIC(12,2) NOT NULL,
  condition TEXT NOT NULL, observed_at TIMESTAMPTZ NOT NULL DEFAULT now(), source TEXT NOT NULL
);
CREATE INDEX price_obs_product_time_idx ON price_observations (product_id, observed_at DESC);
CREATE TABLE coupons (
  id TEXT PRIMARY KEY, retailer_id TEXT NOT NULL REFERENCES retailers(id),
  code TEXT, description TEXT NOT NULL, discount_percent NUMERIC(5,2), discount_amount NUMERIC(12,2),
  min_spend NUMERIC(12,2), starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
  requirements TEXT, exclusions TEXT, source_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false, verified_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Aggregate affiliate clicks ONLY: counts per retailer per day. No user keys.
CREATE TABLE affiliate_click_daily (
  retailer_id TEXT NOT NULL, day DATE NOT NULL, clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (retailer_id, day)
);

import type { ProviderAdapter } from './types.js';
import { MockProvider, notConfigured } from './mock.js';
import { EbayProvider } from './ebay.js';

/** Registry — add a retailer by adding one adapter here. Each entry documents
 *  its real data capabilities; see docs/RETAILERS.md. */
export function getProviders(): ProviderAdapter[] {
  const real: ProviderAdapter[] = [
    EbayProvider,
    notConfigured('amazon', 'Amazon', 'Requires Amazon Product Advertising API access + Associates approval (sales history required). Set AMAZON_PA_ACCESS_KEY, AMAZON_PA_SECRET_KEY, AMAZON_ASSOCIATE_TAG.'),
    notConfigured('walmart', 'Walmart', 'Requires Walmart Affiliate/Content API approval. Set WALMART_API_KEY, WALMART_AFFILIATE_ID.'),
    notConfigured('bestbuy', 'Best Buy', 'Requires a Best Buy API key (developer.bestbuy.com). Set BESTBUY_API_KEY. Adapter pending key.'),
    notConfigured('aliexpress', 'AliExpress', 'Requires AliExpress Affiliate API approval. Set ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ALIEXPRESS_TRACKING_ID.'),
    notConfigured('target', 'Target', 'Target has no public product search API; requires an approved affiliate feed (e.g. via an affiliate network).'),
    notConfigured('homedepot', 'Home Depot', 'Requires affiliate-network product feed access; no public search API.'),
    notConfigured('lowes', "Lowe's", 'Requires affiliate-network product feed access; no public search API.'),
    notConfigured('newegg', 'Newegg', 'Requires Newegg affiliate/API partner approval.'),
    notConfigured('costco', 'Costco', 'No public product API; requires authorized data access, which Costco rarely grants.'),
  ];
  const list = [...real];
  if (process.env.ENABLE_MOCK_PROVIDER !== 'false') list.unshift(MockProvider);
  return list;
}
export const RETAILER_CAPABILITIES = [
  { id: 'ebay', name: 'eBay', status: 'Adapter built — needs credentials', search: true, shipping: 'When exposed by listing', coupons: 'Via promotions feed', affiliate: 'eBay Partner Network' },
  { id: 'amazon', name: 'Amazon', status: 'Pending approval', search: 'PA-API (approval required)', shipping: 'Not via PA-API', coupons: 'Limited', affiliate: 'Amazon Associates' },
  { id: 'walmart', name: 'Walmart', status: 'Pending approval', search: 'Content API (approval required)', shipping: 'Partial', coupons: 'Feed-dependent', affiliate: 'Walmart Affiliate' },
  { id: 'bestbuy', name: 'Best Buy', status: 'Adapter pending key', search: 'Products API', shipping: 'Partial', coupons: 'Offers feed', affiliate: 'Best Buy Affiliate' },
  { id: 'aliexpress', name: 'AliExpress', status: 'Pending approval', search: 'Affiliate API', shipping: 'When exposed', coupons: 'Affiliate promotions', affiliate: 'AliExpress Affiliate' },
  { id: 'target', name: 'Target', status: 'No public API', search: 'Affiliate feed only', shipping: 'Feed-dependent', coupons: 'Feed-dependent', affiliate: 'Target Partners' },
  { id: 'homedepot', name: 'Home Depot', status: 'No public API', search: 'Affiliate feed only', shipping: 'Feed-dependent', coupons: 'Feed-dependent', affiliate: 'Affiliate networks' },
  { id: 'lowes', name: "Lowe's", status: 'No public API', search: 'Affiliate feed only', shipping: 'Feed-dependent', coupons: 'Feed-dependent', affiliate: 'Affiliate networks' },
  { id: 'newegg', name: 'Newegg', status: 'Pending approval', search: 'Partner API', shipping: 'Partial', coupons: 'Partial', affiliate: 'Newegg Affiliate' },
  { id: 'costco', name: 'Costco', status: 'No public API', search: 'Authorized access only', shipping: 'Unknown', coupons: 'Unknown', affiliate: 'None public' },
];

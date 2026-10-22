/** SSRF guard for user-supplied product URLs: https/http only, no credentials,
 *  no private/loopback/link-local hosts, no IP-literal private ranges. */
const PRIVATE = [
  /^localhost$/i, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, /^0\./, /^\[?::1\]?$/, /\.local$/i, /\.internal$/i,
];
export function isSafeProductUrl(raw: string): { ok: boolean; reason?: string; url?: URL } {
  let url: URL;
  try { url = new URL(raw); } catch { return { ok: false, reason: 'Not a valid URL' }; }
  if (!['http:', 'https:'].includes(url.protocol)) return { ok: false, reason: 'Only http/https URLs are allowed' };
  if (url.username || url.password) return { ok: false, reason: 'URLs with credentials are not allowed' };
  if (PRIVATE.some(r => r.test(url.hostname))) return { ok: false, reason: 'Private or local addresses are not allowed' };
  return { ok: true, url };
}
export const SUPPORTED_URL_HOSTS = ['amazon.com','www.amazon.com','walmart.com','www.walmart.com','target.com','www.target.com','bestbuy.com','www.bestbuy.com','ebay.com','www.ebay.com','aliexpress.com','www.aliexpress.com','homedepot.com','www.homedepot.com','lowes.com','www.lowes.com','newegg.com','www.newegg.com','costco.com','www.costco.com'];
export function retailerFromUrl(raw: string): string | null {
  const check = isSafeProductUrl(raw);
  if (!check.ok || !check.url) return null;
  return SUPPORTED_URL_HOSTS.includes(check.url.hostname) ? check.url.hostname.replace('www.', '').split('.')[0] : null;
}

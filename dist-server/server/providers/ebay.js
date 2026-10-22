import { emptyResult, withTimeout } from './types.js';
/** eBay Browse API (official) + eBay Partner Network affiliate links.
 *  Real integration: activates only when EBAY_CLIENT_ID/SECRET are set.
 *  Docs: https://developer.ebay.com/api-docs/buy/browse/overview.html */
export const EbayProvider = {
    id: 'ebay', name: 'eBay',
    configured: !!(process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET),
    configureNote: 'Requires eBay Developer account + Browse API approval. Set EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_CAMPAIGN_ID (EPN).',
    generateAffiliateUrl(url) {
        const camp = process.env.EBAY_CAMPAIGN_ID;
        if (!camp)
            return url; // ordinary link when no affiliate id — never fake tracking
        const rover = new URL('https://www.ebay.com/itm/');
        return `https://rover.ebay.com/rover/1/711-53200-19255-0/1?campid=${encodeURIComponent(camp)}&mpre=${encodeURIComponent(url)}&_=${rover.pathname.length}`.replace(/&_=\d+$/, '');
    },
    async search(query, timeoutMs) {
        if (!this.configured)
            return emptyResult(this, 'not-configured', this.configureNote);
        try {
            return await withTimeout((async () => {
                const creds = Buffer.from(`${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`).toString('base64');
                const tok = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
                    method: 'POST', headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
                }).then(r => r.json());
                if (!tok.access_token)
                    return emptyResult(this, 'error', 'eBay OAuth failed');
                const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=20`, {
                    headers: { Authorization: `Bearer ${tok.access_token}` },
                }).then(r => r.json());
                const products = [], offers = [];
                for (const it of res.itemSummaries ?? []) {
                    const pid = `ebay-${String(it.itemId)}`;
                    products.push({ id: pid, title: String(it.title ?? ''), brand: '', category: 'Marketplace', image: it.image?.imageUrl, attributes: {}, matchConfidence: 'probable' });
                    const price = Number(it.price?.value ?? NaN);
                    const ship = it.shippingOptions?.[0]?.shippingCost?.value;
                    offers.push({ id: `${pid}-o`, productId: pid, retailerId: 'ebay', retailerName: 'eBay',
                        seller: String(it.seller?.username ?? 'eBay seller'),
                        title: String(it.title ?? ''), image: it.image?.imageUrl,
                        condition: 'new', itemPrice: price, currency: 'USD',
                        shipping: ship != null ? Number(ship) : null, tax: null,
                        availability: 'in-stock', url: String(it.itemWebUrl ?? ''),
                        affiliateUrl: this.generateAffiliateUrl(String(it.itemWebUrl ?? '')),
                        lastCheckedAt: new Date().toISOString() });
                }
                return { retailerId: 'ebay', retailerName: 'eBay', status: 'ok', products, offers, coupons: [] };
            })(), timeoutMs);
        }
        catch {
            return emptyResult(this, 'timeout', 'eBay did not respond in time');
        }
    },
};

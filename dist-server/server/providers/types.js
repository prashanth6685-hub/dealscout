export function emptyResult(p, status, message) {
    return { retailerId: p.id, retailerName: p.name, status, message, offers: [], products: [], coupons: [] };
}
export function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

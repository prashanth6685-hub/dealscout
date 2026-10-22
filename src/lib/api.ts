export async function api<T>(path: string): Promise<T> {
  const r = await fetch(path);
  if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error((b as { error?: string }).error || `Request failed (${r.status})`); }
  return r.json() as Promise<T>;
}
export function trackClick(retailerId: string, productId: string) {
  // Aggregate only: retailer + product ids, no query, no user identifier.
  fetch('/api/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ retailerId, productId }), keepalive: true }).catch(() => {});
}
export const timeAgo = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - +new Date(iso)) / 60000));
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

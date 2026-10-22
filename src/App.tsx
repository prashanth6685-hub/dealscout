import { createContext, useCallback, useContext, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import ProductPage from './pages/Product';
import DealsPage from './pages/Deals';
import CouponsPage from './pages/Coupons';
import { AboutPage, DisclosurePage, PrivacyPage, TermsPage } from './pages/Static';

/** Recent searches live ONLY in React state (memory). No localStorage,
 *  no sessionStorage, no server call — refresh wipes them. Enforced by test. */
const RecentCtx = createContext<{ recent: string[]; add: (q: string) => void; clear: () => void }>({ recent: [], add: () => {}, clear: () => {} });
export const useRecent = () => useContext(RecentCtx);
function RecentProvider({ children }: { children: React.ReactNode }) {
  const [recent, setRecent] = useState<string[]>([]);
  const add = useCallback((q: string) => setRecent(r => [q, ...r.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8)), []);
  const clear = useCallback(() => setRecent([]), []);
  return <RecentCtx.Provider value={{ recent, add, clear }}>{children}</RecentCtx.Provider>;
}

const NAV = [['/', 'Home'], ['/search?q=headphones', 'Compare Prices'], ['/deals', 'Best Deals'], ['/deals', 'Historical Lows'], ['/coupons', 'Coupons']] as const;
function Header() {
  const [open, setOpen] = useState(false); const nav = useNavigate();
  return <header className="bg-slate-950 text-white sticky top-0 z-40 shadow">
    <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight" aria-label="DealScout home">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-lime-500 text-slate-950"><Search size={20} strokeWidth={3} /></span>
        Deal<span className="text-lime-400 -ml-2">Scout</span></Link>
      <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main">
        {NAV.map(([to, label]) => <NavLink key={label} to={to} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white">{label}</NavLink>)}
      </nav>
      <div className="ml-auto hidden md:block text-xs text-slate-400">No account · No search tracking</div>
      <button className="md:hidden ml-auto p-2 rounded-lg hover:bg-slate-800 min-h-[44px] min-w-[44px]" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav className="md:hidden border-t border-slate-800 px-4 py-2" aria-label="Mobile">
      {NAV.map(([to, label]) => <button key={label} onClick={() => { setOpen(false); nav(to); }} className="block w-full text-left px-2 py-3 rounded-lg font-medium hover:bg-slate-800 min-h-[44px]">{label}</button>)}
    </nav>}
  </header>;
}
function Footer() {
  return <footer className="bg-slate-950 text-slate-400 mt-0">
    <div className="mx-auto max-w-7xl px-4 py-10 grid sm:grid-cols-3 gap-6 text-sm">
      <div><div className="text-white font-extrabold text-lg">Deal<span className="text-lime-400">Scout</span></div><p className="mt-2">Find it cheaper. Buy it smarter.<br />Prices show when they were last checked; unknown shipping or tax is labeled, never invented.</p></div>
      <nav aria-label="Company" className="space-y-2"><div className="text-white font-semibold">Company</div><Link className="block hover:text-white" to="/about">About & Contact</Link><Link className="block hover:text-white" to="/deals">Best Deals</Link><Link className="block hover:text-white" to="/coupons">Coupons</Link></nav>
      <nav aria-label="Legal" className="space-y-2"><div className="text-white font-semibold">Trust & Legal</div><Link className="block hover:text-white" to="/privacy">Privacy Policy</Link><Link className="block hover:text-white" to="/terms">Terms of Use</Link><Link className="block hover:text-white" to="/affiliate-disclosure">Affiliate Disclosure</Link></nav>
    </div>
    <div className="border-t border-slate-800 py-4 text-center text-xs">As an Amazon Associate I earn from qualifying purchases. Prices are estimates — the retailer's checkout total is final.</div>
  </footer>;
}
export default function App() {
  return <BrowserRouter><RecentProvider><div className="min-h-screen flex flex-col"><Header /><div className="flex-1"><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/search" element={<SearchPage />} />
    <Route path="/product/:id" element={<ProductPage />} /><Route path="/deals" element={<DealsPage />} />
    <Route path="/coupons" element={<CouponsPage />} /><Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms" element={<TermsPage />} /><Route path="/affiliate-disclosure" element={<DisclosurePage />} />
    <Route path="/about" element={<AboutPage />} />
  </Routes></div><Footer /></div></RecentProvider></BrowserRouter>;
}

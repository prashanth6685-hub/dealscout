const Wrap = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-extrabold">{title}</h1><div className="mt-4 space-y-4 text-slate-700 leading-relaxed text-[15px]">{children}</div></main>);
export const PrivacyPage = () => <Wrap title="Privacy Policy">
  <p><b>The short version: DealScout has no accounts, and your searches are never stored.</b></p>
  <p>We do not require registration or login for any feature. Recent searches exist only in your browser's memory while this tab is open — refresh the page and they are gone. They are never sent to a database, analytics service, or server log.</p>
  <p>We keep only anonymous, aggregate operational counts (for example, how many outbound clicks each retailer received today) so we can keep the service running and report affiliate activity. Those counts contain no search terms, no identifiers, and nothing that can be tied to a person or device.</p>
  <p>We do not use session-replay tools or advertising trackers that collect search queries. When you click through to a retailer, that retailer's own privacy policy applies to your visit and purchase there.</p>
  <p>Our shared product catalog, price history, and coupon database describe products — never people — and no record in them is associated with any user's search.</p>
</Wrap>;
export const TermsPage = () => <Wrap title="Terms of Use">
  <p>Prices, shipping, taxes, coupons, and availability shown on DealScout are estimates based on the most recent data our configured retailer sources provided, and each result shows when it was last checked. The final price is always the one shown by the retailer at checkout.</p>
  <p>Historical lows describe the lowest price observed in our dataset for the stated coverage period; they are not a guarantee about every price ever offered anywhere. Where our data covers less than 52 weeks, results are labeled with the actual period (for example, “90-day low”).</p>
  <p>Purchases are completed on the retailer's website under the retailer's terms. DealScout is not the seller and is not responsible for fulfillment, returns, or retailer pricing errors.</p>
</Wrap>;
export const DisclosurePage = () => <Wrap title="Affiliate Disclosure">
  <p>DealScout is free to use and is supported by affiliate commissions. When you click certain retailer links and make a qualifying purchase, we may earn a commission at no additional cost to you.</p>
  <p><b>As an Amazon Associate I earn from qualifying purchases.</b></p>
  <p>Affiliate relationships never influence our price rankings: the “Best Total Price” is always the lowest comparable estimated final price, regardless of commission. Links are labeled with the retailer name before you click, and sponsored links use <code>rel="sponsored"</code>.</p>
  <p>This disclosure is provided in accordance with the FTC's endorsement guides (16 CFR Part 255) and each affiliate program's operating agreement.</p>
</Wrap>;
export const AboutPage = () => <Wrap title="About DealScout">
  <p><b>Find it cheaper. Buy it smarter.</b> DealScout compares the estimated final purchase cost — item price plus confirmed shipping and estimated tax, minus verified coupons — across the shopping websites we actually support, and shows the price history behind every deal so a “discount” has to prove itself against real observed prices.</p>
  <p>We are deliberately honest about coverage: every search lists the retailers searched and any that failed or are not yet connected. We never claim to search “every” website.</p>
  <p>Questions or a correction to a listing? Email <a className="underline" href="mailto:support@dealscout.example">support@dealscout.example</a>. (Replace with your real support address before launch.)</p>
  <p><b>Pricing disclaimer:</b> prices change frequently and can differ at checkout; always confirm the final total, shipping, and coupon eligibility on the retailer's site before paying.</p>
</Wrap>;

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-6 text-4xl font-display font-bold text-white">Terms of Service</h1>
          <div className="glass-panel rounded-3xl border border-white/10 p-8 text-zinc-300 space-y-6 leading-7">
            <p>SYNTHIX Print connects buyers with independent makers and fabrication shops.</p>
            <p>Buyers must provide accurate files, specifications, and shipping details for each order.</p>
            <p>Sellers are responsible for lead times, production quality, lawful fulfillment, and shipment updates.</p>
            <p>Payments are processed by Stripe, and platform fees are disclosed during checkout.</p>
            <p>Refunds and disputes are reviewed against order status, message history, and fulfillment evidence.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-12 pb-24">
        <div className="container mx-auto max-w-4xl px-4">
          <h1 className="mb-6 text-4xl font-display font-bold text-white">Privacy Policy</h1>
          <div className="glass-panel rounded-3xl border border-white/10 p-8 text-zinc-300 space-y-6 leading-7">
            <p>SYNTHIX Print stores account, listing, order, and conversation data needed to operate the marketplace.</p>
            <p>Payment card details are handled by Stripe and are not stored directly by this application.</p>
            <p>Public profile and shop content may be visible to buyers, sellers, and search engines.</p>
            <p>Operational logs and order records may be retained for fraud prevention, support, and compliance.</p>
            <p>Users should rotate passwords if they suspect compromise and can request account data updates from the operator.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

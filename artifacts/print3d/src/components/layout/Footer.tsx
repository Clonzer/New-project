import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 pt-16 pb-8 mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display font-extrabold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                SYNTHIX<span className="font-light text-white/80"> Print</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              A marketplace for custom fabrication and maker services — additive manufacturing, shop tools, metalwork, design, and more. Connect with sellers and turn ideas into finished work.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors">Explore Shops</Link></li>
              <li><Link href="/listings" className="text-muted-foreground hover:text-primary transition-colors">Browse Models</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} SYNTHIX Print. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <span>Platform fee: 10% · Released on shipment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

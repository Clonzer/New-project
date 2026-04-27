import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-xl pt-16 pb-8 mt-24 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4 group">
              <span className="font-display font-extrabold text-2xl tracking-wider text-white group-hover:drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-all duration-300">
                SYNTHIX
              </span>
            </Link>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              A marketplace for custom fabrication and maker services — additive manufacturing, shop tools,
              metalwork, design, and more. Connect with sellers and turn ideas into finished work.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/explore" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Explore Shops</Link></li>
              <li><Link href="/listings" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Browse Models</Link></li>
              <li><Link href="/contests" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Contests</Link></li>
              <li><Link href="/register" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Join Now</Link></li>
              <li><Link href="/pricing" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Pricing</Link></li>
              <li><Link href="/help" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Help & FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li><Link href="/messages?contact=synthix" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Message Synthix</Link></li>
              <li><Link href="/contact" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Contact Form</Link></li>
              <li><Link href="/help" className="text-zinc-400 hover:text-primary hover:translate-x-0.5 transition-all inline-block text-sm">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">&copy; {new Date().getFullYear()} SYNTHIX. All rights reserved.</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <span className="text-xs text-zinc-400">Platform fee:</span>
            <span className="text-xs font-semibold text-primary">10%</span>
            <span className="text-xs text-zinc-500">— Released on shipment</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

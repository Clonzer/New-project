import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ExploreAll() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">The All in One Makers Marketplace</h1>
          <p className="text-zinc-400">Testing with Navbar and Footer</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

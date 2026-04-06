import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { ChevronDown, ChevronUp, HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I place an order?",
    answer: "Browse makers and products, add items to your cart, and checkout securely. Funds are held in escrow until delivery.",
    category: "Buying"
  },
  {
    question: "How do I become a seller?",
    answer: "Register for an account and select 'Become a Seller' in your dashboard. Add your equipment and create listings to start selling.",
    category: "Selling"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Payments are processed securely and funds are held in escrow.",
    category: "Payments"
  },
  {
    question: "How does escrow work?",
    answer: "When you place an order, funds are held securely until the seller marks the order as shipped. Once you confirm delivery, funds are released to the seller.",
    category: "Buying"
  },
  {
    question: "How do I add equipment to my shop?",
    answer: "Go to your dashboard and click 'Add equipment' in the 'My Equipment' tab. Select your equipment type and fill in the details.",
    category: "Selling"
  },
  {
    question: "What are the platform fees?",
    answer: "We charge a 10% platform fee on all transactions to cover payment processing and platform maintenance.",
    category: "Selling"
  },
  {
    question: "How do I track my order?",
    answer: "Check your order status in the 'My Orders' tab of your dashboard. Sellers will update the status as they work on your order.",
    category: "Buying"
  },
  {
    question: "Can I request custom work?",
    answer: "Yes! Many sellers offer custom services. Look for shops with 'Custom Jobs' in their profile or contact them directly.",
    category: "Buying"
  },
  {
    question: "How do I update my shop settings?",
    answer: "Visit the Settings page to update your profile, shipping preferences, payment methods, and shop policies.",
    category: "Selling"
  },
  {
    question: "What if I have a problem with my order?",
    answer: "Contact the seller directly through the messages system. If you can't resolve it, reach out to our support team.",
    category: "Support"
  }
];

const CATEGORIES = ["All", "Buying", "Selling", "Payments", "Support"];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background">
      <Navbar />

      <main className="flex-grow">
        <section className="relative pt-16 pb-20">
          <AnimatedGradientBg />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm mb-6">
                  <HelpCircle className="w-4 h-4" />
                  Help Center
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white leading-[0.95] tracking-tight mb-6">
                  How can we help?
                </h1>
                <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                  Find answers to common questions or contact our support team.
                </p>

                <div className="max-w-md mx-auto relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-black/30 border-white/10 text-white placeholder-zinc-400 h-12 rounded-full"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "border-white/10 text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary mb-2">
                          {faq.category}
                        </span>
                        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      </div>
                      {expandedItems.has(index) ? (
                        <ChevronUp className="w-5 h-5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>
                    {expandedItems.has(index) && (
                      <div className="px-6 pb-6">
                        <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <p className="text-zinc-500">No FAQs found matching your search.</p>
                </div>
              )}

              <div className="mt-16 text-center">
                <div className="glass-panel rounded-3xl border border-white/10 p-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
                  <p className="text-zinc-300 mb-6">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  <Button className="bg-primary hover:bg-primary/80 text-white rounded-full px-8 py-3">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
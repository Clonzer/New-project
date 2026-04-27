import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOMeta, MarketplaceStructuredData } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { submitSupportContactForm } from "@/lib/support-api";

export default function Contact() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await submitSupportContactForm(contactForm);
      setContactForm({ name: "", email: "", subject: "", message: "" });
      toast({
        title: "Message sent",
        description: "Your message was sent to the SYNTHIX support team.",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: getApiErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOMeta
        title="Contact Us | Synthix Support & Maker Services"
        description="Get in touch with Synthix for support, vendor inquiries, or partnership opportunities. We're here to help makers and customers succeed."
        canonical="https://synthix.com/contact"
        type="website"
        keywords={["contact synthix", "support", "help", "customer service", "vendor support"]}
      />
      <MarketplaceStructuredData />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <section className="relative overflow-hidden pb-16 pt-32 text-center">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_50%)]" />
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute top-20 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-glow delay-1000" />
            
            <div className="container relative z-10 mx-auto px-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Contact Us</span>
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white mb-4">
                  Get in <span className="gradient-text">Touch</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-zinc-400 leading-relaxed">
                  Have questions about SYNTHIX? Need help with your shop or orders? Send us a message and our support team will get back to you.
                </p>
              </motion.div>
            </div>
          </section>

        <section className="container mx-auto max-w-3xl px-4 pb-24 -mt-4 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-card border-white/[0.08] hover:border-primary/20 rounded-3xl p-8 md:p-12 transition-all"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <Input
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Subject</label>
                <Input
                  value={contactForm.subject}
                  onChange={(event) => setContactForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
                <Textarea
                  value={contactForm.message}
                  onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Tell us more about your question or issue..."
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={() => void submitContact()}
                disabled={isSubmitting}
                size="lg"
                className="w-full h-12 rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Send className="w-4 h-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white mb-4">Other ways to reach us</h3>
              <div className="space-y-3">
                <a href="/messages?contact=2" className="flex items-center gap-3 text-zinc-400 hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <span>Message Synthix directly</span>
                </a>
                <a href="/help" className="flex items-center gap-3 text-zinc-400 hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <ArrowRight className="w-4 h-4 text-accent" />
                  </div>
                  <span>Check our Help Center</span>
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}

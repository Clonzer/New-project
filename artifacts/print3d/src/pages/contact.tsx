import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="relative overflow-hidden pb-16 pt-24 text-center">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.15),transparent_40%)]" />
          <div className="container relative z-10 mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-4">
                <Mail className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-[0.18em]">Contact Us</span>
              </div>
              <h1 className="text-5xl font-display font-extrabold tracking-tight text-white md:text-6xl mb-4">
                Get in Touch
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-zinc-400">
                Have questions about SYNTHIX? Need help with your shop or orders? Send us a message and our support team will get back to you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 pb-24 -mt-8 relative z-20">
          <div className="bg-zinc-800 border border-zinc-700 rounded-3xl p-8 md:p-12">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <Input
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    type="email"
                    className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Subject</label>
                <Input
                  value={contactForm.subject}
                  onChange={(event) => setContactForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="What's this about?"
                  className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
                <Textarea
                  value={contactForm.message}
                  onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Tell us more about your question or issue..."
                  rows={6}
                  className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-500 resize-none"
                />
              </div>
              <Button
                onClick={() => void submitContact()}
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
              >
                {isSubmitting ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
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

            <div className="mt-12 pt-8 border-t border-zinc-700">
              <h3 className="text-lg font-semibold text-white mb-4">Other ways to reach us</h3>
              <div className="space-y-3">
                <a href="/messages?contact=2" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>Message Synthix directly through the platform</span>
                </a>
                <a href="/help" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>Check our Help Center for FAQs</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap, ShoppingBag, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";
import { useAuth } from "@/hooks/use-auth";

const tutorialSteps = [
  {
    title: "Welcome to SYNTHIX",
    description: "The premium marketplace for makers, creators, and innovators. Turn your ideas into reality.",
    icon: Sparkles,
    highlight: "Discover a world of custom fabrication and maker services",
  },
  {
    title: "Verify Your Email",
    description: "Keep your account secure and enable all marketplace features. Check your inbox for a verification link.",
    icon: Zap,
    highlight: "Verification takes less than a minute",
  },
  {
    title: "Browse Makers & Products",
    description: "Explore our curated marketplace of verified makers. Find exactly what you need from 3D prints to custom metal work.",
    icon: ShoppingBag,
    highlight: "Use filters to find makers in your area or specialty",
  },
  {
    title: "Track Orders & Shipping",
    description: "Monitor your orders in real-time. Sellers can generate shipping labels and provide tracking information.",
    icon: Truck,
    highlight: "Funds are held securely until delivery confirmation",
  },
];

export function OnboardingTutorial() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const hasSeenTutorial = localStorage.getItem(`synthix-tutorial-seen-${user.id}`);
    if (!hasSeenTutorial) {
      // Show after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`synthix-tutorial-seen-${user.id}`, "true");
    }
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-white/10 rounded-3xl max-w-md w-full p-8 shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Getting Started
                  </p>
                  <h2 className="text-2xl font-display font-bold text-white mt-2">
                    {step.title}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Icon & Description */}
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-zinc-300 leading-relaxed">{step.description}</p>
                <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium">{step.highlight}</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex gap-1.5 mb-8">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      index <= currentStep
                        ? "bg-gradient-to-r from-primary to-accent"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </Button>
                <NeonButton
                  glowColor="primary"
                  onClick={handleNext}
                  className="flex-1"
                >
                  {currentStep === tutorialSteps.length - 1 ? "Got it!" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </NeonButton>
              </div>

              {/* Skip Option */}
              <button
                onClick={handleClose}
                className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip tutorial
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

// Tour steps for sellers (full maker business features)
const sellerTourSteps: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Welcome to Synthix!",
    description: "Your 3D printing marketplace dashboard. Manage sales, handle orders, and grow your maker business all in one place.",
    position: "bottom",
  },
  {
    target: "[data-tour='overview']",
    title: "Overview Dashboard",
    description: "See total sales, active orders, revenue, and charts. Your daily business health check.",
    position: "bottom",
  },
  {
    target: "[data-tour='orders']",
    title: "Orders",
    description: "Track all orders. Check status, update shipping, manage returns. Your order hub.",
    position: "bottom",
  },
  {
    target: "[data-tour='reviews']",
    title: "My Reviews",
    description: "See customer feedback on your prints and services. Build your reputation.",
    position: "bottom",
  },
  {
    target: "[data-tour='shop']",
    title: "My Shop",
    description: "Your storefront. Manage listings, prices, inventory. Your shop control center.",
    position: "bottom",
  },
  {
    target: "[data-tour='services']",
    title: "Services & Custom Orders",
    description: "Offer custom 3D printing. Set pricing for your design and print services.",
    position: "bottom",
  },
  {
    target: "[data-tour='printers']",
    title: "My Equipment",
    description: "List your 3D printers and equipment. Set availability for custom jobs.",
    position: "bottom",
  },
  {
    target: "[data-tour='shipping']",
    title: "Shipping Profiles",
    description: "Create shipping templates. Set rates by carrier, weight, and destination.",
    position: "bottom",
  },
  {
    target: "[data-tour='messages']",
    title: "Messages",
    description: "Chat with buyers. Discuss prints, negotiate, share files.",
    position: "bottom",
  },
  {
    target: "[data-tour='promotions']",
    title: "Promotions",
    description: "Create discounts and deals. Run sales to attract more customers.",
    position: "bottom",
  },
  {
    target: "[data-tour='analytics']",
    title: "Analytics",
    description: "Track best-sellers, revenue trends, and customer data. Optimize your shop.",
    position: "bottom",
  },
  {
    target: "[data-tour='wallet']",
    title: "Wallet",
    description: "Check your balance. See available funds, pending earnings, and payouts.",
    position: "bottom",
  },
  {
    target: "[data-tour='transactions']",
    title: "Transactions",
    description: "Review all sales, purchases, and payouts. Track every transaction.",
    position: "bottom",
  },
  {
    target: "[data-tour='payments']",
    title: "Payment Methods",
    description: "Add and manage cards. Connect bank accounts for payouts.",
    position: "bottom",
  },
  {
    target: "[data-tour='help']",
    title: "Help Center",
    description: "Get support, view FAQs, or restart this tour. We're here to help!",
    position: "bottom",
  },
];

// Tour steps for buyers (simplified - purchasing focus)
const buyerTourSteps: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Welcome to Synthix!",
    description: "Your 3D printing marketplace dashboard. Track orders, manage purchases, and find the perfect makers.",
    position: "bottom",
  },
  {
    target: "[data-tour='overview']",
    title: "Overview",
    description: "See your recent orders, saved items, and quick actions. Your personal dashboard.",
    position: "bottom",
  },
  {
    target: "[data-tour='orders']",
    title: "My Orders",
    description: "Track all your purchases. Check status, contact sellers, and manage returns.",
    position: "bottom",
  },
  {
    target: "[data-tour='reviews']",
    title: "My Reviews",
    description: "See reviews you've left for sellers and track your reputation.",
    position: "bottom",
  },
  {
    target: "[data-tour='messages']",
    title: "Messages",
    description: "Chat with sellers. Discuss custom orders, ask questions, share files.",
    position: "bottom",
  },
  {
    target: "[data-tour='wallet']",
    title: "Wallet",
    description: "Check your balance and manage payment methods for purchases.",
    position: "bottom",
  },
  {
    target: "[data-tour='transactions']",
    title: "Purchase History",
    description: "Review all your purchases and payments. Track your spending.",
    position: "bottom",
  },
  {
    target: "[data-tour='payments']",
    title: "Payment Methods",
    description: "Add and manage cards for quick checkout.",
    position: "bottom",
  },
  {
    target: "[data-tour='help']",
    title: "Help Center",
    description: "Get support, view FAQs, or restart this tour. We're here to help!",
    position: "bottom",
  },
];

// Helper to check if user is a seller
const isSeller = (role?: string) => role === "seller" || role === "both";

export function DashboardTour() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Select appropriate tour steps based on user role
  const tourSteps = isSeller(user?.role) ? sellerTourSteps : buyerTourSteps;
  const step = tourSteps[currentStep];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Check if we should show tutorial (after login/register)
    const showTutorial = localStorage.getItem('showTutorial');
    if (showTutorial === 'true') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Clear the flag so it only shows once
        localStorage.removeItem('showTutorial');
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    // Also check if user has never seen the tour
    const hasSeenTour = localStorage.getItem(`synthix-dashboard-tour-${user.id}`);
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !step) return;
    
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      
      // Calculate tooltip position
      const tooltipWidth = 320;
      const tooltipHeight = 150;
      const padding = 16;
      
      let x = rect.left + rect.width / 2 - tooltipWidth / 2;
      let y = rect.bottom + padding;
      
      // Adjust if off screen
      if (x < padding) x = padding;
      if (x + tooltipWidth > window.innerWidth - padding) {
        x = window.innerWidth - tooltipWidth - padding;
      }
      if (y + tooltipHeight > window.innerHeight) {
        y = rect.top - tooltipHeight - padding;
      }
      
      setTooltipPosition({ x, y });
    }
  }, [isOpen, step]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition, true);
    
    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition, true);
    };
  }, [updateTargetPosition]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
    if (user) {
      localStorage.setItem(`synthix-dashboard-tour-${user.id}`, 'true');
    }
  }, [user]);

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (user) {
      (window as any).restartDashboardTour = restartTour;
    }
    return () => {
      delete (window as any).restartDashboardTour;
    };
  }, [user, restartTour]);

  const handleClose = () => {
    closeTour();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  if (!isOpen || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          style={{ mixBlendMode: "hard-light" }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx={12}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
          {/* Highlight border around target */}
          {targetRect && (
            <rect
              x={targetRect.left - 8}
              y={targetRect.top - 8}
              width={targetRect.width + 16}
              height={targetRect.height + 16}
              rx={12}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-auto"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            width: 320,
          }}
        >
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-zinc-500">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-4">
              {tourSteps.map((_: TourStep, index: number) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? "bg-gradient-to-r from-primary to-accent"
                      : index < currentStep
                      ? "bg-primary/50"
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
                className="flex-1 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
              >
                {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Skip button */}
        <button
          onClick={handleClose}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors pointer-events-auto"
        >
          Skip tour
        </button>

        {/* Restart hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-600">
          You can restart the tour anytime from the help menu
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

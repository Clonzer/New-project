import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonButton } from "@/components/ui/neon-button";

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlight?: string;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  userType: "buyer" | "seller";
}

export function Tutorial({ isOpen, onClose, steps, userType }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-950 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{userType === "seller" ? "Seller" : "Buyer"} Tutorial</h2>
              <p className="text-sm text-zinc-400">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-zinc-300 leading-relaxed">{step.description}</p>
            </div>

            {step.image && (
              <div className="mb-6">
                <img src={step.image} alt={step.title} className="w-full rounded-xl border border-white/10" />
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-primary" : "bg-zinc-600"}`}
                  />
                ))}
              </div>

              <NeonButton
                glowColor="primary"
                onClick={nextStep}
                className="px-6"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

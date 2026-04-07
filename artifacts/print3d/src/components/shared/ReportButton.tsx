import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  itemType: "message" | "listing" | "profile";
  itemId: string;
  itemName?: string;
  className?: string;
}

export function ReportButton({ itemType, itemId, itemName, className }: ReportButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleReport = () => {
    // Navigate to messages page with Synthix team contact
    setLocation("/messages?contact=synthix");
    
    toast({
      title: "Opening Synthix Support",
      description: "Connecting you with our support team to report this issue.",
    });
  };

  const getItemTypeLabel = () => {
    switch (itemType) {
      case "message":
        return "Message";
      case "listing":
        return "Product Listing";
      case "profile":
        return "User Profile";
      default:
        return "Item";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReport}
      className={`text-zinc-400 hover:text-red-400 hover:bg-red-400/10 ${className}`}
    >
      <Flag className="w-4 h-4" />
      <span className="sr-only">Report {getItemTypeLabel()}</span>
    </Button>
  );
}

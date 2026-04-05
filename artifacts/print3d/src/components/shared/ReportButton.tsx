import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  itemType: "message" | "listing" | "profile";
  itemId: string;
  itemName?: string;
  className?: string;
}

export function ReportButton({ itemType, itemId, itemName, className }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Please provide a reason",
        description: "Tell us why you're reporting this item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real implementation, this would send the report to your API
      console.log(`Report submitted:`, {
        type: itemType,
        id: itemId,
        reason: reason.trim(),
        timestamp: new Date().toISOString(),
      });

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      });
      
      setReason("");
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-zinc-400 hover:text-red-400 hover:bg-red-400/10 ${className}`}
        >
          <Flag className="w-4 h-4" />
          <span className="sr-only">Report {getItemTypeLabel()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            Report {getItemTypeLabel()}
          </DialogTitle>
        </DialogHeader>
        
        {itemName && (
          <p className="text-zinc-300 text-sm">
            Reporting: <span className="text-white font-medium">{itemName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Reason for report
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this item. Be as specific as possible."
              rows={4}
              className="bg-black/30 border border-white/10 text-white placeholder:text-zinc-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-xs text-zinc-400">
              Reports are reviewed by our moderation team. False reports may result in account restrictions.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

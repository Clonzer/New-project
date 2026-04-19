import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";

interface ReportDialogProps {
  itemType: "message" | "listing" | "profile";
  itemId: string;
  itemName?: string;
  className?: string;
}

export function ReportDialog({ itemType, itemId, itemName, className }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for your report.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        item_type: itemType,
        item_id: itemId,
        reason: reason,
        additional_info: additionalInfo || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it and take appropriate action.",
      });

      setOpen(false);
      setReason("");
      setAdditionalInfo("");
    } catch (error) {
      console.error('Report submission error:', error);
      toast({
        title: "Failed to submit report",
        description: error instanceof Error ? error.message : "Please try again later or contact support directly.",
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

  const reportReasons = [
    { value: "spam", label: "Spam or unwanted content" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "scam", label: "Scam or fraud" },
    { value: "copyright", label: "Copyright infringement" },
    { value: "offensive", label: "Offensive language" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle>Report {getItemTypeLabel()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for report</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {reportReasons.map((reportReason) => (
                  <SelectItem key={reportReason.value} value={reportReason.value} className="text-white hover:bg-zinc-700">
                    {reportReason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="additional-info">Additional information (optional)</Label>
            <Textarea
              id="additional-info"
              placeholder="Provide any additional details that might help us understand the issue..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[100px] bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

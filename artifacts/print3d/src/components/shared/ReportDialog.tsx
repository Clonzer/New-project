import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for your report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual report submission to backend
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it and take appropriate action.",
      });

      setOpen(false);
      setReason("");
      setAdditionalInfo("");
    } catch (error) {
      toast({
        title: "Failed to submit report",
        description: "Please try again later or contact support directly.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {getItemTypeLabel()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for report</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reportReason) => (
                  <SelectItem key={reportReason.value} value={reportReason.value}>
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
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
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

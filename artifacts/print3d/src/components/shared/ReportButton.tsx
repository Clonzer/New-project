import { ReportDialog } from "./ReportDialog";

interface ReportButtonProps {
  itemType: "message" | "listing" | "profile";
  itemId: string;
  itemName?: string;
  className?: string;
}

export function ReportButton({ itemType, itemId, itemName, className }: ReportButtonProps) {
  return <ReportDialog itemType={itemType} itemId={itemId} itemName={itemName} className={className} />;
}

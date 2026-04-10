import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className="ml-2 text-sm text-zinc-400">{text}</span>
      )}
    </div>
  );
}

// Full page loading component
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-zinc-400">{text}</p>
      </div>
    </div>
  );
}

// Skeleton loading components
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 animate-pulse", className)}>
      <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-zinc-700 rounded w-full mb-2"></div>
      <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
    </div>
  );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-zinc-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
            <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: rows * columns }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-700 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isFavorite, toggleFavorite } from "@/lib/favorites-api";

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'shop' | 'product' | 'service';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export function FavoriteButton({ 
  itemId, 
  itemType, 
  className = "",
  size = 'sm',
  variant = 'ghost',
  showText = false 
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    if (user?.id) {
      isFavorite(user.id, itemId, itemType).then(setIsFavorite);
    }
  }, [user?.id, itemId, itemType]);

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save favorites.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await toggleFavorite(user.id, itemId, itemType);
      setIsFavorite(result.isFavorite);

      toast({
        title: result.action === 'added' ? "Added to Favorites" : "Removed from Favorites",
        description: result.action === 'added' 
          ? "Item has been added to your favorites." 
          : "Item has been removed from your favorites."
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-zinc-400 hover:text-red-400'}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''}`} />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
}

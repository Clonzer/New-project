import { useState, useEffect } from "react";
import { Eye, EyeOff, ShoppingCart, Ban, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function StoreStatusToggle() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isUpdatingOrders, setIsUpdatingOrders] = useState(false);
  
  // Local state for optimistic UI updates
  const [storeVisible, setStoreVisible] = useState(user?.storeVisible ?? true);
  const [acceptingOrders, setAcceptingOrders] = useState(user?.acceptingOrders ?? true);

  // Sync with user data when it changes
  useEffect(() => {
    if (user) {
      setStoreVisible(user.storeVisible ?? true);
      setAcceptingOrders(user.acceptingOrders ?? true);
    }
  }, [user]);

  const handleToggleVisibility = async () => {
    if (!user) return;
    setIsUpdatingVisibility(true);
    const newValue = !storeVisible;
    
    // Optimistic update
    setStoreVisible(newValue);

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/users/${user.id}/store-visible`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ storeVisible: newValue }),
      // });
      
      // Refresh user data
      await refreshUser?.();

      toast({
        title: newValue ? "Store is now visible" : "Store is now hidden",
        description: newValue
          ? "Your shop is visible to the public"
          : "Your shop is hidden from public view",
      });
    } catch (error) {
      // Revert on error
      setStoreVisible(!newValue);
      toast({
        title: "Error",
        description: "Could not update store visibility",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleToggleOrders = async () => {
    if (!user) return;
    setIsUpdatingOrders(true);
    const newValue = !acceptingOrders;
    
    // Optimistic update
    setAcceptingOrders(newValue);

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/users/${user.id}/accepting-orders`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ acceptingOrders: newValue }),
      // });
      
      // Refresh user data
      await refreshUser?.();

      toast({
        title: newValue ? "Now accepting orders" : "Not accepting orders",
        description: newValue
          ? "Customers can place orders with your shop"
          : "Customers cannot place new orders",
      });
    } catch (error) {
      // Revert on error
      setAcceptingOrders(!newValue);
      toast({
        title: "Error",
        description: "Could not update order acceptance status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingOrders(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Store Status</h3>

      <div className="space-y-4">
        {/* Store Visibility Toggle */}
        <motion.button
          onClick={handleToggleVisibility}
          disabled={isUpdatingVisibility}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
            storeVisible
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-zinc-700 bg-zinc-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                storeVisible
                  ? "bg-emerald-500/20"
                  : "bg-zinc-700"
              }`}
            >
              {isUpdatingVisibility ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              ) : storeVisible ? (
                <Eye className="h-5 w-5 text-emerald-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Store Visibility</p>
              <p className="text-sm text-zinc-400">
                {storeVisible
                  ? "Visible to public"
                  : "Hidden from public"}
              </p>
            </div>
          </div>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${
              storeVisible ? "bg-emerald-500" : "bg-zinc-600"
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white"
              animate={{
                x: storeVisible ? 20 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>

        {/* Accepting Orders Toggle */}
        <motion.button
          onClick={handleToggleOrders}
          disabled={isUpdatingOrders}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
            acceptingOrders
              ? "border-blue-500/30 bg-blue-500/10"
              : "border-zinc-700 bg-zinc-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                acceptingOrders
                  ? "bg-blue-500/20"
                  : "bg-zinc-700"
              }`}
            >
              {isUpdatingOrders ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              ) : acceptingOrders ? (
                <ShoppingCart className="h-5 w-5 text-blue-400" />
              ) : (
                <Ban className="h-5 w-5 text-zinc-400" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-white">Accepting Orders</p>
              <p className="text-sm text-zinc-400">
                {acceptingOrders
                  ? "Customers can order"
                  : "Not taking orders"}
              </p>
            </div>
          </div>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${
              acceptingOrders ? "bg-blue-500" : "bg-zinc-600"
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white"
              animate={{
                x: acceptingOrders ? 20 : 0,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>
      </div>

      {/* Status Summary */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`h-2 w-2 rounded-full ${
              storeVisible && acceptingOrders
                ? "bg-emerald-500"
                : storeVisible
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-zinc-400">
            {storeVisible && acceptingOrders
              ? "Store is open for business"
              : storeVisible
              ? "Visible but not taking orders"
              : "Store is temporarily closed"}
          </span>
        </div>
      </div>
    </div>
  );
}

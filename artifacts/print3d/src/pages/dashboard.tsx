import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import ShopManagement from "./dashboard/shop";
import OrdersAndSales from "./dashboard/orders";
import CustomerActivity from "./dashboard/customer";
import AccountSettings from "./dashboard/account";

// Import individual components for sub-routes
import { Listings } from "@/components/dashboard/Listings";
import { Equipment } from "@/components/dashboard/Equipment";
import { Analytics } from "@/components/dashboard/Analytics";
import { Orders } from "@/components/dashboard/Orders";
import { Sales } from "@/components/dashboard/Sales";
import CustomOrders from "@/components/dashboard/CustomOrders";
import { Purchases } from "@/components/dashboard/Purchases";
import { Reviews } from "@/components/dashboard/Reviews";
import { Favorites } from "@/components/dashboard/Favorites";
import { PaymentMethods } from "@/components/dashboard/PaymentMethods";
import { ShippingProfiles } from "@/components/dashboard/ShippingProfiles";

// Wrapper components to handle props
const ListingsWrapper = () => {
  const { user } = useAuth();
  const { data: myListings } = useListListings(user?.id ? { sellerId: user.id } : undefined);
  
  const handleDeleteListing = (id: string) => {
    console.log("Delete listing:", id);
  };
  
  return <Listings myListings={myListings} handleDeleteListing={handleDeleteListing} />;
};

const EquipmentWrapper = () => {
  const { user } = useAuth();
  const { data: myPrinters } = useListPrinters(user?.id ? { userId: user.id } : undefined);
  
  return <Equipment 
    myPrinters={myPrinters || []}
    myEquipmentGroups={[]}
    setShowAddEquipmentGroup={() => {}}
    setEditingEquipmentGroup={() => {}}
    handleDeleteEquipmentGroup={() => {}}
    setShowAddPrinter={() => {}}
    setEditingPrinter={() => {}}
    handleAssignToGroup={() => {}}
    togglingPrinterId={null}
    togglePrinter={() => {}}
    deletingPrinterId={null}
    removePrinter={() => {}}
    handleUpdateEquipmentStatus={() => {}}
  />;
};

const AnalyticsWrapper = () => {
  return <Analytics shopId="1" timeRange="30d" />;
};

const SalesWrapper = () => {
  return <Sales 
    mySales={[]}
    updatingOrderId={null}
    advanceStatus={() => {}}
  />;
};

const PurchasesWrapper = () => {
  return <Purchases 
    myPurchases={[]}
    isSellerUser={false}
  />;
};

const ReviewsWrapper = () => {
  return <Reviews 
    myReviews={{ reviews: [] }}
    reviewsReceived={{ reviews: [] }}
    error={null}
    onRetry={() => {}}
  />;
};

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardSidebar />
      <main className="pl-20">
        {children}
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Redirect to shop management if at dashboard root
  useEffect(() => {
    console.log("Dashboard location:", location);
    if (location === "/dashboard" || location === "/dashboard/") {
      console.log("Redirecting to shop management");
      window.location.href = "/dashboard/shop";
    }
  }, [location]);

  // Handle routing based on current path
  const renderContent = () => {
    console.log("Dashboard renderContent for location:", location);
    
    if (location.startsWith("/dashboard/shop")) {
      return <ShopManagement />;
    } else if (location.startsWith("/dashboard/orders")) {
      return <OrdersAndSales />;
    } else if (location.startsWith("/dashboard/customer")) {
      return <CustomerActivity />;
    } else if (location.startsWith("/dashboard/account")) {
      return <AccountSettings />;
    } else if (location === "/dashboard/shop/listings") {
      return <ListingsWrapper />;
    } else if (location === "/dashboard/shop/equipment") {
      return <EquipmentWrapper />;
    } else if (location === "/dashboard/shop/analytics") {
      return <AnalyticsWrapper />;
    } else if (location === "/dashboard/sales") {
      return <SalesWrapper />;
    } else if (location === "/dashboard/custom-orders") {
      return <CustomOrders user={user} />;
    } else if (location === "/dashboard/purchases") {
      return <PurchasesWrapper />;
    } else if (location === "/dashboard/reviews") {
      return <ReviewsWrapper />;
    } else if (location === "/dashboard/favorites") {
      return <Favorites />;
    } else if (location === "/dashboard/payment-methods") {
      return <PaymentMethods />;
    } else if (location === "/dashboard/shipping-profiles") {
      return <ShippingProfiles />;
    }
    
    // Default to shop management for any other dashboard route
    console.log("Defaulting to ShopManagement for unknown route");
    return <ShopManagement />;
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}

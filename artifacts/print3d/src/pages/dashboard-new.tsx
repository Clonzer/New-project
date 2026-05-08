import { useEffect, useState } from "react";
import { useLocation, Link, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListListings, useListPrinters, useListOrders } from "@/lib/workspace-stub";
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
    if (location === "/dashboard" || location === "/dashboard/") {
      window.location.href = "/dashboard/shop";
    }
  }, [location]);

  return (
    <DashboardLayout>
      <Route path="/dashboard/shop" component={ShopManagement} />
      <Route path="/dashboard/shop/listings" component={ListingsWrapper} />
      <Route path="/dashboard/shop/equipment" component={EquipmentWrapper} />
      <Route path="/dashboard/shop/analytics" component={AnalyticsWrapper} />
      
      <Route path="/dashboard/orders" component={OrdersAndSales} />
      <Route path="/dashboard/sales" component={SalesWrapper} />
      <Route path="/dashboard/custom-orders" component={() => <CustomOrders user={user} />} />
      
      <Route path="/dashboard/customer" component={CustomerActivity} />
      <Route path="/dashboard/purchases" component={PurchasesWrapper} />
      <Route path="/dashboard/reviews" component={ReviewsWrapper} />
      <Route path="/dashboard/favorites" component={Favorites} />
      
      <Route path="/dashboard/account" component={AccountSettings} />
      <Route path="/dashboard/payment-methods" component={PaymentMethods} />
      <Route path="/dashboard/shipping-profiles" component={ShippingProfiles} />
    </DashboardLayout>
  );
}

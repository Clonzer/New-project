import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/supabase-auth-context";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";
import { useSyncContestsOnMount } from "@/lib/contest-sync";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import ExploreAll from "@/pages/explore-all";
import ExploreModels from "@/pages/explore-models";
import Contests from "@/pages/contests";
import Listings from "@/pages/listings";
import Shop from "@/pages/shop";
import OrderFlow from "@/pages/order-flow";
import Dashboard from "@/pages/dashboard";
import { VendorDashboard } from "@/pages/vendor-dashboard";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import NotificationsPage from "@/pages/notifications";
import Pricing from "@/pages/pricing";
import Cart from "@/pages/cart";
import SearchPage from "@/pages/search";
import CompareShops from "@/pages/compare-shops";
import Help from "@/pages/help";
import Discover from "@/pages/discover";
import CreateListing from "@/pages/create-listing";
import EditListing from "@/pages/edit-listing";
import Admin from "@/pages/admin";
import SponsorshipPurchase from "@/pages/sponsorship-purchase";
import StorefrontEdit from "@/pages/storefront-edit";
import NotFound from "@/pages/not-found";
import { PrivacyPage, TermsPage } from "@/pages/legal";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import ListingDetail from "@/pages/listing-detail";
import { useLocation } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function DashboardPage() {
  return <ProtectedRoute roles={[]} children={<Dashboard />} />;
}

function CartPage() {
  return <ProtectedRoute children={<Cart />} />;
}

function OrderFlowPage() {
  return <ProtectedRoute children={<OrderFlow />} />;
}

function SettingsPage() {
  return <ProtectedRoute children={<Settings />} />;
}

function MessagesPage() {
  return <ProtectedRoute children={<Messages />} />;
}

function CreateListingPage() {
  return <ProtectedRoute children={<CreateListing />} />;
}

function EditListingPage() {
  return <ProtectedRoute children={<EditListing />} />;
}

function VendorDashboardPage() {
  return <ProtectedRoute children={<VendorDashboard />} />;
}

function StorefrontEditPage() {
  return <ProtectedRoute children={<StorefrontEdit />} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore-all" component={ExploreAll} />
      <Route path="/explore" component={Explore} />
      <Route path="/explore-models" component={ExploreModels} />
      <Route path="/discover" component={Discover} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/contests" component={Contests} />
      <Route path="/listings" component={Listings} />
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/shop/:id" component={Shop} />
      <Route path="/order/new" component={OrderFlowPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/compare-shops" component={CompareShops} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/vendor-dashboard" component={VendorDashboardPage} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sponsorship/purchase" component={SponsorshipPurchase} />
      <Route path="/storefront/edit" component={StorefrontEditPage} />
      <Route path="/create-listing" component={CreateListingPage} />
      <Route path="/listings/:id/edit" component={EditListingPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/help" component={Help} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // useSyncContestsOnMount(); // Temporarily disabled due to database schema issues

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppErrorBoundary>
            <WouterRouter>
              <Router />
            </WouterRouter>
          </AppErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppErrorBoundary } from "@/components/system/AppErrorBoundary";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Listings from "@/pages/listings";
import Shop from "@/pages/shop";
import OrderFlow from "@/pages/order-flow";
import Dashboard from "@/pages/dashboard";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import Pricing from "@/pages/pricing";
import Cart from "@/pages/cart";
import SearchPage from "@/pages/search";
import CompareShops from "@/pages/compare-shops";
import Contests from "@/pages/contests";
import NotFound from "@/pages/not-found";
import { PrivacyPage, TermsPage } from "@/pages/legal";

// Initialize react-query client
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
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function CartPage() {
  return (
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  );
}

function OrderFlowPage() {
  return (
    <ProtectedRoute>
      <OrderFlow />
    </ProtectedRoute>
  );
}

function SettingsPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}

function MessagesPage() {
  return (
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/listings" component={Listings} />
      <Route path="/shop/:id" component={Shop} />
      <Route path="/order/new" component={OrderFlowPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/compare-shops" component={CompareShops} />
      <Route path="/contests" component={Contests} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppErrorBoundary>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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

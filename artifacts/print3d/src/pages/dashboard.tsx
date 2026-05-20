import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  useListOrders, useListListings, useListPrinters, useListReviews, useUpdateUser,
  useListEquipmentGroups, useCreateEquipmentGroup, useUpdateEquipmentGroup, useDeleteEquipmentGroup,
  useUpdatePrinter, useDeletePrinter,
} from "@/lib/workspace-stub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { createSponsorshipCheckoutSession } from "@/lib/payments-api";
import { Input } from "@/components/ui/input";
import { NeonButton } from "@/components/ui/neon-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authChangePassword, authConfirmEmailVerification, authRequestEmailVerification } from "@/lib/auth-api";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import { ProfilePreviewModal } from "@/components/shared/ProfilePreviewModal";
import { Switch } from "@/components/ui/switch";
import {
  Package, Plus, Printer as PrinterIcon, Settings, TrendingUp,
  Clock, CheckCircle2, Truck, XCircle, AlertCircle, Eye,
  DollarSign, Users, Star, Heart, ArrowUpRight, ArrowDownRight,
  BarChart3, Calendar, Filter, Search, Image, FileText,
  CreditCard as PaymentIcon, Shield, Store as StoreIcon, User, ChevronRight,
  MessageSquare, ShoppingCart, Crown, Zap, Rocket, Trash, Bell, ChevronRight as ChevronRightIcon,
  CreditCard as CreditCardIcon, Eye as EyeIcon, FileText as FileTextIcon, MessageSquareText, Shield as ShieldIcon,
  User as UserIcon, Palette, Globe, Mail, Instagram, Settings as SettingsIcon, CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon, Camera, Upload, X, Wallet, TrendingUp as TrendingUpIcon, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  countryCodeToFlag,
  persistLocalePreferences,
  useLocalePreferences,
} from "@/lib/locale-preferences";
import { getPaymentConfig } from "@/lib/payments-api";
import { SHOP_TAG_OPTIONS } from "@/lib/shop-tags";
import { getApiErrorMessage, getApiErrorMessageWithSupport } from "@/lib/api-error";
import { SimpleSidebar } from "@/components/dashboard/SimpleSidebar";
import { RevenueTrendChart } from "@/components/analytics/RevenueTrendChart";
import { OrderStatusChart } from "@/components/analytics/OrderStatusChart";
import { SubscriptionAnalytics } from "@/components/analytics/SubscriptionAnalytics";
import { CustomerGrowthChart } from "@/components/analytics/CustomerGrowthChart";
import { EquipmentUtilizationChart } from "@/components/analytics/EquipmentUtilizationChart";
import { AnalyticsUpgradePrompt } from "@/components/analytics/AnalyticsUpgradePrompt";
import { canAccessAnalytics } from "@/lib/plan-utils";
import { Equipment } from "@/components/dashboard/Equipment";
import { StoreStatusToggle } from "@/components/dashboard/StoreStatusToggle";
import { StripeConnectOnboarding } from "@/components/stripe/StripeConnectOnboarding";
import { StripeProductCreation } from "@/components/stripe/StripeProductCreation";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Clock },
  accepted: { label: "Accepted", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: CheckCircle2 },
  printing: { label: "In Production", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: "bg-white/10 text-white", icon: AlertCircle };
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1.5 py-1 px-3`}>
      <Icon className="w-3.5 h-3.5" /> {config.label}
    </Badge>
  );
}

export default function DashboardWithSidebar() {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings state
  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [isConfirmingVerification, setIsConfirmingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [customTagDraft, setCustomTagDraft] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  
  // Equipment groups state
  const [showAddEquipmentGroup, setShowAddEquipmentGroup] = useState(false);
  const [editingEquipmentGroup, setEditingEquipmentGroup] = useState<any>(null);
  const [showAddPrinter, setShowAddPrinter] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<any>(null);
  const [togglingPrinterId, setTogglingPrinterId] = useState<string | null>(null);
  const [deletingPrinterId, setDeletingPrinterId] = useState<string | null>(null);
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    newOrders: true,
    customRequests: true,
    messages: true,
    reviews: true,
    promotions: false,
    accountUpdates: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    bio: user?.bio ?? "",
    location: user?.location ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    countryCode: user?.countryCode ?? "GB",
    languageCode: user?.languageCode ?? "en-GB",
    currencyCode: user?.currencyCode ?? "GBP",
    sellerTags: user?.sellerTags ?? [],
    shopName: user?.shopName ?? "",
    bannerUrl: user?.bannerUrl ?? "",
    shopAnnouncement: user?.shopAnnouncement ?? "",
    brandStory: user?.brandStory ?? "",
    websiteUrl: user?.websiteUrl ?? "",
    instagramHandle: user?.instagramHandle ?? "",
    supportEmail: user?.supportEmail ?? "",
    tiktokHandle: user?.tiktokHandle ?? "",
    xHandle: user?.xHandle ?? "",
    shopMode: user?.shopMode ?? "open",
    defaultShippingCost: user?.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
    shippingRegions: user?.shippingRegions ?? "",
    sellingRegions: user?.sellingRegions ?? [],
    shippingPolicy: user?.shippingPolicy ?? "",
    domesticShippingCost: user?.domesticShippingCost != null ? String(user.domesticShippingCost) : "",
    europeShippingCost: user?.europeShippingCost != null ? String(user.europeShippingCost) : "",
    northAmericaShippingCost: user?.northAmericaShippingCost != null ? String(user.northAmericaShippingCost) : "",
    internationalShippingCost: user?.internationalShippingCost != null ? String(user.internationalShippingCost) : "",
    freeShippingThreshold: user?.freeShippingThreshold != null ? String(user.freeShippingThreshold) : "",
    localPickupEnabled: !!user?.localPickupEnabled,
    taxRate: user?.taxRate != null ? String(user.taxRate) : "",
    processingDaysMin: user?.processingDaysMin != null ? String(user.processingDaysMin) : "1",
    processingDaysMax: user?.processingDaysMax != null ? String(user.processingDaysMax) : "7",
    returnPolicy: user?.returnPolicy ?? "",
    customOrderPolicy: user?.customOrderPolicy ?? "",
    // Color customization
    primaryColor: user?.primaryColor ?? "#8b5cf6",
    accentColor: user?.accentColor ?? "#06b6d4",
    backgroundColor: user?.backgroundColor ?? "#09090b",
    textColor: user?.textColor ?? "#ffffff",
  });
  
  // Store setup guide state
  const [setupTasks, setSetupTasks] = useState([
    { id: 'profile', title: 'Complete Your Profile', description: 'Add your shop name, logo, and description', link: '/settings', completed: false, icon: User },
    { id: 'listings', title: 'Create Your First Listing', description: 'Add your first 3D printing service or product', link: '/create-listing', completed: false, icon: Package },
    { id: 'equipment', title: 'Register Your Equipment', description: 'Add your 3D printers and capabilities', link: '/equipment', completed: false, icon: PrinterIcon },
    { id: 'payment', title: 'Set Up Payment Method', description: 'Configure your Stripe payment account', link: '/settings/payments', completed: false, icon: PaymentIcon },
    { id: 'shipping', title: 'Configure Shipping', description: 'Set up your shipping rates and methods', link: '/settings/shipping', completed: false, icon: Truck },
    { id: 'policies', title: 'Create Shop Policies', description: 'Add your return, refund, and privacy policies', link: '/settings/policies', completed: false, icon: Shield },
  ]);
  
  // Handle task completion
  const handleTaskToggle = (taskId: string) => {
    setSetupTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Handle sponsorship purchase - navigate to sponsorship purchase page
  const handleSponsorshipPurchase = () => {
    window.location.href = '/sponsorship/purchase';
  };
  
  // Calculate completion progress
  const completedTasks = setupTasks.filter(task => task.completed).length;
  const totalTasks = setupTasks.length;
  const completionPercentage = (completedTasks / totalTasks) * 100;
  
  // Queries
  console.log('Current user ID:', user?.id);
  const { data: orders = [], isLoading: ordersLoading } = useListOrders({ userId: user?.id });
  const { data: listings = [], isLoading: listingsLoading } = useListListings({ userId: user?.id });
  const { data: printers = [], isLoading: printersLoading } = useListPrinters({ userId: user?.id });
  const { data: reviews = [], isLoading: reviewsLoading } = useListReviews({ userId: user?.id });
  const { data: equipmentGroups = [], isLoading: groupsLoading } = useListEquipmentGroups({ userId: user?.id });
  
  console.log('Dashboard listings data:', listings);
  console.log('Dashboard listings loading:', listingsLoading);

  // Ensure data is not null and is an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeListings = Array.isArray(listings?.listings) ? listings.listings : (Array.isArray(listings) ? listings : []);
  const safePrinters = Array.isArray(printers) ? printers : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Calculate metrics
  const averageOrderValue = safeOrders.length > 0 
    ? safeOrders.reduce((sum, order) => sum + (order.total_amount || order.price || 0), 0) / safeOrders.length 
    : 0;
  
  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.total_amount || order.price || 0), 0);
  const activeEquipmentCount = safePrinters.filter(p => p.status === 'active' || p.status === 'online').length;
  const openOrders = safeOrders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  ).length;
  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;
  const completedOrders = safeOrders.filter(order => order.status === 'delivered').length;

  const recentOrdersList = Array.isArray(safeOrders) ? safeOrders.slice(0, 8) : [];
  const topListings = safeListings.length > 0 ? safeListings.slice(0, 6) : [];
  const recentReviews = safeReviews.length > 0 ? safeReviews.slice(0, 5) : [];

  const equipmentStatus = safePrinters.reduce((acc, printer) => {
    acc[printer.status] = (acc[printer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageRating = safeReviews.length > 0
    ? safeReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / safeReviews.length
    : 0;

  // Calculate percentage changes based on actual data
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // For now, calculate based on order count trends (replace with real historical data when available)
  const recentOrders = safeOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }).length;

  const olderOrders = safeOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
  }).length;

  const revenueChange = calculatePercentageChange(recentOrders, olderOrders);
  const ordersChange = calculatePercentageChange(recentOrders, olderOrders);

  // Get active section from hash and listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (typeof hash === 'string') {
        const hashValue = hash.slice(1);
        if (hashValue && ['overview', 'orders', 'equipment', 'listings', 'analytics', 'reviews', 'stripe-connect', 'settings'].includes(hashValue)) {
          setActiveSection(hashValue);
        } else if (!hashValue) {
          setActiveSection('overview');
        }
      }
    };

    // Initial hash check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Settings useEffect hooks
  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      avatarUrl: user.avatarUrl ?? "",
      countryCode: user.countryCode ?? "GB",
      languageCode: user.languageCode ?? "en-GB",
      currencyCode: user.currencyCode ?? "GBP",
      sellerTags: user.sellerTags ?? [],
      shopName: user.shopName ?? "",
      bannerUrl: user.bannerUrl ?? "",
      shopAnnouncement: user.shopAnnouncement ?? "",
      brandStory: user.brandStory ?? "",
      websiteUrl: user.websiteUrl ?? "",
      instagramHandle: user.instagramHandle ?? "",
      supportEmail: user.supportEmail ?? "",
      tiktokHandle: (user as any).tiktokHandle ?? "",
      xHandle: (user as any).xHandle ?? "",
      shopMode: user.shopMode ?? "open",
      defaultShippingCost: user.defaultShippingCost != null ? String(user.defaultShippingCost) : "",
      shippingRegions: user.shippingRegions ?? "",
      sellingRegions: user.sellingRegions ?? [],
      shippingPolicy: user.shippingPolicy ?? "",
      domesticShippingCost: user.domesticShippingCost != null ? String(user.domesticShippingCost) : "",
      europeShippingCost: user.europeShippingCost != null ? String(user.europeShippingCost) : "",
      northAmericaShippingCost: user.northAmericaShippingCost != null ? String(user.northAmericaShippingCost) : "",
      internationalShippingCost: user.internationalShippingCost != null ? String(user.internationalShippingCost) : "",
      freeShippingThreshold: user.freeShippingThreshold != null ? String(user.freeShippingThreshold) : "",
      localPickupEnabled: !!user.localPickupEnabled,
      taxRate: user.taxRate != null ? String(user.taxRate) : "",
      processingDaysMin: user.processingDaysMin != null ? String(user.processingDaysMin) : "1",
      processingDaysMax: user.processingDaysMax != null ? String(user.processingDaysMax) : "7",
      returnPolicy: user.returnPolicy ?? "",
      customOrderPolicy: user.customOrderPolicy ?? "",
      // Color customization
      primaryColor: (user as any).primaryColor ?? "#8b5cf6",
      accentColor: (user as any).accentColor ?? "#06b6d4",
      backgroundColor: (user as any).backgroundColor ?? "#09090b",
      textColor: (user as any).textColor ?? "#ffffff",
    });
  }, [user]);

  useEffect(() => {
    getPaymentConfig()
      .then((result) => setPaymentEnabled(result.checkoutEnabled))
      .catch(() => setPaymentEnabled(false));
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Settings handler functions
  const handleSave = async () => {
    if (!user) return;
    try {
      const shipping = form.defaultShippingCost.trim() === "" ? null : parseFloat(form.defaultShippingCost);
      const domesticShippingCost = form.domesticShippingCost.trim() === "" ? null : parseFloat(form.domesticShippingCost);
      const europeShippingCost = form.europeShippingCost.trim() === "" ? null : parseFloat(form.europeShippingCost);
      const northAmericaShippingCost = form.northAmericaShippingCost.trim() === "" ? null : parseFloat(form.northAmericaShippingCost);
      const internationalShippingCost = form.internationalShippingCost.trim() === "" ? null : parseFloat(form.internationalShippingCost);
      const freeShippingThreshold = form.freeShippingThreshold.trim() === "" ? null : parseFloat(form.freeShippingThreshold);
      const taxRate = form.taxRate.trim() === "" ? null : parseFloat(form.taxRate);
      const processingDaysMin = form.processingDaysMin.trim() === "" ? null : parseInt(form.processingDaysMin, 10);
      const processingDaysMax = form.processingDaysMax.trim() === "" ? null : parseInt(form.processingDaysMax, 10);
      await updateUser.mutateAsync({
        userId: user.id,
        data: {
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || null,
          location: form.location.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
          countryCode: form.countryCode.trim() || null,
          languageCode: form.languageCode.trim() || null,
          currencyCode: form.currencyCode.trim() || null,
          sellerTags: form.sellerTags,
          shopName: form.shopName.trim() || null,
          bannerUrl: form.bannerUrl.trim() || null,
          shopAnnouncement: form.shopAnnouncement.trim() || null,
          brandStory: form.brandStory.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
          instagramHandle: form.instagramHandle.trim() || null,
          supportEmail: form.supportEmail.trim() || null,
          tiktokHandle: form.tiktokHandle.trim() || null,
          xHandle: form.xHandle.trim() || null,
          shopMode: form.shopMode,
          defaultShippingCost: shipping != null && Number.isFinite(shipping) ? shipping : null,
          shippingRegions: form.shippingRegions.trim() || null,
          sellingRegions: form.sellingRegions,
          shippingPolicy: form.shippingPolicy.trim() || null,
          domesticShippingCost: domesticShippingCost != null && Number.isFinite(domesticShippingCost) ? domesticShippingCost : null,
          europeShippingCost: europeShippingCost != null && Number.isFinite(europeShippingCost) ? europeShippingCost : null,
          northAmericaShippingCost: northAmericaShippingCost != null && Number.isFinite(northAmericaShippingCost) ? northAmericaShippingCost : null,
          internationalShippingCost: internationalShippingCost != null && Number.isFinite(internationalShippingCost) ? internationalShippingCost : null,
          freeShippingThreshold: freeShippingThreshold != null && Number.isFinite(freeShippingThreshold) ? freeShippingThreshold : null,
          localPickupEnabled: form.localPickupEnabled,
          taxRate: taxRate != null && Number.isFinite(taxRate) ? taxRate : null,
          processingDaysMin: processingDaysMin != null && Number.isFinite(processingDaysMin) ? processingDaysMin : null,
          processingDaysMax: processingDaysMax != null && Number.isFinite(processingDaysMax) ? processingDaysMax : null,
          returnPolicy: form.returnPolicy.trim() || null,
          customOrderPolicy: form.customOrderPolicy.trim() || null,
          // Color customization
          primaryColor: form.primaryColor,
          accentColor: form.accentColor,
          backgroundColor: form.backgroundColor,
          textColor: form.textColor,
        },
      });
      persistLocalePreferences({
        countryCode: form.countryCode,
        languageCode: form.languageCode,
        currencyCode: form.currencyCode,
      });
      await refreshUser();
      toast({ title: "Settings saved", description: "Your account details were updated." });
    } catch (error) {
      toast({
        title: "Save failed",
        description: getApiErrorMessageWithSupport(error, "saving your settings"),
        variant: "destructive",
      });
    }
  };

  const updatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same new password twice.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await authChangePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated", description: "Use the new password next time you sign in." });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: getApiErrorMessageWithSupport(error, "updating your password"),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      setIsRequestingVerification(true);
      const result = await authRequestEmailVerification();
      toast({
        title: result.alreadyVerified ? "Email already verified" : "Verification code sent",
        description: result.alreadyVerified
          ? "This account is already verified."
          : `A 6-digit code was sent to ${result.email ?? "your email address"}.`,
      });
      if (!result.alreadyVerified) {
        setResendCountdown(60); // Start 60 second countdown
      }
      await refreshUser();
    } catch (error) {
      toast({
        title: "Could not send verification code",
        description: getApiErrorMessageWithSupport(error, "sending email verification"),
        variant: "destructive",
      });
    } finally {
      setIsRequestingVerification(false);
    }
  };

  const confirmVerificationCode = async () => {
    try {
      setIsConfirmingVerification(true);
      await authConfirmEmailVerification(verificationCode.trim());
      setVerificationCode("");
      await refreshUser();
      toast({ title: "Email verified", description: "Seller features are now fully enabled for this account." });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: getApiErrorMessageWithSupport(error, "verifying your email"),
        variant: "destructive",
      });
    } finally {
      setIsConfirmingVerification(false);
    }
  };

  const renderOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stripe Connect CTA */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CreditCardIcon className="h-6 w-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Start Accepting Payments with Stripe</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                Connect your Stripe account to receive payments for your 3D printing services and products. 
                Secure, fast, and reliable payment processing.
              </p>
              <Button 
                onClick={() => setActiveSection('stripe-connect')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Set Up Stripe Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Status Toggle */}
      {user?.role === 'seller' && <StoreStatusToggle />}

      {/* Dashboard Header with Edit Storefront Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-zinc-400">Track your business performance and manage your shop</p>
        </div>
        {user?.role === 'seller' && (
          <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/storefront/edit">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                      <StoreIcon className="w-4 h-4 mr-2" />
                      Edit Storefront
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Customize your shop appearance and branding</p>
                </TooltipContent>
              </Tooltip>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center text-green-400 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}%
              </div>
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total revenue from all completed orders in the last 30 days</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center text-blue-400 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {ordersChange > 0 ? '+' : ''}{ordersChange.toFixed(1)}%
              </div>
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{safeOrders.length}</p>
                    <p className="text-xs text-zinc-500 mt-1">{completedOrders} completed</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total orders received and completed orders count</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <PrinterIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex items-center text-purple-400 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Active
              </div>
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Equipment</p>
                    <p className="text-2xl font-bold text-white">{activeEquipmentCount}/{safePrinters.length}</p>
                    <p className="text-xs text-zinc-500 mt-1">Online and ready</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of active printers vs total registered equipment</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex items-center text-orange-400 text-sm">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                {averageRating.toFixed(1)}★
              </div>
            </div>
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
                    <p className="text-xs text-zinc-500 mt-1">{safeReviews.length} reviews</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your average customer rating and total number of reviews</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsorship Promotion */}
      <Card className="bg-gradient-to-r from-orange-600/20 to-pink-600/20 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-pink-600 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Boost Your Visibility</h3>
                <p className="text-zinc-400 text-sm">
                  Get featured placements and priority ranking with sponsorships
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-400" />
                    <span>Priority Placement</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rocket className="w-3 h-3 text-pink-400" />
                    <span>Enhanced Visibility</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>More Customers</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSponsorshipPurchase}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-medium px-6"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Buy Sponsorship
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get featured placements and boost your visibility</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Setup Guide & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Store Setup Guide */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <StoreIcon className="w-5 h-5" />
              Store Setup Guide
            </CardTitle>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                <span>Progress</span>
                <span>{completedTasks}/{totalTasks} Complete</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {setupTasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="pt-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className="w-4 h-4"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark this task as completed</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={task.link}>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${
                          task.completed ? 'text-green-400' : 'text-zinc-400 group-hover:text-white'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            task.completed ? 'text-green-400 line-through' : 'text-white group-hover:text-orange-300'
                          }`}>
                            {task.title}
                          </p>
                          <p className={`text-xs ${
                            task.completed ? 'text-green-400/60' : 'text-zinc-400'
                          }`}>
                            {task.description}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-300 transition-colors" />
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setActiveSection('orders')}>
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrdersList.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrdersList.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {order.listings?.title || `Order #${(order.id || '').slice(0, 8)}`}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          ${order.total_amount || order.price || 0} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Listings */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topListings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No listings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{listing.title}</p>
                        <p className="text-zinc-400 text-xs">${listing.base_price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-medium">
                        {listing.orders_count || 0} orders
                      </p>
                      <p className="text-zinc-400 text-xs">
                        ${(listing.orders_count || 0) * listing.base_price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                <p className="text-zinc-400">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-zinc-400 text-xs">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-sm">{review.comment}</p>
                    <p className="text-zinc-400 text-xs mt-1">- {review.reviewer_name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Orders Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-zinc-400">Track and manage all your orders in one place</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Pending</p>
                <p className="text-xl font-bold text-white">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">In Production</p>
                <p className="text-xl font-bold text-white">
                  {safeOrders.filter(o => o.status === 'printing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Shipped</p>
                <p className="text-xl font-bold text-white">
                  {safeOrders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Completed</p>
                <p className="text-xl font-bold text-white">{completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {safeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
              <p className="text-zinc-400 mb-6">You haven't received any orders yet</p>
              <Link href="/explore">
                <Button>Browse Items</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {safeOrders.map((order) => (
                <div key={order.id} className="border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">
                            {order.listings?.title || `Order #${(order.id || '').slice(0, 8)}`}
                          </h4>
                          <p className="text-zinc-400">
                            Order ID: {order.id} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Customer</p>
                          <p className="text-white font-medium">
                            {order.buyer?.display_name || order.buyer?.username || 'Guest'}
                          </p>
                          <p className="text-zinc-400 text-sm">{order.buyer?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order Details</p>
                          <p className="text-white font-medium">Quantity: {order.quantity}</p>
                          <p className="text-zinc-400 text-sm">Total: ${order.total_amount || order.price || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                          <StatusBadge status={order.status} />
                          {order.tracking_number && (
                            <p className="text-sm text-orange-400 mt-2">
                              Tracking: {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Order Notes</p>
                          <p className="text-sm text-zinc-300 bg-zinc-800/50 p-3 rounded-lg">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {order.listings && (
                        <Link href={`/listings/${order.listings.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const handleAddEquipment = () => {
    window.location.href = '/equipment';
  };

  const handleEditEquipment = (equipmentId: string) => {
    window.location.href = `/equipment/${equipmentId}`;
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      // TODO: Add actual delete API call
      console.log('Delete equipment:', equipmentId);
      // For now, just remove from UI - implement API call later
      window.location.reload();
    }
  };

  // Equipment groups handlers
  const handleDeleteEquipmentGroup = async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment group?')) {
      try {
        await useDeleteEquipmentGroup().mutateAsync({ groupId });
        toast({ title: "Equipment group deleted" });
      } catch (error) {
        toast({
          title: "Failed to delete equipment group",
          description: getApiErrorMessageWithSupport(error, "deleting the equipment group"),
          variant: "destructive",
        });
      }
    }
  };

  const handleAssignToGroup = async (printerId: string, groupId: string | null) => {
    setTogglingPrinterId(printerId);
    try {
      await useUpdatePrinter().mutateAsync({
        printerId,
        data: { equipmentGroupId: groupId },
      });
      toast({ title: "Equipment group updated" });
    } catch (error) {
      toast({
        title: "Failed to update equipment group",
        description: getApiErrorMessageWithSupport(error, "updating the equipment group"),
        variant: "destructive",
      });
    } finally {
      setTogglingPrinterId(null);
    }
  };

  const togglePrinter = async (printerId: string, newStatus: string) => {
    setTogglingPrinterId(printerId);
    try {
      await useUpdatePrinter().mutateAsync({
        printerId,
        data: { status: newStatus },
      });
      toast({ title: "Equipment status updated" });
    } catch (error) {
      toast({
        title: "Failed to update equipment status",
        description: getApiErrorMessageWithSupport(error, "updating the equipment status"),
        variant: "destructive",
      });
    } finally {
      setTogglingPrinterId(null);
    }
  };

  const removePrinter = async (printerId: string) => {
    setDeletingPrinterId(printerId);
    try {
      await useDeletePrinter().mutateAsync({ printerId });
      toast({ title: "Equipment removed" });
    } catch (error) {
      toast({
        title: "Failed to remove equipment",
        description: getApiErrorMessageWithSupport(error, "removing the equipment"),
        variant: "destructive",
      });
    } finally {
      setDeletingPrinterId(null);
    }
  };

  const handleUpdateEquipmentStatus = async (printerId: string, status: string) => {
    try {
      await useUpdatePrinter().mutateAsync({
        printerId,
        data: { status },
      });
      toast({ title: "Equipment status updated" });
    } catch (error) {
      toast({
        title: "Failed to update equipment status",
        description: getApiErrorMessageWithSupport(error, "updating the equipment status"),
        variant: "destructive",
      });
    }
  };

  const renderEquipment = () => (
    <Equipment
      myEquipmentGroups={equipmentGroups}
      myPrinters={safePrinters}
      setShowAddEquipmentGroup={setShowAddEquipmentGroup}
      setEditingEquipmentGroup={setEditingEquipmentGroup}
      handleDeleteEquipmentGroup={handleDeleteEquipmentGroup}
      setShowAddPrinter={setShowAddPrinter}
      setEditingPrinter={setEditingPrinter}
      handleAssignToGroup={handleAssignToGroup}
      togglingPrinterId={togglingPrinterId}
      togglePrinter={togglePrinter}
      deletingPrinterId={deletingPrinterId}
      removePrinter={removePrinter}
      handleUpdateEquipmentStatus={handleUpdateEquipmentStatus}
    />
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Listings Management</h2>
          <p className="text-zinc-400">Manage your products and services</p>
        </div>
        <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/create-listing">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new product or service to your shop</p>
            </TooltipContent>
          </Tooltip>
      </div>

      {/* Listings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Listings</p>
                <p className="text-xl font-bold text-white">{safeListings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Views</p>
                <p className="text-xl font-bold text-white">
                  {safeListings.length > 0 ? safeListings.reduce((sum, l) => sum + (l.views || 0), 0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ShoppingCart className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Orders</p>
                <p className="text-xl font-bold text-white">
                  {safeListings.length > 0 ? safeListings.reduce((sum, l) => sum + (l.orders_count || 0), 0) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <DollarSign className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Avg Price</p>
                <p className="text-xl font-bold text-white">
                  ${safeListings.length > 0 ? (safeListings.reduce((sum, l) => sum + (l.base_price || 0), 0) / safeListings.length).toFixed(2) : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeListings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-zinc-400 mb-6">Create your first product or service listing</p>
            <Link href="/create-listing">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>
        ) : (
          safeListings.map((listing) => (
            <Card key={listing.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="aspect-square bg-zinc-800 rounded-t-lg flex items-center justify-center">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <Package className="w-12 h-12 text-zinc-600" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-white mb-1 line-clamp-2">{listing.title}</h4>
                  <p className="text-zinc-400 text-sm line-clamp-2">{listing.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-white">${(listing.basePrice || listing.price || 0) + 1.62 + 1}</p>
                    <p className="text-xs text-zinc-400">{listing.listingType || listing.listing_type || 'product'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">{listing.orders_count || 0} orders</p>
                    <p className="text-xs text-zinc-500">{listing.views || 0} views</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/listings/${listing.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    // Check if user has access to analytics
    if (!canAccessAnalytics(user)) {
      return <AnalyticsUpgradePrompt />;
    }

    // Generate real revenue data from orders
    const generateRevenueData = () => {
      if (safeOrders.length === 0) {
        // Return empty data if no orders
        return [];
      }

      // Group orders by date
      const revenueByDate = new Map<string, { revenue: number; orders: number }>();
      
      safeOrders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const orderRevenue = order.total_amount || order.price || 0;
        
        if (!revenueByDate.has(date)) {
          revenueByDate.set(date, { revenue: 0, orders: 0 });
        }
        
        const current = revenueByDate.get(date)!;
        current.revenue += orderRevenue;
        current.orders += 1;
      });

      // Fill missing dates with zero values for the last 30 days
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = revenueByDate.get(dateStr) || { revenue: 0, orders: 0 };
        data.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders
        });
      }
      
      return data;
    };

    // Generate real order status data
    const generateOrderStatusData = () => [
      { status: 'pending', count: pendingOrders, percentage: safeOrders.length > 0 ? (pendingOrders / safeOrders.length) * 100 : 0, color: '#f59e0b', icon: Clock },
      { status: 'accepted', count: safeOrders.filter(o => o.status === 'accepted').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'accepted').length / safeOrders.length) * 100 : 0, color: '#f97316', icon: CheckCircle2 },
      { status: 'printing', count: safeOrders.filter(o => o.status === 'printing').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'printing').length / safeOrders.length) * 100 : 0, color: '#3b82f6', icon: Package },
      { status: 'shipped', count: safeOrders.filter(o => o.status === 'shipped').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'shipped').length / safeOrders.length) * 100 : 0, color: '#8b5cf6', icon: Truck },
      { status: 'delivered', count: completedOrders, percentage: safeOrders.length > 0 ? (completedOrders / safeOrders.length) * 100 : 0, color: '#10b981', icon: CheckCircle2 },
      { status: 'cancelled', count: safeOrders.filter(o => o.status === 'cancelled').length, percentage: safeOrders.length > 0 ? (safeOrders.filter(o => o.status === 'cancelled').length / safeOrders.length) * 100 : 0, color: '#ef4444', icon: XCircle }
    ];

    // Generate customer data (simplified - using unique buyers from orders)
    const generateCustomerData = () => {
      if (safeOrders.length === 0) {
        return [];
      }

      const customersByDate = new Map<string, { newCustomers: number; totalCustomers: Set<string>; returningCustomers: number }>();
      const allCustomers = new Set<string>();
      
      safeOrders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const customerId = order.buyer?.id || order.buyer_id || 'guest';
        
        if (!customersByDate.has(date)) {
          customersByDate.set(date, { newCustomers: 0, totalCustomers: new Set(), returningCustomers: 0 });
        }
        
        const dayData = customersByDate.get(date)!;
        if (!allCustomers.has(customerId)) {
          dayData.newCustomers += 1;
          allCustomers.add(customerId);
        } else {
          dayData.returningCustomers += 1;
        }
        dayData.totalCustomers.add(customerId);
      });

      // Generate cumulative data
      const data = [];
      let cumulativeCustomers = 0;
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = customersByDate.get(dateStr);
        cumulativeCustomers += dayData?.newCustomers || 0;
        
        data.push({
          date: dateStr,
          newCustomers: dayData?.newCustomers || 0,
          totalCustomers: cumulativeCustomers,
          activeCustomers: Math.floor(cumulativeCustomers * 0.8), // Estimate active customers
          returningCustomers: dayData?.returningCustomers || 0
        });
      }
      
      return data;
    };

    // Generate subscription data (mock for now - would need real subscription API)
    const generateSubscriptionData = () => {
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          free: Math.floor(Math.random() * 50) + 100,
          basic: Math.floor(Math.random() * 30) + 20,
          pro: Math.floor(Math.random() * 20) + 10,
          enterprise: Math.floor(Math.random() * 5) + 2,
          totalRevenue: Math.random() * 5000 + 2000,
          churnRate: Math.random() * 0.1 + 0.02,
          newSubscriptions: Math.floor(Math.random() * 25) + 10
        });
      }
      return data;
    };

    // Generate real equipment data
    const generateEquipmentData = () => {
      return safePrinters.map(printer => {
        // Calculate real utilization based on orders if possible
        const printerOrders = safeOrders.filter(order => 
          order.printer_id === printer.id || 
          order.equipment_used === printer.name
        );
        
        const jobsCompleted = printerOrders.length;
        const totalHours = 720; // 30 days * 24 hours
        const avgJobTime = jobsCompleted > 0 ? 4 : 0; // Average 4 hours per job
        const activeHours = jobsCompleted * avgJobTime;
        const utilizationRate = totalHours > 0 ? (activeHours / totalHours) * 100 : 0;
        
        return {
          equipmentId: printer.id,
          name: printer.name,
          type: printer.technology || 'Unknown',
          utilizationRate: Math.min(utilizationRate, 95), // Cap at 95%
          totalHours,
          activeHours,
          maintenanceHours: Math.random() * 20 + 5,
          idleHours: Math.max(0, totalHours - activeHours - (Math.random() * 20 + 5)),
          jobsCompleted,
          averageJobTime: avgJobTime,
          status: printer.status || 'active'
        };
      });
    };

    // Generate equipment time series data
    const generateEquipmentTimeSeries = () => {
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate daily utilization from orders
        const dayOrders = safeOrders.filter(order => 
          new Date(order.created_at).toISOString().split('T')[0] === dateStr
        );
        
        const totalJobs = dayOrders.length;
        const activeEquipment = Math.min(activeEquipmentCount, totalJobs);
        const overallUtilization = activeEquipmentCount > 0 ? (activeEquipment / safePrinters.length) * 100 : 0;
        
        data.push({
          date: dateStr,
          overallUtilization: Math.min(overallUtilization + Math.random() * 20, 95),
          activeEquipment,
          totalJobs
        });
      }
      return data;
    };

    const revenueData = generateRevenueData();
    const orderStatusData = generateOrderStatusData();
    const customerData = generateCustomerData();
    const subscriptionData = generateSubscriptionData();
    const equipmentData = generateEquipmentData();
    const equipmentTimeSeries = generateEquipmentTimeSeries();

    const currentSubscriptions = {
      free: 150,
      basic: 45,
      pro: 25,
      enterprise: 8
    };

    const subscriptionMetrics = {
      monthlyRecurringRevenue: 1847.45,
      averageRevenuePerUser: 12.34,
      customerLifetimeValue: 456.78,
      churnRate: 0.034,
      subscriptionGrowthRate: 0.156
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-zinc-400">Comprehensive insights into your business performance</p>
        </div>

        {/* Revenue Analytics - Subscription Only */}
        {revenueData.length > 0 && (
          <div className="relative">
            {!canAccessAnalytics(user) && (
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-white font-medium mb-2">Revenue Analytics</p>
                  <p className="text-zinc-400 text-sm mb-3">Upgrade to Pro for detailed revenue insights</p>
                  <Link href="/pricing">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <RevenueTrendChart data={revenueData} timeRange="30d" />
          </div>
        )}

        {/* Order Status Analytics - Available for all */}
        {safeOrders.length > 0 && (
          <OrderStatusChart data={orderStatusData} />
        )}

        {/* Customer Growth Analytics - Subscription Only */}
        {customerData.length > 0 && (
          <div className="relative">
            {!canAccessAnalytics(user) && (
              <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-white font-medium mb-2">Customer Analytics</p>
                  <p className="text-zinc-400 text-sm mb-3">Track customer growth and retention</p>
                  <Link href="/pricing">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Crown className="w-4 h-4 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <CustomerGrowthChart data={customerData} timeRange="30d" />
          </div>
        )}

        {/* Subscription Analytics - Enterprise Only */}
        <div className="relative">
          {!canAccessAnalytics(user) && (
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-white font-medium mb-2">Advanced Analytics</p>
                <p className="text-zinc-400 text-sm mb-3">Enterprise plan required for subscription metrics</p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade to Enterprise
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <SubscriptionAnalytics 
            data={subscriptionData} 
            currentSubscriptions={currentSubscriptions}
            metrics={subscriptionMetrics}
          />
        </div>

        {/* Equipment Utilization */}
        {safePrinters.length > 0 && (
          <EquipmentUtilizationChart 
            equipmentData={equipmentData}
            timeSeriesData={equipmentTimeSeries}
            timeRange="7d"
          />
        )}

        {/* Empty state if no data */}
        {revenueData.length === 0 && safeOrders.length === 0 && safePrinters.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Available</h3>
            <p className="text-zinc-400 mb-6">
              Start taking orders and adding equipment to see your analytics here.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderReviews = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        <p className="text-zinc-400">Manage customer feedback and improve your service</p>
      </div>

      {/* Reviews Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Star className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Average Rating</p>
                <p className="text-xl font-bold text-white">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Total Reviews</p>
                <p className="text-xl font-bold text-white">{safeReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">5-Star Reviews</p>
                <p className="text-xl font-bold text-white">
                  {safeReviews.filter(r => r.rating === 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">Response Rate</p>
                <p className="text-xl font-bold text-white">95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {safeReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-zinc-400">Customer reviews will appear here once you start receiving orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {safeReviews.map((review) => (
                <div key={review.id} className="border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.reviewer_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.reviewer_name}</p>
                        <p className="text-zinc-400 text-sm">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-white">{review.comment}</p>
                  </div>
                  
                  {review.listing_title && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Package className="w-4 h-4" />
                      <span>Review for: {review.listing_title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStripeConnect = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
            <CreditCardIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Stripe Connect</h1>
            <p className="text-sm text-zinc-400">Connect your Stripe account to receive payments and create products</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <StripeConnectOnboarding />
        </div>

        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">About Stripe Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">
              Stripe Connect allows you to accept payments and manage your finances securely. 
              Once you complete onboarding, you can create products and start selling.
            </p>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>• Secure payment processing</li>
              <li>• Automatic payouts to your bank account</li>
              <li>• 10% platform fee on all transactions</li>
              <li>• Real-time transaction tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettings = () => {
    const isSeller = user?.role === "seller" || user?.role === "both";
    const isVerified = !!user?.emailVerifiedAt;
    const planTier = user?.planTier ?? "starter";

    return (
      <div className="space-y-8">
        {/* Settings Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
          <p className="text-zinc-400">Manage your account, preferences, and shop settings</p>
        </div>

        {/* Profile Section */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8 backdrop-blur-xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              Profile Information
            </h3>
            <p className="text-zinc-400">Manage your personal information and public profile</p>
          </div>

          {/* Avatar Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 mt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-[3px]">
                  <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                        {user?.displayName?.charAt(0) ?? "?"}
                      </div>
                    )}
                  </div>
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors border-2 border-zinc-900">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 6 * 1024 * 1024) {
                        toast({ title: "Image too large", description: "Use an image under 6MB.", variant: "destructive" });
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setForm((current) => ({
                          ...current,
                          avatarUrl: typeof reader.result === "string" ? reader.result : current.avatarUrl,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Profile Picture</h4>
                <p className="text-zinc-400 text-sm mb-3">Click the camera icon to upload a new avatar</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    <Upload className="w-3 h-3 mr-1" />
                    Drag & Drop Supported
                  </Badge>
                  <Badge variant="outline" className="border-white/20">
                    Max 6MB
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 lg:grid-cols-3 mt-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Country</label>
              <Select
                value={form.countryCode}
                onValueChange={(value) => {
                  const nextCountry = COUNTRY_OPTIONS.find((option) => option.code === value);
                  setForm((current) => ({
                    ...current,
                    countryCode: value,
                    currencyCode: nextCountry?.defaultCurrency ?? current.currencyCode,
                    languageCode: nextCountry?.defaultLanguage ?? current.languageCode,
                  }));
                }}
              >
                <SelectTrigger className="w-full bg-black/60 border-white/10 text-white">
                  <SelectValue>
                    {countryCodeToFlag(form.countryCode)} {COUNTRY_OPTIONS.find(o => o.code === form.countryCode)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {countryCodeToFlag(option.code)} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Language</label>
              <select
                value={form.languageCode}
                onChange={(event) => setForm((current) => ({ ...current, languageCode: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Currency</label>
              <select
                value={form.currencyCode}
                onChange={(event) => setForm((current) => ({ ...current, currencyCode: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} - {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Display Name</label>
              <Input
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="Your name"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Location</label>
              <Input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="City, Country"
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-zinc-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder="Tell the community about yourself..."
              rows={4}
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 mt-6">
            <Button 
              onClick={() => setShowProfilePreview(true)}
              className="px-6 py-2 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Preview Profile
            </Button>
            <NeonButton glowColor="primary" onClick={handleSave} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </NeonButton>
          </div>
        </div>

        {/* Policies Section */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8 backdrop-blur-xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Policies
            </h3>
            <p className="text-zinc-400">Review our terms, privacy, and cookie policies</p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Terms of Service</h4>
              <p className="text-sm text-zinc-300 mb-3">Read our terms of service to understand your rights and responsibilities when using Synthix.</p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />
                View Terms of Service
              </Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Privacy Policy</h4>
              <p className="text-sm text-zinc-300 mb-3">Learn how we collect, use, and protect your personal information.</p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />
                View Privacy Policy
              </Button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h4 className="text-lg font-semibold text-white mb-2">Cookie Policy</h4>
              <p className="text-sm text-zinc-300 mb-3">Understand how we use cookies and similar technologies to enhance your experience.</p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <FileText className="w-4 h-4 mr-2" />
                View Cookie Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'equipment':
        return renderEquipment();
      case 'listings':
        return renderListings();
      case 'analytics':
        return renderAnalytics();
      case 'reviews':
        return renderReviews();
      case 'stripe-connect':
        return renderStripeConnect();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950">
        <SimpleSidebar />
        
        {/* Main Content */}
        <div className="ml-16 group-hover:ml-64 p-4 md:p-8 transition-all duration-300 pt-4">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </div>

        {/* Profile Preview Modal */}
        <ProfilePreviewModal
          isOpen={showProfilePreview}
          onOpenChange={setShowProfilePreview}
          user={form}
        />
      </div>
    </TooltipProvider>
  );
}

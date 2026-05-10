import { Crown, Lock, TrendingUp, BarChart3, Users, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getPlanDisplayName, getNextPlan, canAccessAnalytics } from "@/lib/plan-utils";
import { Link } from "wouter";

export function AnalyticsUpgradePrompt() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  const canAccess = canAccessAnalytics(user);
  const currentPlan = getPlanDisplayName(user.planTier);
  const nextPlan = getNextPlan(user.planTier);

  if (canAccess) {
    return null;
  }

  const features = [
    { icon: TrendingUp, title: "Revenue Analytics", description: "Track revenue trends and growth patterns" },
    { icon: BarChart3, title: "Order Analytics", description: "Monitor order status and fulfillment metrics" },
    { icon: Users, title: "Customer Analytics", description: "Understand customer acquisition and retention" },
    { icon: CreditCard, title: "Subscription Metrics", description: "MRR, ARPU, CLV, and churn analysis" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Analytics is a {nextPlan || 'Pro'} Feature
        </h2>
        
        <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
          You're currently on the {currentPlan} plan. Upgrade to {nextPlan || 'Pro'} to unlock comprehensive analytics and grow your business with data-driven insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/pricing">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to {nextPlan || 'Pro'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
            Compare Plans
          </Button>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="bg-zinc-900/50 border-zinc-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-zinc-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-zinc-500 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 opacity-50">
          <CardHeader>
            <CardTitle className="text-zinc-500 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Order Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-zinc-800 rounded-lg flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

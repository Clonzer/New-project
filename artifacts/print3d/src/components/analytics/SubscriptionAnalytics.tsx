import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { Crown, Users, TrendingUp, CreditCard, Star, Target, Zap } from "lucide-react";

interface SubscriptionData {
  month: string;
  free: number;
  basic: number;
  pro: number;
  enterprise: number;
  totalRevenue: number;
  churnRate: number;
  newSubscriptions: number;
}

interface SubscriptionAnalyticsProps {
  data: SubscriptionData[];
  currentSubscriptions: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
  metrics: {
    monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  churnRate: number;
  subscriptionGrowthRate: number;
  };
}

const TIER_COLORS = {
  free: '#6b7280',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b'
};

const TIER_PRICES = {
  free: 0,
  basic: 9.99,
  pro: 29.99,
  enterprise: 99.99
};

export function SubscriptionAnalytics({ data, currentSubscriptions, metrics }: SubscriptionAnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const totalCurrentSubscriptions = Object.values(currentSubscriptions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">MRR</p>
              <p className="text-lg font-bold text-green-400">{formatCurrency(metrics.monthlyRecurringRevenue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>+{formatPercentage(metrics.subscriptionGrowthRate)}</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Subscribers</p>
              <p className="text-lg font-bold text-white">{totalCurrentSubscriptions}</p>
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            {currentSubscriptions.pro + currentSubscriptions.enterprise} premium
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">ARPU</p>
              <p className="text-lg font-bold text-purple-400">{formatCurrency(metrics.averageRevenuePerUser)}</p>
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            Per user monthly
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Churn Rate</p>
              <p className="text-lg font-bold text-orange-400">{formatPercentage(metrics.churnRate)}</p>
            </div>
          </div>
          <div className="text-xs text-zinc-400">
            Monthly
          </div>
        </div>
      </div>

      {/* Subscription Tiers Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            Current Subscription Tiers
          </h3>
          
          <div className="space-y-4">
            {Object.entries(currentSubscriptions).map(([tier, count]) => {
              const percentage = totalCurrentSubscriptions > 0 ? (count / totalCurrentSubscriptions) * 100 : 0;
              const revenue = count * TIER_PRICES[tier as keyof typeof TIER_PRICES];
              
              return (
                <div key={tier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: TIER_COLORS[tier as keyof typeof TIER_COLORS] }}
                      />
                      <span className="text-white font-medium capitalize">{tier}</span>
                      <span className="text-zinc-400 text-sm">({count} users)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(revenue)}</p>
                      <p className="text-zinc-400 text-xs">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: TIER_COLORS[tier as keyof typeof TIER_COLORS]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Growth Trend */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Subscription Growth
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#f3f4f6', fontSize: 12 }}
                  formatter={(value: number) => [formatCurrency(value), 'MRR']}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tier Migration & Churn Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            New Subscriptions by Tier
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#f3f4f6', fontSize: 12 }}
                />
                <Bar dataKey="newSubscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            Customer Lifetime Value
          </h3>
          
          <div className="space-y-4">
            <div className="text-center py-8">
              <p className="text-3xl font-bold text-purple-400 mb-2">
                {formatCurrency(metrics.customerLifetimeValue)}
              </p>
              <p className="text-zinc-400 text-sm">Average CLV per customer</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(metrics.averageRevenuePerUser)}
                </p>
                <p className="text-xs text-zinc-500">ARPU</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  {metrics.churnRate < 0.01 ? 'Low' : metrics.churnRate < 0.05 ? 'Medium' : 'High'}
                </p>
                <p className="text-xs text-zinc-500">Churn Risk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

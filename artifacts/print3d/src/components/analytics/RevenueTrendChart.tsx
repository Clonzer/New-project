import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueTrendChartProps {
  data: RevenueData[];
  timeRange: '7d' | '30d' | '90d';
}

export function RevenueTrendChart({ data, timeRange }: RevenueTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    if (timeRange === '7d') {
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeRange === '30d') {
      return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } else {
      return dateObj.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const averageRevenue = totalRevenue / data.length;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Revenue Trend
          </h3>
          <p className="text-zinc-400 text-sm mt-1">Track your revenue over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-zinc-500">Total Revenue</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Avg Daily</p>
            <p className="text-lg font-bold text-white">{formatCurrency(averageRevenue)}</p>
          </div>
        </div>
      </div>

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
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#f3f4f6', fontSize: 12 }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => formatDate(label as string)}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Revenue</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Orders</p>
            <p className="text-sm font-semibold text-white">{totalOrders}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Avg Order</p>
            <p className="text-sm font-semibold text-white">
              {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

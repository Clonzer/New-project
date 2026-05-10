import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Users, TrendingUp, UserPlus, Activity, Target } from "lucide-react";

interface CustomerData {
  date: string;
  newCustomers: number;
  totalCustomers: number;
  activeCustomers: number;
  returningCustomers: number;
}

interface CustomerGrowthChartProps {
  data: CustomerData[];
  timeRange: '7d' | '30d' | '90d';
}

export function CustomerGrowthChart({ data, timeRange }: CustomerGrowthChartProps) {
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

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2] || data[0];
  const growthRate = previousData.totalCustomers > 0 
    ? ((latestData.totalCustomers - previousData.totalCustomers) / previousData.totalCustomers) * 100 
    : 0;

  const totalNewCustomers = data.reduce((sum, item) => sum + item.newCustomers, 0);
  const averageNewCustomers = totalNewCustomers / data.length;
  const currentActiveCustomers = latestData.activeCustomers;
  const customerRetentionRate = latestData.totalCustomers > 0 
    ? (latestData.activeCustomers / latestData.totalCustomers) * 100 
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-300">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Customer Growth Analytics
          </h3>
          <p className="text-zinc-400 text-sm mt-1">Track customer acquisition and retention</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-zinc-500">Total Customers</p>
            <p className="text-lg font-bold text-white">{latestData.totalCustomers.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Growth Rate</p>
            <p className={`text-lg font-bold ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Main Growth Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="totalCustomers" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#totalGradient)"
              name="Total Customers"
            />
            <Area 
              type="monotone" 
              dataKey="activeCustomers" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#activeGradient)"
              name="Active Customers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* New Customers Chart */}
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={formatDate}
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
              formatter={(value: number) => [value, 'New Customers']}
              labelFormatter={(label) => formatDate(label as string)}
            />
            <Line 
              type="monotone" 
              dataKey="newCustomers" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">New Customers</p>
            <p className="text-sm font-semibold text-white">{totalNewCustomers}</p>
            <p className="text-xs text-zinc-400">{averageNewCustomers.toFixed(1)}/day</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Active Customers</p>
            <p className="text-sm font-semibold text-white">{currentActiveCustomers}</p>
            <p className="text-xs text-zinc-400">{customerRetentionRate.toFixed(1)}% retention</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Growth Rate</p>
            <p className={`text-sm font-semibold ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-400">vs last period</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Returning</p>
            <p className="text-sm font-semibold text-white">{latestData.returningCustomers}</p>
            <p className="text-xs text-zinc-400">repeat customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}

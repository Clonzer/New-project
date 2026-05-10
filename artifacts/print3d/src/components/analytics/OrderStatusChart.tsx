import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Package, Clock, CheckCircle2, Truck, XCircle, AlertTriangle } from "lucide-react";

interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
  icon: any;
}

interface OrderStatusChartProps {
  data: OrderStatusData[];
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#f97316',
  printing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444'
};

const STATUS_ICONS = {
  pending: Clock,
  accepted: CheckCircle2,
  printing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  const formatTooltip = (value: number, name: string) => {
    const percentage = ((value / totalOrders) * 100).toFixed(1);
    return [`${value} orders (${percentage}%)`, name];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-white font-medium capitalize">{data.status}</span>
          </div>
          <p className="text-zinc-300 text-sm">{data.count} orders</p>
          <p className="text-zinc-400 text-xs">{data.percentage}% of total</p>
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
            <Package className="w-5 h-5 text-blue-400" />
            Order Status Distribution
          </h3>
          <p className="text-zinc-400 text-sm mt-1">Breakdown of all order statuses</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Total Orders</p>
          <p className="text-lg font-bold text-white">{totalOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status List */}
        <div className="space-y-3">
          {data.map((status) => {
            const Icon = STATUS_ICONS[status.status as keyof typeof STATUS_ICONS] || AlertTriangle;
            return (
              <div 
                key={status.status}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${status.color}20` }}
                  >
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: status.color }}
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{status.status}</p>
                    <p className="text-zinc-400 text-xs">{status.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{status.count}</p>
                  <p className="text-zinc-400 text-xs">orders</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {data.find(s => s.status === 'delivered')?.count || 0}
          </p>
          <p className="text-xs text-zinc-500">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {data.find(s => s.status === 'printing')?.count || 0}
          </p>
          <p className="text-xs text-zinc-500">In Production</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {data.find(s => s.status === 'pending')?.count || 0}
          </p>
          <p className="text-xs text-zinc-500">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">
            {data.find(s => s.status === 'cancelled')?.count || 0}
          </p>
          <p className="text-xs text-zinc-500">Cancelled</p>
        </div>
      </div>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { Printer, Clock, CheckCircle2, AlertTriangle, TrendingUp, Activity } from "lucide-react";

interface EquipmentData {
  equipmentId: string;
  name: string;
  type: string;
  utilizationRate: number;
  totalHours: number;
  activeHours: number;
  maintenanceHours: number;
  idleHours: number;
  jobsCompleted: number;
  averageJobTime: number;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
}

interface TimeSeriesData {
  date: string;
  overallUtilization: number;
  activeEquipment: number;
  totalJobs: number;
}

interface EquipmentUtilizationChartProps {
  equipmentData: EquipmentData[];
  timeSeriesData: TimeSeriesData[];
  timeRange: '24h' | '7d' | '30d';
}

export function EquipmentUtilizationChart({ equipmentData, timeSeriesData, timeRange }: EquipmentUtilizationChartProps) {
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    if (timeRange === '24h') {
      return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '7d') {
      return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatHours = (value: number) => `${value.toFixed(1)}h`;

  const totalEquipment = equipmentData.length;
  const activeEquipment = equipmentData.filter(e => e.status === 'active').length;
  const averageUtilization = equipmentData.reduce((sum, e) => sum + e.utilizationRate, 0) / totalEquipment;
  const totalJobs = equipmentData.reduce((sum, e) => sum + e.jobsCompleted, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'maintenance': return '#3b82f6';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle2;
      case 'idle': return Clock;
      case 'maintenance': return AlertTriangle;
      case 'offline': return AlertTriangle;
      default: return Clock;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-300">
                {entry.name}: {typeof entry.value === 'number' ? formatPercentage(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Avg Utilization</p>
              <p className="text-lg font-bold text-green-400">{formatPercentage(averageUtilization)}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Printer className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Active Equipment</p>
              <p className="text-lg font-bold text-white">{activeEquipment}/{totalEquipment}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Jobs</p>
              <p className="text-lg font-bold text-purple-400">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Avg Job Time</p>
              <p className="text-lg font-bold text-orange-400">
                {formatHours(equipmentData.reduce((sum, e) => sum + e.averageJobTime, 0) / totalEquipment)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Utilization Trend */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400" />
          Overall Utilization Trend
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="overallUtilization" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#utilizationGradient)"
                name="Utilization Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Equipment Utilization */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Printer className="w-5 h-5 text-blue-400" />
          Equipment Performance
        </h3>
        
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={equipmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#f3f4f6', fontSize: 12 }}
                formatter={(value: number) => [formatPercentage(value), 'Utilization']}
              />
              <Bar 
                dataKey="utilizationRate" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Details */}
        <div className="space-y-3">
          {equipmentData.map((equipment) => {
            const StatusIcon = getStatusIcon(equipment.status);
            return (
              <div 
                key={equipment.equipmentId}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-700/50">
                    <Printer className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{equipment.name}</p>
                    <p className="text-zinc-400 text-xs">{equipment.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <StatusIcon 
                      className="w-4 h-4" 
                      style={{ color: getStatusColor(equipment.status) }}
                    />
                    <span className="text-zinc-400 text-sm capitalize">{equipment.status}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatPercentage(equipment.utilizationRate)}</p>
                    <p className="text-zinc-400 text-xs">{equipment.jobsCompleted} jobs</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatHours(equipment.activeHours)}</p>
                    <p className="text-zinc-400 text-xs">active time</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

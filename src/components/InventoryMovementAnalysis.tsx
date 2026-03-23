import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Download, 
  Calendar, 
  ChevronRight, 
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const movementData = [
  { month: 'JAN', movement: 400, forecast: 450 },
  { month: 'FEB', movement: 300, forecast: 380 },
  { month: 'MAR', movement: 600, forecast: 550 },
  { month: 'APR', movement: 800, forecast: 700 },
  { month: 'MAY', movement: 500, forecast: 600 },
  { month: 'JUN', movement: 900, forecast: 850 },
];

const valuationData = [
  { name: 'Electronics', value: 55, color: '#2563eb' },
  { name: 'Apparel', value: 25, color: '#f59e0b' },
  { name: 'Other', value: 20, color: '#e2e8f0' },
];

export const InventoryMovementAnalysis: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <span>Inventory Analysis</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-bold">Movement Dashboard</span>
          </nav>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Movement Analysis</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time stock turnover intelligence and movement performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <Calendar size={18} className="text-slate-400" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<TrendingUp size={20} className="text-blue-600" />}
          label="Inventory Turnover Ratio"
          value="4.2x"
          trend="+12%"
          trendUp={true}
          progress={70}
          progressColor="bg-blue-600"
        />
        <StatCard 
          icon={<Clock size={20} className="text-amber-600" />}
          label="Average Days to Sell"
          value="28 Days"
          trend="Stable"
          trendUp={null}
          progress={45}
          progressColor="bg-amber-500"
        />
        <StatCard 
          icon={<AlertTriangle size={20} className="text-rose-600" />}
          label="Stock-out Risk Items"
          value="12 Items"
          trend="-5%"
          trendUp={false}
          progress={15}
          progressColor="bg-rose-500"
        />
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Movement Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stock Movement Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Outbound vs Inbound volume (Last 6 months)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider">Movement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wider">Forecast</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementData}>
                <defs>
                  <linearGradient id="colorMovement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="movement" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMovement)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#e2e8f0" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Stock Valuation</h3>
          <p className="text-xs text-slate-500 font-medium mb-6">By Category</p>
          
          <div className="relative h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={valuationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {valuationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">$2.4M</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {valuationData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Fast vs Slow Moving */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fast vs Slow Moving</h3>
            <Info size={18} className="text-slate-400" />
          </div>
          <div className="space-y-6">
            <MovingItem label="iPhone 15 Pro Max (Restock Priority)" status="Fast Moving" statusColor="text-emerald-500" progress={90} color="bg-emerald-500" />
            <MovingItem label="MacBook Air M3 13\" status="Fast Moving" statusColor="text-emerald-500" progress={85} color="bg-emerald-500" />
            <MovingItem label="Smart TV Remote Gen 2" status="Normal" statusColor="text-amber-500" progress={45} color="bg-amber-500" />
            <MovingItem label="Clear Case - Legacy Models" status="Slow Moving" statusColor="text-rose-500" progress={15} color="bg-rose-500" />
          </div>
        </div>

        {/* Recent Movement */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Movement</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All Movements</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4">Item Name</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Qty</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                <RecentMovementRow 
                  item="Pixel 8 Pro - Obsidian" 
                  type="Restock" 
                  qty="+50" 
                  qtyColor="text-emerald-600"
                  status="COMPLETED" 
                  statusColor="bg-emerald-100 text-emerald-700"
                  time="2 mins ago"
                />
                <RecentMovementRow 
                  item="HP Envy x360 15\" 
                  type="Transit" 
                  qty="-12" 
                  qtyColor="text-slate-900 dark:text-white"
                  status="IN TRANSIT" 
                  statusColor="bg-amber-100 text-amber-700"
                  time="15 mins ago"
                />
                <RecentMovementRow 
                  item="Sony WH-1000XM5" 
                  type="Restock" 
                  qty="+24" 
                  qtyColor="text-emerald-600"
                  status="COMPLETED" 
                  statusColor="bg-emerald-100 text-emerald-700"
                  time="1 hour ago"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, trend, trendUp, progress, progressColor }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-black ${trendUp === true ? 'text-emerald-500' : trendUp === false ? 'text-rose-500' : 'text-slate-400'}`}>
        {trendUp === true && <ArrowUpRight size={14} />}
        {trendUp === false && <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{value}</h4>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-full ${progressColor}`}
      />
    </div>
  </div>
);

const MovingItem = ({ label, status, statusColor, progress, color }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs font-bold">
      <span className="text-slate-900 dark:text-white">{label}</span>
      <span className={statusColor}>{status}</span>
    </div>
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const RecentMovementRow = ({ item, type, qty, qtyColor, status, statusColor, time }: any) => (
  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <td className="py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
          <Package size={16} />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white">{item}</span>
      </div>
    </td>
    <td className="py-4 text-xs font-bold text-slate-500">{type}</td>
    <td className={`py-4 text-xs font-black ${qtyColor}`}>{qty}</td>
    <td className="py-4">
      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
        {status}
      </span>
    </td>
    <td className="py-4 text-right text-[10px] font-bold text-slate-400">{time}</td>
  </tr>
);

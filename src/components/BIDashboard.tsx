import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

const salesData = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
  { name: 'Jul', sales: 3490, profit: 4300 },
];

const inventoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Apparel', value: 300 },
  { name: 'Home & Kitchen', value: 300 },
  { name: 'Automotive', value: 200 },
];

const topItems = [
  { name: 'Cotton Spindle', sales: 1200 },
  { name: 'Industrial Glue', sales: 900 },
  { name: 'Steel Fastener', sales: 800 },
  { name: 'Nylon Thread', sales: 600 },
  { name: 'Organic Solvent', sales: 400 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const BIDashboard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8 max-w-[1600px] mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Business Intelligence</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider opacity-60">Real-time performance analytics and data-driven insights</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value="₹ 12,45,000" 
          trend="+12.5%" 
          isPositive={true} 
          icon={<DollarSign size={24} className="text-blue-600" />} 
          color="blue"
        />
        <KPICard 
          title="Inventory Value" 
          value="₹ 8,92,400" 
          trend="-2.4%" 
          isPositive={false} 
          icon={<Package size={24} className="text-emerald-600" />} 
          color="emerald"
        />
        <KPICard 
          title="Active Customers" 
          value="1,240" 
          trend="+5.2%" 
          isPositive={true} 
          icon={<Users size={24} className="text-amber-600" />} 
          color="amber"
        />
        <KPICard 
          title="Avg. Order Value" 
          value="₹ 4,520" 
          trend="+8.1%" 
          isPositive={true} 
          icon={<Activity size={24} className="text-rose-600" />} 
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <ChartContainer title="Sales & Profit Trend" subtitle="Monthly revenue vs net profit">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Top Selling Items */}
        <ChartContainer title="Top Selling Items" subtitle="Highest volume products this month">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} width={120} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Inventory Distribution */}
        <ChartContainer title="Inventory Distribution" subtitle="Stock value by category">
          <div className="flex flex-col md:flex-row items-center justify-around h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 w-full md:w-64">
              {inventoryData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>

        {/* Business Health Score */}
        <ChartContainer title="Business Health Score" subtitle="Overall operational efficiency">
          <div className="flex flex-col items-center justify-center h-[350px] relative">
            <div className="text-center space-y-2">
              <div className="text-7xl font-black text-blue-600 tracking-tighter">84<span className="text-2xl">%</span></div>
              <div className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Excellent Health</div>
              <p className="text-sm text-slate-500 max-w-[240px] mx-auto font-medium">Your business is performing 12% better than the last quarter.</p>
            </div>
            
            {/* Simple Gauge visualization using SVG */}
            <svg className="absolute w-64 h-64 -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="20"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={690}
                strokeDashoffset={690 * (1 - 0.84)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </ChartContainer>
      </div>

      {/* Footer Credit */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        © 2024 baawan.com ERP v4.2.0 • BI Analytics Suite
      </footer>
    </motion.div>
  );
};

const KPICard = ({ title, value, trend, isPositive, icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all group">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
  </div>
);

const ChartContainer = ({ title, subtitle, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
    <div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider opacity-60">{subtitle}</p>
    </div>
    <div className="w-full">
      {children}
    </div>
  </div>
);

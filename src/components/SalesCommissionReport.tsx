import React from 'react';
import { 
  Users, 
  Calendar, 
  ChevronDown, 
  Download, 
  CreditCard, 
  FileText,
  TrendingUp,
  Info,
  Zap,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface CommissionLog {
  invoiceNo: string;
  date: string;
  customerName: string;
  location: string;
  invoiceValue: number;
  commPercent: number;
  commEarned: number;
  status: 'PAID' | 'UNPAID';
}

const commissionLogs: CommissionLog[] = [
  { invoiceNo: 'INV-2024-8821', date: '12 Oct 2023', customerName: 'Mahindra Logistics', location: 'Mumbai, Maharashtra', invoiceValue: 125000, commPercent: 5, commEarned: 6250, status: 'PAID' },
  { invoiceNo: 'INV-2024-8822', date: '15 Oct 2023', customerName: 'Bajaj Auto Ltd', location: 'Pune, Maharashtra', invoiceValue: 485000, commPercent: 8, commEarned: 38800, status: 'UNPAID' },
  { invoiceNo: 'INV-2024-8825', date: '18 Oct 2023', customerName: 'Reliance Retail', location: 'Gurugram, Haryana', invoiceValue: 92400, commPercent: 5, commEarned: 4620, status: 'PAID' },
  { invoiceNo: 'INV-2024-8831', date: '20 Oct 2023', customerName: 'Adani Enterprises', location: 'Ahmedabad, Gujarat', invoiceValue: 715000, commPercent: 12, commEarned: 85800, status: 'PAID' },
  { invoiceNo: 'INV-2024-8835', date: '22 Oct 2023', customerName: 'Tata Motors', location: 'Jamshedpur, Jharkhand', invoiceValue: 210000, commPercent: 8, commEarned: 16800, status: 'UNPAID' },
];

const trendData = [
  { name: 'Jun', value: 30 },
  { name: 'Jul', value: 45 },
  { name: 'Aug', value: 35 },
  { name: 'Sep', value: 55 },
  { name: 'Oct', value: 85 },
  { name: 'Nov', value: 70 },
];

export const SalesCommissionReport: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales Commission & Performance Report</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Real-time performance-based tracking for your sales force.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-500 transition-all">
                <CreditCard size={18} />
                Process Payment
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <FileText size={18} className="text-blue-600" />
                Statement
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <Download size={18} className="text-slate-600" />
                Export
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
            <FilterSelect icon={<Users size={16} />} label="All Sales Personnel" />
            <FilterSelect icon={<Calendar size={16} />} label="Last 30 Days" />
            <FilterSelect icon={<TrendingUp size={16} />} label="Commission Slab: All" />
            <FilterSelect icon={<Coins size={16} />} label="Collection: All" />
            <button className="ml-auto text-xs font-black text-amber-600 uppercase tracking-widest hover:text-amber-700">Reset Filters</button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard 
              label="Total Sales Target" 
              value="₹50,00,000" 
              trend="FY 2023-24" 
              icon={<Info size={16} />} 
              borderColor="border-slate-200"
            />
            <KPICard 
              label="Sales Achieved" 
              value="₹42,50,000" 
              icon={<Zap size={16} />} 
              borderColor="border-amber-400"
              progress={85}
            />
            <KPICard 
              label="Total Commission" 
              value="₹2,12,500" 
              trend="+12% vs last month" 
              trendColor="text-emerald-500"
              icon={<Wallet size={16} />} 
              borderColor="border-emerald-500"
              badge="+12% vs last month"
            />
            <KPICard 
              label="Paid to Date" 
              value="₹1,80,000" 
              trend="Balance: ₹32,500" 
              icon={<HistoryIcon size={16} />} 
              borderColor="border-orange-400"
              subtext="Balance: ₹32,500"
            />
          </div>

          <div className="flex gap-8">
            {/* Table Section */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Commission Transaction Log</h3>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-400 tracking-tight">Showing 1-10 of 145 items</span>
                  <div className="flex gap-1">
                    <button className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-400"><ChevronLeft size={16} /></button>
                    <button className="p-1 border border-slate-200 dark:border-slate-700 rounded text-slate-400"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-5">Invoice No</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Customer Name</th>
                      <th className="px-6 py-5 text-right">Invoice Value</th>
                      <th className="px-6 py-5 text-center">Comm %</th>
                      <th className="px-6 py-5 text-right">Commission Earned</th>
                      <th className="px-6 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {commissionLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-5 text-sm font-bold text-slate-500">{log.invoiceNo}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{log.date}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{log.customerName}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{log.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">₹{log.invoiceValue.toLocaleString()}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 text-center">{log.commPercent}%</td>
                        <td className="px-6 py-5 text-sm font-black text-emerald-600 text-right">₹{log.commEarned.toLocaleString()}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest ${
                            log.status === 'PAID' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Section */}
            <div className="w-96 space-y-8">
              {/* Performance Analytics */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">
                  <TrendingUp size={18} className="text-amber-500" />
                  Performance Analytics
                </h3>
                
                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">TARGET VS ACHIEVEMENT</p>
                    <div className="relative w-48 h-24 mx-auto overflow-hidden">
                      <svg className="w-48 h-48" viewBox="0 0 100 100">
                        <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" strokeDasharray="125.6 251.2" strokeDashoffset="0" transform="rotate(180 50 50)" />
                        <circle 
                          className="text-amber-400 stroke-current" 
                          strokeWidth="10" 
                          strokeDasharray="125.6 251.2" 
                          strokeDashoffset={125.6 - (125.6 * 85) / 100} 
                          strokeLinecap="round" 
                          fill="transparent" 
                          r="40" 
                          cx="50" 
                          cy="50" 
                          transform="rotate(180 50 50)"
                        />
                      </svg>
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">85%</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">₹7.5L Remaining to Goal</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">MONTHLY TREND (₹)</p>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {trendData.map(d => <span key={d.name}>{d.name}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Alerts */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">COLLECTION ALERTS</h3>
                
                <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex gap-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Payment Pending</p>
                    <p className="text-xs text-slate-500 mt-1">Bajaj Auto Ltd (INV-8822) overdue by 4 days.</p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Target Bonus Unlocked</p>
                    <p className="text-xs text-slate-500 mt-1">Amit Sharma achieved 80% monthly milestone.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 transition-all group">
    <div className="text-blue-600">{icon}</div>
    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{label}</span>
    <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600" />
  </div>
);

const KPICard = ({ label, value, trend, trendColor, icon, borderColor, progress, badge, subtext }: any) => (
  <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border-l-4 ${borderColor} border border-slate-200 dark:border-slate-800 shadow-sm space-y-4`}>
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="text-slate-300">{icon}</div>
    </div>
    <div className="space-y-1">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h2>
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
      {badge && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>
          {badge}
        </span>
      )}
      {subtext && (
        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{subtext}</p>
      )}
      {trend && !badge && !subtext && (
        <p className={`text-[10px] font-black ${trendColor || 'text-slate-400'} uppercase tracking-widest`}>{trend}</p>
      )}
    </div>
  </div>
);

const HistoryIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

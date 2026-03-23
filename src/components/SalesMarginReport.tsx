import React from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Download, 
  FileSpreadsheet, 
  Filter,
  TrendingUp,
  ChevronRight,
  Info,
  ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MarginRow {
  invoiceNo: string;
  date: string;
  partyName: string;
  itemName: string;
  qty: number;
  cost: number;
  price: number;
  profit: number;
  marginColor: string;
}

const marginData: MarginRow[] = [
  { invoiceNo: '#INV-9021', date: '12 Oct 2023', partyName: 'Acme Corp Ltd', itemName: 'Pro Wireless Mouse M3', qty: 50, cost: 450, price: 750, profit: 15000, marginColor: 'bg-emerald-500' },
  { invoiceNo: '#INV-9022', date: '12 Oct 2023', partyName: 'Global Tech Hub', itemName: 'Mechanical Keyboard G-8', qty: 12, cost: 2800, price: 3200, profit: 4800, marginColor: 'bg-amber-500' },
  { invoiceNo: '#INV-9023', date: '13 Oct 2023', partyName: 'Retail King Store', itemName: 'USB-C Fast Charger', qty: 100, cost: 850, price: 920, profit: 7000, marginColor: 'bg-rose-500' },
  { invoiceNo: '#INV-9024', date: '13 Oct 2023', partyName: 'Smart Solutions', itemName: '4K Monitor Stand', qty: 25, cost: 1200, price: 2100, profit: 22500, marginColor: 'bg-emerald-500' },
  { invoiceNo: '#INV-9025', date: '14 Oct 2023', partyName: 'Nova Systems', itemName: 'Leather Office Chair', qty: 10, cost: 4500, price: 5500, profit: 10000, marginColor: 'bg-amber-500' },
  { invoiceNo: '#INV-9026', date: '14 Oct 2023', partyName: 'Digital Dynamics', itemName: 'Thunderbolt 4 Dock', qty: 5, cost: 12400, price: 15900, profit: 17500, marginColor: 'bg-emerald-500' },
];

const trendData = [
  { name: 'Sep 15', value: 40 },
  { name: 'Sep 20', value: 55 },
  { name: 'Sep 25', value: 45 },
  { name: 'Sep 30', value: 65 },
  { name: 'Oct 05', value: 60 },
  { name: 'Oct 10', value: 80 },
  { name: 'Oct 15', value: 70 },
];

export const SalesMarginReport: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Breadcrumbs & Header */}
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>baawan.com</span>
              <ChevronRight size={12} />
              <span>Reports</span>
              <ChevronRight size={12} />
              <span className="text-slate-900 dark:text-white">Sales Margin Report</span>
            </nav>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales Profitability & Margin Report</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Real-time analysis of gross margins and profitability trends across your inventory.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                  <Download size={18} className="text-slate-600" />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-500 transition-all">
                  <FileSpreadsheet size={18} />
                  Export to Excel
                </button>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <FilterSelect label="DATE RANGE" value="Last 30 Days" icon={<Calendar size={16} />} />
            <FilterSelect label="CATEGORY" value="All Categories" />
            <FilterSelect label="BRAND" value="All Brands" />
            <FilterSelect label="SALES PERSON" value="All Staff" />
            <button className="w-12 h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all">
              <Filter size={20} />
            </button>
          </div>

          <div className="flex gap-8">
            {/* Table Section */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-5">Invoice No</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Party Name</th>
                      <th className="px-6 py-5">Item Name</th>
                      <th className="px-6 py-5 text-center">Qty</th>
                      <th className="px-6 py-5 text-right">Cost (Avg)</th>
                      <th className="px-6 py-5 text-right">Price</th>
                      <th className="px-6 py-5 text-right">Profit</th>
                      <th className="px-6 py-5 text-center">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {marginData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-amber-600 hover:underline cursor-pointer">{row.invoiceNo}</span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{row.date}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">{row.partyName}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{row.itemName}</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-center">{row.qty}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-500 text-right">₹{row.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">₹{row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-sm font-black text-emerald-600 text-right">₹{row.profit.toLocaleString()}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${row.marginColor} rounded-full`} style={{ width: '70%' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-400 font-medium">Showing 6 of 128 items</p>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Prev</button>
                  <button className="w-10 h-10 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm">1</button>
                  <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">2</button>
                  <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">3</button>
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Next</button>
                </div>
              </div>
            </div>

            {/* Sidebar Section */}
            <div className="w-96 space-y-8">
              {/* Profitability Insights */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                  <TrendingUp size={18} className="text-amber-500" />
                  Profitability Insights
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">TOP 5 MOST PROFITABLE ITEMS</p>
                    <div className="space-y-4">
                      <TopItem label="Wireless Mouse M3" value="₹15k" percentage={90} color="bg-amber-400" />
                      <TopItem label="4K Monitor Stand" value="₹12.5k" percentage={75} color="bg-amber-400" />
                      <TopItem label="Leather Office Chair" value="₹10k" percentage={60} color="bg-amber-400" />
                      <TopItem label="Thunderbolt Docking" value="₹8.2k" percentage={50} color="bg-amber-400" />
                      <TopItem label="USB-C Fast Charger" value="₹7k" percentage={40} color="bg-amber-400" />
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">MARGIN TREND (30 DAYS)</p>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                          <Bar dataKey="value" fill="#FEF3C7" radius={[4, 4, 0, 0]}>
                            {trendData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === trendData.length - 1 ? '#F59E0B' : '#FEF3C7'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Sep 15</span>
                      <span>Oct 15</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tip */}
              <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Quick Tip</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Accessories category has the highest average margin at <span className="font-bold text-slate-900 dark:text-white">42%</span>. Consider running promotions on core electronics to boost volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 p-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex gap-12">
            <SummaryItem label="TOTAL SALES VALUE" value="₹8,42,500.00" />
            <SummaryItem label="TOTAL COST VALUE" value="₹6,24,100.00" />
            <SummaryItem label="OVERALL GROSS PROFIT" value="₹2,18,400.00" />
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-8 border border-white/10 shadow-xl">
            <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">WEIGHTED MARGIN %</p>
              <p className="text-4xl font-black text-white italic">25.92%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
          {icon}
        </div>
      )}
      <select className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none`}>
        <option>{value}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" size={16} />
    </div>
  </div>
);

const TopItem = ({ label, value, percentage, color }: { label: string, value: string, percentage: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
      <span className="text-xs font-black text-slate-900 dark:text-white">{value}</span>
    </div>
    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-amber-900">{value}</p>
  </div>
);

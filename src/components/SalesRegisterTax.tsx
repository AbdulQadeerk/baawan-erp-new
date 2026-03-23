import React from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Download, 
  FileSpreadsheet, 
  ArrowRight, 
  Info,
  TrendingUp,
  PieChart as PieChartIcon,
  ChevronUp
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
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SalesInvoice {
  date: string;
  invNo: string;
  partyName: string;
  gstin: string;
  taxableVal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

const salesData: SalesInvoice[] = [
  { date: '01-Apr-2024', invNo: 'SI-00241', partyName: 'Aditya Textiles & Fabrics', gstin: '07AADCA1234F1Z1', taxableVal: 45000.00, cgst: 4050.00, sgst: 4050.00, igst: 0.00, total: 53100.00 },
  { date: '01-Apr-2024', invNo: 'SI-00242', partyName: 'Global Logistics Solutions', gstin: '27AABCG1122D2Z3', taxableVal: 120500.00, cgst: 0.00, sgst: 0.00, igst: 21690.00, total: 142190.00 },
  { date: '02-Apr-2024', invNo: 'SI-00243', partyName: 'Modern Enterprises', gstin: '07BBDCA5678H1Z2', taxableVal: 12400.00, cgst: 1116.00, sgst: 1116.00, igst: 0.00, total: 14632.00 },
  { date: '03-Apr-2024', invNo: 'SI-00244', partyName: 'Sunrise Trading Co.', gstin: '09AABCA9988G1Z1', taxableVal: 67800.00, cgst: 6102.00, sgst: 6102.00, igst: 0.00, total: 80004.00 },
  { date: '03-Apr-2024', invNo: 'SI-00245', partyName: 'Innova Industrial Parts', gstin: '27CCBCA2233K1Z4', taxableVal: 245000.00, cgst: 0.00, sgst: 0.00, igst: 44100.00, total: 289100.00 },
];

const chartData = [
  { name: 'W1', value: 400 },
  { name: 'W2', value: 600 },
  { name: 'W3', value: 350 },
  { name: 'W4', value: 750 },
  { name: 'W5', value: 900 },
];

const pieData = [
  { name: 'IGST', value: 1245000, color: '#F59E0B' },
  { name: 'CGST + SGST', value: 432000, color: '#E2E8F0' },
];

export const SalesRegisterTax: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Sales Register with Tax Breakup</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Comprehensive chronological sales data for April 2024</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-500 transition-all">
                  <FileSpreadsheet size={18} />
                  Export to Excel
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                SHOWING <span className="text-slate-900 dark:text-white">124 Invoices</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE RANGE</label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                <select className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  <option>Last 30 Days</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PARTY SEARCH / GSTIN</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Type party name or GSTIN..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BRANCH</label>
              <div className="relative group">
                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  <option>All Branches</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">INVOICE TYPE</label>
              <div className="relative group">
                <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  <option>Tax Invoice</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Table Section */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Inv No.</th>
                    <th className="px-6 py-5">Party Name</th>
                    <th className="px-6 py-5">GSTIN</th>
                    <th className="px-6 py-5 text-right bg-slate-50/50 dark:bg-slate-800/50">Taxable Val</th>
                    <th className="px-6 py-5 text-right">CGST</th>
                    <th className="px-6 py-5 text-right">SGST</th>
                    <th className="px-6 py-5 text-right">IGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {salesData.map((invoice, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{invoice.date}</td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-amber-600 hover:underline cursor-pointer">{invoice.invNo}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">{invoice.partyName}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-400 tracking-tight">{invoice.gstin}</td>
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right bg-slate-50/30 dark:bg-slate-800/30">
                        {invoice.taxableVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-400 text-right">
                        {invoice.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-400 text-right">
                        {invoice.sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-slate-400 text-right">
                        {invoice.igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sidebar Section */}
            <div className="w-96 space-y-8">
              {/* Sales Insights */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
                  <TrendingUp size={18} className="text-amber-500" />
                  Sales Insights
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">MONTHLY SALES TREND</p>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <Bar dataKey="value" fill="#FDE68A" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">GST BREAKUP DISTRIBUTION</p>
                    <div className="relative h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-slate-900 dark:text-white">74% IGST</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {pieData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.name === 'IGST' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">₹ {item.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Audit Notice</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Next GST reconciliation is due in <span className="font-bold text-slate-900 dark:text-white">4 days</span>. Download the GSTR-1 draft now.
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:gap-3 transition-all">
                  RECONCILE DATA <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary Bar */}
      <div className="bg-amber-400 dark:bg-amber-500 p-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex gap-12">
            <SummaryItem label="TOTAL TAXABLE" value="₹ 4,90,700.00" />
            <SummaryItem label="TOTAL CGST" value="₹ 11,268.00" />
            <SummaryItem label="TOTAL SGST" value="₹ 11,268.00" />
            <SummaryItem label="TOTAL IGST" value="₹ 65,790.00" />
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">GRAND TOTAL VALUE</p>
              <p className="text-4xl font-black text-amber-900">₹ 5,79,026.40</p>
            </div>
            <button className="w-10 h-10 bg-amber-900/10 rounded-xl flex items-center justify-center text-amber-900 hover:bg-amber-900/20 transition-all">
              <ChevronUp size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-amber-900">{value}</p>
  </div>
);

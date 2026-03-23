import React from 'react';
import { 
  FileSpreadsheet, 
  FileDown, 
  ChevronDown, 
  Calendar, 
  Info, 
  Building2, 
  Layers, 
  Calculator,
  Landmark
} from 'lucide-react';
import { motion } from 'motion/react';

interface ValuationItem {
  sku: string;
  name: string;
  brand: string;
  category: string;
  qty: number;
  unit: string;
  rate: number;
  total: number;
}

interface ValuationGroup {
  category: string;
  items: ValuationItem[];
  subtotal: number;
}

const reportData: ValuationGroup[] = [
  {
    category: 'ELECTRONICS',
    subtotal: 157038.00,
    items: [
      { sku: 'SKU-29012', name: 'ThinkPad X1 Carbon Gen 10', brand: 'LENOVO', category: 'Laptops', qty: 45, unit: 'PCS', rate: 1250.00, total: 56250.00 },
      { sku: 'SKU-29455', name: 'Dell UltraSharp 27" 4K', brand: 'DELL', category: 'Monitors', qty: 120, unit: 'PCS', rate: 540.00, total: 64800.00 },
      { sku: 'SKU-30112', name: 'MacBook Pro 14" M2 Max', brand: 'APPLE', category: 'Laptops', qty: 12, unit: 'PCS', rate: 2999.00, total: 35988.00 },
    ]
  },
  {
    category: 'OFFICE FURNITURE',
    subtotal: 57100.00,
    items: [
      { sku: 'SKU-88221', name: 'Herman Miller Aeron Chair', brand: 'H. MILLER', category: 'Chairs', qty: 28, unit: 'PCS', rate: 1450.00, total: 40600.00 },
      { sku: 'SKU-88902', name: 'Steelcase Gesture', brand: 'STEELCASE', category: 'Chairs', qty: 15, unit: 'PCS', rate: 1100.00, total: 16500.00 },
    ]
  }
];

export const StockValuationReport: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Stock Valuation Analysis Report</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Real-time inventory costing and financial valuation summary.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                Export to Excel
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                <FileDown size={18} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <FilterSelect label="STOCK PLACE" value="All Warehouses" icon={<Building2 size={16} />} />
            <FilterSelect label="VALUATION METHOD" value="FIFO (First-In, First-Out)" icon={<Calculator size={16} />} />
            <FilterSelect label="CATEGORY" value="Electronics" icon={<Layers size={16} />} />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE AS OF</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="10/25/2023"
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
            </div>
            <button className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              Apply Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Table Section */}
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5">Item Code</th>
                    <th className="px-8 py-5">Item Name</th>
                    <th className="px-8 py-5">Brand</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5 text-right">Closing Qty</th>
                    <th className="px-8 py-5">Unit</th>
                    <th className="px-8 py-5 text-right">Val. Rate</th>
                    <th className="px-8 py-5 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {reportData.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                        <td colSpan={8} className="px-8 py-4 text-xs font-black text-blue-600 dark:text-blue-400 tracking-widest">
                          {group.category}
                        </td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-4 text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors">{item.sku}</td>
                          <td className="px-8 py-4 text-sm font-bold text-slate-900 dark:text-white">{item.name}</td>
                          <td className="px-8 py-4">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.brand}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-sm text-slate-500">{item.category}</td>
                          <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-white text-right">{item.qty}</td>
                          <td className="px-8 py-4 text-xs font-bold text-slate-400">{item.unit}</td>
                          <td className="px-8 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 text-right">${item.rate.toLocaleString()}</td>
                          <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-white text-right">${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <td colSpan={7} className="px-8 py-4 text-xs font-black text-slate-400 text-right italic uppercase tracking-widest">
                          {group.category.toLowerCase()} Sub-total
                        </td>
                        <td className="px-8 py-4 text-sm font-black text-slate-900 dark:text-white text-right">
                          ${group.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sidebar Section */}
            <div className="w-96 space-y-8">
              {/* Valuation Breakdown */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8">Valuation Breakdown</h3>
                
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-100 dark:text-slate-800 stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                    <circle 
                      className="text-blue-600 stroke-current" 
                      strokeWidth="10" 
                      strokeDasharray={251.2} 
                      strokeDashoffset={251.2 - (251.2 * 64) / 100} 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="40" 
                      cx="50" 
                      cy="50" 
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">64%</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Top Brand</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <BreakdownItem label="Lenovo" value="42.5%" color="bg-blue-600" />
                  <BreakdownItem label="Dell" value="21.5%" color="bg-blue-400" />
                  <BreakdownItem label="Others" value="36.0%" color="bg-slate-200" />
                </div>
              </div>

              {/* Methodology Note */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={18} className="text-blue-600" />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Methodology Note</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Valuation is calculated using the <span className="font-bold text-slate-700 dark:text-slate-300">FIFO</span> method. Costs are assigned based on the chronological sequence of purchase orders. Real-time exchange rates are applied for international procurement.
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
            <div>
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">Total Unique Items</p>
              <p className="text-2xl font-black text-amber-900">1,248 SKUs</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">Total Stock Quantity</p>
              <p className="text-2xl font-black text-amber-900">14,209 Units</p>
            </div>
          </div>
          
          <div className="bg-amber-500/30 dark:bg-amber-600/30 rounded-2xl p-4 flex items-center gap-8 border border-amber-600/20 shadow-inner">
            <div className="text-right">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">Grand Total Stock Value</p>
              <p className="text-4xl font-black text-amber-900">$2,459,102.45</p>
            </div>
            <div className="w-16 h-16 bg-amber-900/10 rounded-xl flex items-center justify-center">
              <Landmark size={32} className="text-amber-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
        {icon}
      </div>
      <select className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
        <option>{value}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" size={16} />
    </div>
  </div>
);

const BreakdownItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
    </div>
    <span className="text-xs font-black text-slate-900 dark:text-white">{value}</span>
  </div>
);

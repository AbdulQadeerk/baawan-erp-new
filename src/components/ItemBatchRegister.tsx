import React from 'react';
import { 
  Search, 
  LayoutGrid, 
  ChevronDown, 
  FileDown, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  XCircle,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

interface BatchRow {
  date: string;
  voucherType: string;
  docNo: string;
  itemCode: string;
  itemName: string;
  batchNo: string;
  mfgDate: string;
  expDate: string;
  inwardQty: number;
  outwardQty: number;
  balance: number;
  isExpired?: boolean;
}

const batchData: BatchRow[] = [
  { 
    date: '2023-10-24', 
    voucherType: 'Purchase Invoice', 
    docNo: 'PI-2023-0041', 
    itemCode: 'ITM-SAM-S23', 
    itemName: 'Galaxy S23 Ultra Phantom', 
    batchNo: 'BT-00921-X', 
    mfgDate: '2023-08-15', 
    expDate: '2025-08-14', 
    inwardQty: 500.00, 
    outwardQty: 0.00, 
    balance: 500.00 
  },
  { 
    date: '2023-10-25', 
    voucherType: 'Sales Delivery', 
    docNo: 'SD-2023-912', 
    itemCode: 'ITM-SAM-S23', 
    itemName: 'Galaxy S23 Ultra Phantom', 
    batchNo: 'BT-00921-X', 
    mfgDate: '2023-08-15', 
    expDate: '2025-08-14', 
    inwardQty: 0.00, 
    outwardQty: 120.00, 
    balance: 380.00 
  },
  { 
    date: '2023-10-26', 
    voucherType: 'Stock Transfer', 
    docNo: 'TRF-00122', 
    itemCode: 'ITM-LOG-MX3', 
    itemName: 'MX Master 3S Mouse', 
    batchNo: 'BT-00445-Z', 
    mfgDate: '2023-01-10', 
    expDate: '2023-12-30', 
    inwardQty: 15.00, 
    outwardQty: 0.00, 
    balance: 395.00,
    isExpired: true
  },
  { 
    date: '2023-10-27', 
    voucherType: 'Sales Delivery', 
    docNo: 'SD-2023-915', 
    itemCode: 'ITM-SAM-S23', 
    itemName: 'Galaxy S23 Ultra Phantom', 
    batchNo: 'BT-00921-X', 
    mfgDate: '2023-08-15', 
    expDate: '2025-08-14', 
    inwardQty: 0.00, 
    outwardQty: 80.00, 
    balance: 315.00 
  },
];

export const ItemBatchRegister: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Item Batch Register Report</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Detailed audit trail of stock movements categorized by batch and lot numbers for precise inventory tracking.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <FileDown size={18} className="text-slate-600" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all">
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ITEM NAME/CODE</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search item..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BATCH / LOT NO</label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Enter batch no..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BRAND</label>
                <div className="relative group">
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                    <option>All Brands</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CATEGORY</label>
                <div className="relative group">
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                    <option>All Categories</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">STOCK PLACE</label>
                <div className="relative group">
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                    <option>Main Warehouse</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6">
              <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Clear Filters</button>
              <button className="flex items-center gap-2 px-8 py-3 bg-amber-400 text-amber-950 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm hover:bg-amber-500 transition-all">
                <Search size={18} />
                Generate Report
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Voucher Type</th>
                    <th className="px-6 py-5">Doc No</th>
                    <th className="px-6 py-5">Item Code</th>
                    <th className="px-6 py-5">Item Name</th>
                    <th className="px-6 py-5">Batch/Lot No</th>
                    <th className="px-6 py-5">Mfg. Date</th>
                    <th className="px-6 py-5">Exp. Date</th>
                    <th className="px-6 py-5 text-right">Inward Qty</th>
                    <th className="px-6 py-5 text-right">Outward Qty</th>
                    <th className="px-6 py-5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {batchData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">{row.date}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">{row.voucherType}</td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">{row.docNo}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-400 tracking-tight uppercase">{row.itemCode}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">{row.itemName}</td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-[10px] font-bold text-amber-700 dark:text-amber-400 rounded border border-amber-100 dark:border-amber-900/30 uppercase tracking-tight">
                          {row.batchNo}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">{row.mfgDate}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${row.isExpired ? 'text-rose-600' : 'text-slate-500'}`}>
                            {row.expDate}
                          </span>
                          {row.isExpired && <AlertCircle size={14} className="text-rose-600" />}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">{row.inwardQty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-sm font-black text-rose-600 text-right">{row.outwardQty > 0 ? row.outwardQty.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</td>
                      <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">{row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Bar */}
            <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 p-6 flex items-center justify-end gap-12">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL INWARD</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">515.00</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL OUTWARD</p>
                <p className="text-2xl font-black text-rose-600">200.00</p>
              </div>
              <div className="bg-amber-400 dark:bg-amber-500 p-4 rounded-2xl min-w-[200px] text-right shadow-lg">
                <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">CLOSING BALANCE</p>
                <p className="text-3xl font-black text-amber-900">315.00</p>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium">Showing <span className="font-bold text-slate-600 dark:text-slate-300">4</span> of <span className="font-bold text-slate-600 dark:text-slate-300">128</span> entries</p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><ChevronLeft size={20} /></button>
              <button className="w-10 h-10 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm">1</button>
              <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">2</button>
              <button className="w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all">3</button>
              <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

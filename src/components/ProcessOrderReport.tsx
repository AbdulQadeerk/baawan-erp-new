import React, { useState } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  FileDown, 
  Plus, 
  Calendar, 
  ChevronDown, 
  X, 
  Check, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  Hash,
  MapPin,
  Download,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProcessOrder {
  id: string;
  srNo: string;
  date: string;
  billNo: string;
  partyName: string;
  gstStatus?: string;
  referenceNo: string;
  poNo: string;
  taxableValue: number;
  grandTotal: number;
}

const mockOrders: ProcessOrder[] = [
  { id: '1', srNo: '01', date: '12 Oct 2023', billNo: 'PRC-2023-0891', partyName: 'Apex Manufacturing Solutions', gstStatus: '(Gst not updated)', referenceNo: 'REF/772/01', poNo: 'PO-120034', taxableValue: 124500.00, grandTotal: 146910.00 },
  { id: '2', srNo: '02', date: '12 Oct 2023', billNo: 'PRC-2023-0892', partyName: 'Dynamic Logistics Pvt Ltd', referenceNo: 'REF/112/AB', poNo: 'PO-120045', taxableValue: 85200.00, grandTotal: 100536.00 },
  { id: '3', srNo: '03', date: '11 Oct 2023', billNo: 'PRC-2023-0888', partyName: 'Global Traders Inc.', gstStatus: '(Gst not updated)', referenceNo: 'REF/009/XC', poNo: 'PO-120012', taxableValue: 242000.00, grandTotal: 285560.00 },
  { id: '4', srNo: '04', date: '10 Oct 2023', billNo: 'PRC-2023-0885', partyName: 'Silverstone Textiles Ltd', referenceNo: 'REF/551/YY', poNo: 'PO-120009', taxableValue: 45900.00, grandTotal: 54162.00 },
  { id: '5', srNo: '05', date: '10 Oct 2023', billNo: 'PRC-2023-0881', partyName: 'Zion Exports & Cargo', referenceNo: 'REF/441/ZZ', poNo: 'PO-119992', taxableValue: 112000.00, grandTotal: 132160.00 },
];

export const ProcessOrderReport: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['1', '2', '4']);

  const toggleSelectAll = () => {
    if (selectedIds.length === mockOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mockOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          
          {/* Breadcrumbs & Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Reports</span>
                <ChevronRight size={10} />
                <span>Process Management</span>
                <ChevronRight size={10} />
                <span className="text-slate-900 dark:text-white">Process Order Report</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Process Order Report</h1>
              <p className="text-sm text-slate-500 font-medium">Real-time overview of manufacturing and process orders across all stock locations.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                <FileDown size={16} />
                PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 hover:bg-amber-500 transition-all">
                <Plus size={18} />
                New Order
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">BILL NO</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search bill..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PARTY NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search party..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">STOCK PLACE</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  <option>All Locations</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE RANGE</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  defaultValue="01/10/2023 - 31/10/2023"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2">
                <Check size={18} />
                Apply
              </button>
              <button className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-400 text-amber-950 rounded-xl flex items-center justify-center">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm">{selectedIds.length} Orders Selected</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Bulk actions available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                    <Download size={16} />
                    Export Selected Orders
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-amber-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition-all">
                    <Settings size={16} />
                    Process Selected Orders
                  </button>
                  <button 
                    onClick={() => setSelectedIds([])}
                    className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5 w-12">
                    <button 
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedIds.length === mockOrders.length 
                          ? 'bg-amber-400 border-amber-400 text-amber-950' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {selectedIds.length === mockOrders.length && <Check size={12} strokeWidth={4} />}
                    </button>
                  </th>
                  <th className="px-4 py-5">SR NO.</th>
                  <th className="px-4 py-5">DATE</th>
                  <th className="px-4 py-5">BILL NO</th>
                  <th className="px-4 py-5">PARTY NAME</th>
                  <th className="px-4 py-5">REFERENCE NO</th>
                  <th className="px-4 py-5">P.O. NO</th>
                  <th className="px-4 py-5 text-right">TAXABLE VALUE</th>
                  <th className="px-4 py-5 text-right">GRAND TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {mockOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${
                      selectedIds.includes(order.id) ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => toggleSelect(order.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedIds.includes(order.id) 
                            ? 'bg-amber-400 border-amber-400 text-amber-950' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {selectedIds.includes(order.id) && <Check size={12} strokeWidth={4} />}
                      </button>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{order.srNo}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{order.date}</td>
                    <td className="px-4 py-5">
                      <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">{order.billNo}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{order.partyName}</span>
                        {order.gstStatus && (
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">{order.gstStatus}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{order.referenceNo}</td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-500">{order.poNo}</td>
                    <td className="px-4 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">₹ {order.taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-5 text-sm font-black text-slate-900 dark:text-white text-right">₹ {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium">Showing <span className="font-bold text-slate-600 dark:text-slate-300">1 to 5</span> of <span className="font-bold text-slate-600 dark:text-slate-300">128</span> orders</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
              <button className="w-10 h-10 bg-amber-400 text-amber-950 rounded-xl text-sm font-bold shadow-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">3</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex h-20">
        <div className="flex-1 bg-amber-400 dark:bg-amber-500 px-8 flex items-center gap-16">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL ROWS</p>
            <p className="text-2xl font-black text-amber-900">128</p>
          </div>
          <div className="w-px h-10 bg-amber-900/10" />
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL TAXABLE VALUE</p>
            <p className="text-2xl font-black text-amber-900">₹ 1,42,34,500.00</p>
          </div>
        </div>
        <div className="w-80 bg-slate-900 px-8 flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">OVERALL GRAND TOTAL</p>
          <p className="text-2xl font-black text-white">₹ 1,67,96,710.00</p>
        </div>
      </div>
    </div>
  );
};

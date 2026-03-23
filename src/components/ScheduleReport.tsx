import React, { useState } from 'react';
import { 
  Search, 
  FileDown,
  FileText, 
  Plus, 
  Calendar, 
  ChevronDown, 
  Eye, 
  Printer, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  Pencil,
  CheckCircle2,
  Info,
  MapPin,
  Phone,
  Mail,
  RefreshCcw,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleOrder {
  id: string;
  date: string;
  docNo: string;
  partyName: string;
  refNo: string;
  docType: 'Standard SO' | 'Service SO' | 'Urgent SO';
  taxableValue: number;
  grandTotal: number;
}

const mockOrders: ScheduleOrder[] = [
  { id: '1', date: '12 Oct 2023', docNo: 'SO-23-4412', partyName: 'Hinduja Global Solutions Ltd.', refNo: 'PO-REF-9981', docType: 'Standard SO', taxableValue: 124500.00, grandTotal: 146910.00 },
  { id: '2', date: '14 Oct 2023', docNo: 'SO-23-4415', partyName: 'Reliance Industries (West)', refNo: 'RIW-S-0021', docType: 'Standard SO', taxableValue: 890000.00, grandTotal: 1050200.00 },
  { id: '3', date: '15 Oct 2023', docNo: 'SO-23-4418', partyName: 'Global Tech Infotech', refNo: 'REF-772-GT', docType: 'Service SO', taxableValue: 45200.00, grandTotal: 53336.00 },
  { id: '4', date: '16 Oct 2023', docNo: 'SO-23-4422', partyName: 'Mahindra Logistics Group', refNo: 'MLG/Oct/122', docType: 'Standard SO', taxableValue: 233000.00, grandTotal: 274940.00 },
  { id: '5', date: '18 Oct 2023', docNo: 'SO-23-4425', partyName: 'TATA Steel Plant #2', refNo: 'TSP2-990-23', docType: 'Urgent SO', taxableValue: 512000.00, grandTotal: 604160.00 },
];

export const ScheduleReport: React.FC<{ onConvertToInvoice?: () => void }> = ({ onConvertToInvoice }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ScheduleOrder | null>(null);

  const openPreview = (order: ScheduleOrder) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
          
          {/* Breadcrumbs & Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <nav className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span>Home</span>
                <ChevronRight size={10} />
                <span>Sales Reports</span>
                <ChevronRight size={10} />
                <span className="text-slate-900 dark:text-white">Schedule Report</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Schedule Report</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Pending Sales Orders - Real-time tracking of unfulfilled orders</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                <FileDown size={16} />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                <Plus size={18} />
                Create Order
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEARCH DOC NO</label>
                <div className="relative">
                  <FileDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="e.g. SO-2023-001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEARCH PARTY</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Customer or Company name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE FROM</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="mm/dd/yyyy"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE TO</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="mm/dd/yyyy"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity">
                <Filter size={14} />
                Advanced Filters
              </button>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-400 font-bold italic">Showing results for: <span className="text-slate-600 dark:text-slate-300">Current Fiscal Year</span></span>
                <button className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-5">DATE</th>
                  <th className="px-6 py-5">DOC NO</th>
                  <th className="px-6 py-5">PARTY NAME</th>
                  <th className="px-6 py-5">REF NO</th>
                  <th className="px-6 py-5">DOC TYPE</th>
                  <th className="px-6 py-5 text-right">TAXABLE VALUE</th>
                  <th className="px-6 py-5 text-right">GRAND TOTAL</th>
                  <th className="px-6 py-5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">{order.date}</td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => openPreview(order)}
                        className="text-sm font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        {order.docNo}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white">{order.partyName}</td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">{order.refNo}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.docType === 'Urgent SO' 
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                          : order.docType === 'Service SO'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {order.docType}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900 dark:text-white text-right">₹ {order.taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-right">₹ {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={onConvertToInvoice}
                          className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors"
                          title="Convert to Invoice"
                        >
                          <FileText size={18} />
                        </button>
                        <button onClick={() => openPreview(order)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Eye size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Printer size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400 font-medium">Showing <span className="font-bold text-slate-600 dark:text-slate-300">1 - 5</span> of <span className="font-bold text-slate-600 dark:text-slate-300">124</span> results</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 dark:border-slate-800 rounded-xl"><ChevronLeft size={20} /></button>
              <button className="w-10 h-10 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-sm">1</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-800">2</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-800">3</button>
              <span className="text-slate-400 px-2">...</span>
              <button className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200 dark:border-slate-800">25</button>
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 dark:border-slate-800 rounded-xl"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-4">
        <div className="bg-amber-400 dark:bg-amber-500 rounded-3xl flex items-stretch overflow-hidden shadow-xl">
          <div className="flex-1 p-6 flex items-center gap-16">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL ROWS</p>
              <p className="text-2xl font-black text-amber-900">124 Orders</p>
            </div>
            <div className="w-px h-10 bg-amber-900/10" />
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-1">TOTAL TAXABLE VALUE</p>
              <p className="text-2xl font-black text-amber-900">₹ 1,81,04,700.00</p>
            </div>
          </div>
          <div className="bg-rose-600 px-12 flex items-center justify-between gap-12">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-rose-100/60 uppercase tracking-widest mb-1">OVERALL GRAND TOTAL</p>
              <p className="text-3xl font-black text-white">₹ 2,13,63,546.00</p>
            </div>
            <button className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40">
        <MessageSquare size={28} fill="currentColor" />
      </button>

      {/* Schedule Details Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
                    <FileDown size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Schedule Details</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PREVIEW MODE • DRAFT SO-2023-0891</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Pencil size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Printer size={20} /></button>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                  <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={24} /></button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LEDGER NAME</label>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Acme Corp Industrial Solutions Ltd.</p>
                      <p className="text-xs text-slate-500 font-medium">Industrial Area Phase-II, North Zone</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BRANCH</label>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <MapPin size={14} className="text-blue-600" />
                        Main Warehouse - North
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CONTACT</label>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Phone size={14} className="text-slate-400" />
                          +1 555-0123-99
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Mail size={14} className="text-slate-400" />
                          accounts@acmecorp.com
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOC NO</label>
                      <div>
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-black rounded-lg uppercase tracking-widest">
                          SO-2023-0891
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DATE</label>
                      <p className="text-sm font-black text-slate-900 dark:text-white">October 25, 2023</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P.O. NO</label>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">PO-88291-X-2023</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TERMS</label>
                      <p className="text-sm font-black text-slate-900 dark:text-white">Net 30 Days - Post Delivery</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NARRATION</label>
                      <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                        Priority shipping requested for item line 2. Special handling for fragile components included in rate.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={16} />
                      Inventory Reserved
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4 w-16">#</th>
                        <th className="px-6 py-4">Particular / Item Description</th>
                        <th className="px-6 py-4 text-right">Qty</th>
                        <th className="px-6 py-4">Unit</th>
                        <th className="px-6 py-4 text-right">Rate</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      <tr className="text-sm">
                        <td className="px-6 py-4 text-slate-400 font-bold">01</td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">High-Performance Servo Motor (XP-200)</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">15.00</td>
                        <td className="px-6 py-4 font-bold text-slate-500">PCS</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">1,250.00</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">18,750.00</td>
                      </tr>
                      <tr className="text-sm">
                        <td className="px-6 py-4 text-slate-400 font-bold">02</td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Industrial Grade Coupling (Titanium Finish)</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">8.00</td>
                        <td className="px-6 py-4 font-bold text-slate-500">NOS</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">450.00</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">3,600.00</td>
                      </tr>
                      <tr className="text-sm">
                        <td className="px-6 py-4 text-slate-400 font-bold">03</td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Wiring Harness Assembly - Type B (Custom)</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">25.00</td>
                        <td className="px-6 py-4 font-bold text-slate-500">SET</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">120.00</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">3,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Info & Totals */}
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex-1 flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <Info size={18} className="text-slate-400 mt-0.5" />
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      This is a generated preview of the sales order schedule. Prices are inclusive of base shipping costs unless otherwise specified in terms. Signature of authorization required for final processing.
                    </p>
                  </div>
                  <div className="w-full md:w-96 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-8 space-y-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                      <span>Net Subtotal</span>
                      <span className="text-slate-900 dark:text-white">25,350.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                      <span>Tax (VAT 18%)</span>
                      <span className="text-slate-900 dark:text-white">4,563.00</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                      <span>Freight Charges</span>
                      <span className="text-slate-900 dark:text-white">150.00</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-end">
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">GRAND TOTAL</span>
                        <span className="text-4xl font-black text-blue-600">$29,913.00</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">USD CURRENCY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-8 py-3 text-sm font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  <CheckCircle2 size={18} />
                  Approve Schedule
                </button>
                <button 
                  onClick={() => {
                    setIsPreviewOpen(false);
                    onConvertToInvoice?.();
                  }}
                  className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  <FileText size={18} />
                  Convert to Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Calendar, 
  Search, 
  List, 
  Paperclip, 
  ChevronDown, 
  Wallet, 
  AlertTriangle, 
  ExternalLink,
  CheckCircle2,
  Trash2,
  Plus,
  Info,
  History,
  CloudUpload,
  ChevronRight,
  Printer,
  LogIn
} from 'lucide-react';
import { motion } from 'motion/react';
import { BillWiseAdjustmentModal } from './BillWiseAdjustmentModal';

interface PaymentVoucherCreateProps {
  onBack?: () => void;
}

export const PaymentVoucherCreate: React.FC<PaymentVoucherCreateProps> = ({ onBack }) => {
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8"
    >
      <BillWiseAdjustmentModal 
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        partyName="Acme Industrial Supplies Ltd."
        receiptAmount={1250}
      />

      {/* Breadcrumbs & Header */}
      <div className="space-y-1">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2">
          <span className="hover:text-emerald-600 cursor-pointer">Accounting</span>
          <ChevronRight size={12} />
          <span className="text-slate-900 dark:text-white">Create Payment Voucher</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">New Payment Voucher</h1>
            <p className="text-sm text-slate-500 mt-1">Manage outgoing payments to vendors and business expenses.</p>
          </div>
          <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95">
            <History size={18} />
            Recent Vouchers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Header Information Card */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Info size={14} />
            Voucher Header Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Document No</label>
              <div className="relative">
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 font-mono focus:ring-0 outline-none" 
                  readOnly 
                  type="text" 
                  value="PV-2023-00452"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Save size={16} />
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Payment Date</label>
              <div className="relative">
                <input 
                  className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" 
                  type="date" 
                  defaultValue="2023-11-24"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Warehouse / Stock Place</label>
              <select className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium appearance-none cursor-pointer">
                <option>Main Warehouse (Central)</option>
                <option>North Distribution Hub</option>
                <option>East Retail Store</option>
              </select>
            </div>
          </div>
        </section>

        {/* Quick Entry Row */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Plus size={14} />
            Add Entry Item
          </h3>
          <div className="flex flex-col lg:flex-row items-end gap-4">
            <div className="w-full lg:w-24 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
              <select className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer">
                <option value="Dr">Dr</option>
                <option value="Cr">Cr</option>
              </select>
            </div>
            <div className="w-full lg:flex-1 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Payment To / Ledger (Search Vendors/Expenses)</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium" 
                  placeholder="Start typing vendor or ledger name..." 
                  type="text"
                />
              </div>
            </div>
            <div className="w-full lg:w-48 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                <input 
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-mono text-right" 
                  placeholder="0.00" 
                  type="number"
                />
              </div>
            </div>
            <button className="w-full lg:w-auto h-[42px] px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md active:scale-95">
              <Plus size={18} />
              Add Item
            </button>
          </div>
        </section>

        {/* Data Table Card */}
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ledger Account Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Debit ($)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Credit ($)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-6 py-4 font-bold text-rose-600">Dr</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">Acme Industrial Supplies Ltd.</div>
                    <div className="text-[10px] text-slate-400">Vendor - ACME-402</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">1,250.00</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">0.00</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-rose-600 transition-all active:scale-90">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-blue-600">Cr</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">Standard Chartered Bank</div>
                    <div className="text-[10px] text-slate-400">Bank Account - *8829</div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">0.00</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">1,250.00</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-rose-600 transition-all active:scale-90">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Summary Bar */}
          <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Entry Balance Status</p>
                <p className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Perfectly Balanced
                </p>
              </div>
            </div>
            <div className="flex gap-12">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Debit</p>
                <p className="text-2xl font-mono font-bold">$1,250.00</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Credit</p>
                <p className="text-2xl font-mono font-bold">$1,250.00</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Narration Box */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <List size={16} />
              Transaction Narration
            </h3>
            <textarea 
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium resize-none placeholder:text-slate-300" 
              placeholder="Enter detailed description of the payment here..." 
              rows={4}
            ></textarea>
          </div>
          {/* Document Upload */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <CloudUpload size={16} />
              Payment Proof & Attachments
            </h3>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 group hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer">
              <CloudUpload size={40} className="text-slate-300 group-hover:text-emerald-500 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag & drop bank receipts or invoice copies</p>
              <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        </section>

        {/* Final Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 pb-12">
          <button className="w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 order-2 sm:order-1 shadow-md active:scale-95">
            <RefreshCw size={18} />
            Clear Form
          </button>
          <button className="w-full sm:w-auto px-12 py-4 bg-emerald-500 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 order-1 sm:order-2 active:scale-95">
            <Printer size={24} />
            Save & Print Voucher
          </button>
        </div>
      </div>

      {/* Floating Help Button */}
      <button className="fixed bottom-6 right-6 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-800 transition-all group z-50">
        <span className="text-xl font-bold">?</span>
        <span className="absolute right-14 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Need Help?</span>
      </button>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { 
  Search, 
  RefreshCcw, 
  Download, 
  Printer, 
  Plus, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Truck,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice } from '../types';
import { DateRangePicker } from './DateRangePicker';
import { VoucherActionMenu } from './VoucherActionMenu';
import { VoucherDependencyModal } from './VoucherDependencyModal';

interface PurchaseInvoiceListProps {
  onCreateInvoice: () => void;
}

export const PurchaseInvoiceList: React.FC<PurchaseInvoiceListProps> = ({ onCreateInvoice }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [fromDate, setFromDate] = useState('01/02/2026');
  const [toDate, setToDate] = useState('18/02/2026');
  
  // Dependency Modal State
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{ id: string; no: string } | null>(null);

  const openDependency = (id: string, no: string) => {
    setSelectedVoucher({ id, no });
    setIsDependencyModalOpen(true);
  };

  const invoices: Invoice[] = [
    { id: '1', docNo: 'PUR-0001/25-26', date: '17/02/2026', time: '03:04 PM', partyName: 'Global Supplies Ltd.', refNo: 'SUP-INV-998', taxableValue: 125000, grandTotal: 147500, status: 'completed' },
    { id: '2', docNo: 'PUR-0002/25-26', date: '16/02/2026', time: '11:06 AM', partyName: 'Tech Components Inc', refNo: 'TC-445', taxableValue: 45000, grandTotal: 53100, status: 'pending' },
    { id: '3', docNo: 'PUR-0003/25-26', date: '13/02/2026', time: '11:00 AM', partyName: 'Solar Manufacturing Co.', refNo: 'SMC-2026-01', taxableValue: 850000, grandTotal: 1003000, status: 'completed' },
    { id: '4', docNo: 'PUR-0004/25-26', date: '11/02/2026', time: '12:37 PM', partyName: 'Logistics Partners', refNo: 'LP-667', taxableValue: 12000, grandTotal: 14160, status: 'completed' },
    { id: '5', docNo: 'PUR-0005/25-26', date: '05/02/2026', time: '03:28 PM', partyName: 'Raw Materials Corp', refNo: 'RM-INV-105', taxableValue: 500000, grandTotal: 590000, status: 'completed' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Purchase Invoice</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track your purchase bills and vendor outstandings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
            <Download size={20} />
          </button>
          <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
            <Printer size={20} />
          </button>
          <button 
            onClick={onCreateInvoice}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold shadow-md shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
          >
            <Plus size={18} />
            Create Purchase Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Doc No</label>
            <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all px-3 py-2 outline-none" placeholder="Enter doc no" type="text"/>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Search Vendor</label>
            <div className="relative">
              <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary pl-10 pr-3 py-2 text-sm transition-all outline-none" placeholder="Start typing vendor name..." type="text"/>
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">From Date</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all px-3 py-2 outline-none cursor-pointer" 
              type="text" 
              readOnly
              value={fromDate}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">To Date</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all px-3 py-2 outline-none cursor-pointer" 
              type="text" 
              readOnly
              value={toDate}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-1">
              <Filter size={18} /> Filter
            </button>
            <button className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isDatePickerOpen && (
            <DateRangePicker 
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onApply={(from, to) => {
                setFromDate(from);
                setToDate(to);
                setIsDatePickerOpen(false);
              }}
              initialFrom={fromDate}
              initialTo={toDate}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-auto custom-scrollbar flex-grow">
          <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 w-12 text-center">#</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 w-44">Date & Time</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Doc No</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Vendor Name</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Supplier Ref</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Taxable Value</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Grand Total</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {invoices.map((invoice, idx) => (
                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{invoice.date}</div>
                    <div className="text-xs text-slate-400">{invoice.time}</div>
                  </td>
                  <td className="p-4 font-medium text-primary">{invoice.docNo}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{invoice.partyName}</span>
                      {invoice.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{invoice.refNo}</td>
                  <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-300">₹{invoice.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-white">₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <Printer size={18} />
                      </button>
                      <VoucherActionMenu 
                        onViewDependency={() => openDependency(invoice.id, invoice.docNo)}
                        onCancel={() => alert(`Cancelling ${invoice.docNo}`)}
                        onCorrect={() => alert(`Correcting ${invoice.docNo}`)}
                        onExport={() => alert(`Exporting ${invoice.docNo}`)}
                        onEwayBill={() => alert(`Generating E-way bill for ${invoice.docNo}`)}
                        onSMS={() => alert(`Sending SMS for ${invoice.docNo}`)}
                        onWhatsApp={() => alert(`Sending WhatsApp for ${invoice.docNo}`)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-primary/10 dark:bg-primary/20 border-t border-primary/20 dark:border-primary/30 p-4">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-800 dark:text-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Total Records:</span>
              <span className="text-lg font-bold">{invoices.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-8 justify-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-tighter">Total Taxable Value</span>
                <span className="text-xl font-bold text-primary">₹15,32,000.00</span>
              </div>
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-tighter">Grand Total</span>
                <span className="text-xl font-bold text-primary">₹18,07,760.00</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Filtered Rows:</span>
              <span className="text-lg font-bold">{invoices.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing 1 to {invoices.length} of {invoices.length} entries</p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 bg-primary text-white rounded-lg text-sm font-bold">1</button>
          </div>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-400">Powered by baawan.com ERP System v2.4.0</p>
      </footer>

      <AnimatePresence>
        {isDependencyModalOpen && selectedVoucher && (
          <VoucherDependencyModal 
            isOpen={isDependencyModalOpen}
            onClose={() => setIsDependencyModalOpen(false)}
            voucherId={selectedVoucher.id}
            voucherNo={selectedVoucher.no}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

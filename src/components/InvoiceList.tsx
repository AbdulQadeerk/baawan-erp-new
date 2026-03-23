import React, { useState, useEffect } from 'react';
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
  Loader2,
  AlertCircle,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice } from '../types';
import { DateRangePicker } from './DateRangePicker';
import { invoiceService } from '../services/api';
import { VoucherActionMenu } from './VoucherActionMenu';
import { VoucherDependencyModal } from './VoucherDependencyModal';

interface InvoiceListProps {
  onCreateInvoice: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onCreateInvoice }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [fromDate, setFromDate] = useState('01/02/2026');
  const [toDate, setToDate] = useState('28/02/2026');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchDocNo, setSearchDocNo] = useState('');
  const [searchParty, setSearchParty] = useState('');
  
  // Dependency Modal State
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<{ id: string; no: string } | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openDependency = (id: string, no: string) => {
    setSelectedVoucher({ id, no });
    setIsDependencyModalOpen(true);
  };

  const formatDateForAPI = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        fromDate: formatDateForAPI(fromDate),
        toDate: formatDateForAPI(toDate),
        docNo: searchDocNo,
        partyName: searchParty,
        branchId: 0
      };
      const data = await invoiceService.search(params);
      
      // Map API response to our Invoice type
      const mappedInvoices: Invoice[] = (data || []).map((inv: any) => ({
        id: inv.id?.toString() || Math.random().toString(),
        docNo: inv.bill_No || inv.docNo || 'N/A',
        date: inv.date ? new Date(inv.date).toLocaleDateString('en-GB') : 'N/A',
        time: inv.date ? new Date(inv.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        partyName: inv.partyName || inv.ledgerName || 'N/A',
        refNo: inv.refNo || '-',
        taxableValue: inv.item_SubTotal || 0,
        grandTotal: inv.grandTotal || 0,
        status: inv.billStatus === 0 ? 'completed' : 'pending'
      }));
      
      setInvoices(mappedInvoices);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalTaxableValue = invoices.reduce((sum, inv) => sum + inv.taxableValue, 0);
  const totalGrandTotal = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Sales Invoice</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track your sales billings and customer outstandings</p>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg font-semibold shadow-md shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Doc No</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand-red focus:border-brand-red text-sm transition-all px-3 py-2 outline-none" 
              placeholder="Enter doc no" 
              type="text"
              value={searchDocNo}
              onChange={(e) => setSearchDocNo(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Search Party</label>
            <div className="relative">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand-red focus:border-brand-red pl-10 pr-3 py-2 text-sm transition-all outline-none" 
                placeholder="Start typing party name..." 
                type="text"
                value={searchParty}
                onChange={(e) => setSearchParty(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">From Date</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand-red focus:border-brand-red text-sm transition-all px-3 py-2 outline-none cursor-pointer" 
              type="text" 
              readOnly
              value={fromDate}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">To Date</label>
            <input 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand-red focus:border-brand-red text-sm transition-all px-3 py-2 outline-none cursor-pointer" 
              type="text" 
              readOnly
              value={toDate}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button 
              onClick={fetchInvoices}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
              <Filter size={18} /> Filter
            </button>
            <button 
              onClick={fetchInvoices}
              className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
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
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Party Name</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Ref No</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Taxable Value</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Grand Total</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400 mb-2" size={32} />
                    <p className="text-slate-500">Fetching invoices...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
                    <p className="text-red-500">{error}</p>
                    <button onClick={fetchInvoices} className="mt-4 text-sm text-blue-600 font-bold hover:underline">Try Again</button>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                    No invoices found for the selected period.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">{invoice.date}</div>
                      <div className="text-xs text-slate-400">{invoice.time}</div>
                    </td>
                    <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{invoice.docNo}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{invoice.partyName}</span>
                        {invoice.status === 'gst-not-updated' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">Gst not updated</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{invoice.refNo}</td>
                    <td className="p-4 text-right font-medium text-slate-700 dark:text-slate-300">₹{invoice.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => window.dispatchEvent(new CustomEvent('open-invoice-preview'))}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-brand-amber/10 dark:bg-amber-900/20 border-t border-brand-amber/20 dark:border-amber-900/30 p-4">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-800 dark:text-amber-100">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Total Records:</span>
              <span className="text-lg font-bold">{invoices.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-8 justify-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-tighter">Total Taxable Value</span>
                <span className="text-xl font-bold text-brand-red">₹{totalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-tighter">Grand Total</span>
                <span className="text-xl font-bold text-brand-red">₹{totalGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
        <p className="text-sm text-slate-500">Showing 1 to 15 of 27 entries</p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 bg-brand-red text-white rounded-lg text-sm font-bold">1</button>
            <button className="w-10 h-10 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
          </div>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
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

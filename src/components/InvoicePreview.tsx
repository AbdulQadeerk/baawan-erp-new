import React from 'react';
import { 
  X, 
  Edit, 
  Printer, 
  Phone, 
  FileText, 
  Share2, 
  PackageSearch, 
  Clock,
  User,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] relative z-10"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center">
                  <FileText className="text-brand-red" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Sales Invoice</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">PREVIEW MODE</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium text-sm">
                  <Edit size={16} /> Edit
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-brand-emerald text-white rounded-lg hover:bg-emerald-600 transition-all font-medium text-sm">
                  <Printer size={16} /> Print
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-brand-red hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Customer Details</h3>
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white uppercase">custmert</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">test, KINNAUR</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Himachal Pradesh, 4666666</p>
                    <div className="flex items-center gap-2 mt-3 text-slate-600 dark:text-slate-300 text-sm">
                      <Phone size={14} className="text-blue-500" />
                      <span>+91 343 445 5555</span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                      GSTIN: NOT PROVIDED
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Document Details</h3>
                  <div className="space-y-2">
                    <DetailRow label="Doc No:" value="HO-0001/25-26" />
                    <DetailRow label="Date:" value="Feb 05, 2026" />
                    <DetailRow label="PO NO.:" value="N/A" italic />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Terms & Logistics</h3>
                  <div className="space-y-2">
                    <DetailRow label="Credit Days:" value="0 Days" />
                    <DetailRow label="Ref No:" value="--" italic />
                    <DetailRow label="Supply To:" value="Himachal Pradesh" />
                  </div>
                </div>
              </div>

              <div className="mx-8 mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Project Site</span>
                    <p className="text-sm text-slate-500 italic">Not Specified</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase">Project Site Address</span>
                    <p className="text-sm text-slate-500 italic">Not Specified</p>
                  </div>
                </div>
              </div>

              <div className="mx-8 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                      <th className="px-4 py-3 text-center w-12">#</th>
                      <th className="px-4 py-3">Particular / Item Name</th>
                      <th className="px-4 py-3">HSN</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-center">Unit</th>
                      <th className="px-4 py-3 text-right">Rate</th>
                      <th className="px-4 py-3 text-right">GST %</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4 text-center text-sm font-medium text-slate-400">1</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-white">ITM003 Keyboard</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">test description</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">455445</td>
                      <td className="px-4 py-4 text-sm text-right font-semibold text-slate-800 dark:text-white">1</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-amber/10 text-amber-700 dark:text-brand-amber border border-brand-amber/20 uppercase">Boxes</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-slate-600 dark:text-slate-300">₹46.82</td>
                      <td className="px-4 py-4 text-sm text-right font-medium text-slate-600 dark:text-slate-300">₹1.00 (0.47)</td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-slate-800 dark:text-white">₹46.82</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mx-8 mt-6 p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 flex flex-wrap gap-6 justify-between items-center">
                <StatItem label="Total Qty" value="01" italic />
                <StatItem label="Net Total" value="₹46.82" />
                <StatItem label="Total GST" value="₹0.47" />
                <StatItem label="Gross Total" value="₹47.29" />
              </div>

              <div className="mx-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-8">
                <div className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center gap-1.5 mb-2">
                      <StickyNote size={12} /> Invoice Notes
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">No notes provided for this invoice.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={<Share2 size={12} />} label="EXPORT" color="bg-brand-emerald" />
                    <ActionButton icon={<PackageSearch size={12} />} label="CHECK STOCK" color="bg-blue-500" />
                    <ActionButton icon={<Clock size={12} />} label="PENDING" color="bg-brand-amber" textDark />
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Sub Total:</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹46.82</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Tax Breakdown:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">GST (1%) - ₹0.47</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                    <span className="text-slate-500 dark:text-slate-400">Round Off:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">₹0.18</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Grand Total:</span>
                    <span className="text-2xl font-black text-brand-red">₹47.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-xs">AQ</div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prepared By</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Abdul Qadeer</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">baawan.com ERP System • Digital Invoice Generated On 05-02-2026</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Helpers
const DetailRow = ({ label, value, italic }: { label: string, value: string, italic?: boolean }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`font-semibold text-slate-800 dark:text-white ${italic ? 'text-slate-400 italic font-normal' : ''}`}>{value}</span>
  </div>
);

const StatItem = ({ label, value, italic }: { label: string, value: string, italic?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase font-bold text-blue-500/60">{label}</span>
    <span className={`text-lg font-black text-blue-500 ${italic ? 'italic' : ''}`}>{value}</span>
  </div>
);

const SummaryRow = ({ label, value, bold, border }: { label: string, value: string, bold?: boolean, border?: boolean }) => (
  <div className={`flex justify-between items-center text-sm ${border ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''}`}>
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className={`${bold ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{value}</span>
  </div>
);

const ActionButton = ({ icon, label, color, textDark }: { icon: React.ReactNode, label: string, color: string, textDark?: boolean }) => (
  <button className={`px-4 py-2 ${color} ${textDark ? 'text-slate-800' : 'text-white'} text-[10px] font-bold rounded-full hover:shadow-lg transition-all flex items-center gap-1.5 shadow-sm`}>
    {icon} {label}
  </button>
);

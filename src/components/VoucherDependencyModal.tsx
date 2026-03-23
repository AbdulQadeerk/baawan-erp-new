import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDown, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { invoiceService } from '../services/api';

interface DependencyItem {
  id: string;
  type: string;
  docNo: string;
  date: string;
  status: string;
  amount: number;
}

interface VoucherDependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: string;
  voucherNo: string;
}

export const VoucherDependencyModal: React.FC<VoucherDependencyModalProps> = ({ 
  isOpen, 
  onClose, 
  voucherId,
  voucherNo
}) => {
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && voucherId) {
      fetchDependencies();
    }
  }, [isOpen, voucherId]);

  const fetchDependencies = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceService.getVoucherDependency(voucherId);
      setDependencies(data);
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'enquiry': return <MessageSquare className="text-blue-500" size={20} />;
      case 'sales order': return <ShoppingCart className="text-orange-500" size={20} />;
      case 'proforma invoice': return <FileText className="text-purple-500" size={20} />;
      case 'sales invoice': return <Receipt className="text-green-500" size={20} />;
      case 'billing/payment': return <CheckCircle2 className="text-emerald-500" size={20} />;
      default: return <FileText className="text-slate-500" size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Voucher Dependency</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tracking lifecycle for <span className="font-bold text-blue-600">{voucherNo}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading dependency map...</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 ml-[-1px]"></div>

              <div className="space-y-12">
                {dependencies.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-6 group"
                  >
                    {/* Icon Circle */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 transition-all duration-300 ${
                      item.docNo === voucherNo 
                        ? 'border-blue-500 ring-4 ring-blue-500/10 scale-110' 
                        : 'border-slate-200 dark:border-slate-700 group-hover:border-slate-400'
                    }`}>
                      {getIcon(item.type)}
                    </div>

                    {/* Content Card */}
                    <div className={`flex-grow p-4 rounded-xl border transition-all duration-300 ${
                      item.docNo === voucherNo 
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.status === 'Converted' ? 'bg-blue-100 text-blue-600' :
                          item.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-bold ${item.docNo === voucherNo ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.docNo}
                        </h3>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <Clock size={14} />
                        <span>{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <ChevronRight size={14} className="mx-1" />
                        <button className="text-blue-600 hover:underline font-medium">View Details</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

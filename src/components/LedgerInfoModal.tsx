import React from 'react';
import { 
  X, 
  Edit3,
  MapPin,
  Building2,
  Phone,
  Mail,
  User,
  Gavel,
  CreditCard,
  History,
  Info,
  Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ledger } from '../types';

interface LedgerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: Ledger | null;
}

export const LedgerInfoModal: React.FC<LedgerInfoModalProps> = ({ isOpen, onClose, ledger }) => {
  if (!ledger) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Ledger Information</h1>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
              >
                <X size={20} className="text-slate-500 group-hover:text-red-500" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Ledger Name</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{ledger.name}</p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 shadow-sm">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Group</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{ledger.group || 'Sundry Debtors'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Parent Company</p>
                  <p className="text-lg font-black text-slate-800 dark:text-slate-100">{ledger.parentCompany || 'No'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Address */}
                <div className="space-y-8">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="text-blue-500" size={18} />
                      <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Address Details</h2>
                    </div>
                    <div className="space-y-5">
                      <InfoItem label="Full Address" value={ledger.address} />
                      <div className="grid grid-cols-2 gap-6">
                        <InfoItem label="Area" value={ledger.area} />
                        <InfoItem label="City" value={ledger.city} isUpper />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <InfoItem label="State" value={ledger.state || 'Himachal Pradesh'} />
                        <InfoItem label="Pincode" value={ledger.pincode || '4666666'} />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Middle Column: Bank & Contact */}
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Landmark className="text-emerald-500" size={18} />
                      <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Bank Details</h2>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Account Name</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{ledger.accountName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bank Name</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{ledger.bankName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">IFSC Code</span>
                        <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{ledger.ifscCode || '-'}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Account Number</span>
                        <span className="text-base font-black text-slate-800 dark:text-white tracking-[0.2em]">
                          {ledger.accountNumber ? `•••• •••• •••• ${ledger.accountNumber.slice(-4)}` : '•••• •••• •••• 0000'}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <User className="text-amber-500" size={18} />
                      <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Contact Info</h2>
                    </div>
                    <div className="space-y-4">
                      <ContactItem icon={<Phone size={14} />} label="Mobile" value={ledger.mobile} />
                      <ContactItem icon={<Mail size={14} />} label="Email" value={ledger.email || 'snehal.pawar2@propixtech.com'} />
                      <ContactItem icon={<User size={14} />} label="Sales Person" value={ledger.salesPerson || 'Not Assigned'} />
                    </div>
                  </section>
                </div>

                {/* Right Column: Statutory & Account */}
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <Gavel className="text-red-500" size={18} />
                      <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Statutory Info</h2>
                    </div>
                    <div className="space-y-3">
                      <StatRow label="PAN" value={ledger.pan || 'ABCDE1234F'} />
                      <StatRow label="GST Category" value={ledger.gstCategory || 'Registered'} />
                      <StatRow label="GSTIN" value={ledger.gstin || '-'} />
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="text-blue-600" size={18} />
                      <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Account Info</h2>
                    </div>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
                      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Opening Bal</span>
                        <span className="text-sm font-black text-slate-800 dark:text-white">
                          ₹ {(ledger.openingBal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
                          <span className="text-[10px] text-slate-400 font-normal ml-1">{ledger.openingBalType || 'Dr'}</span>
                        </span>
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Opening Date</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ledger.openingDate || '02/02/2026'}</span>
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white dark:bg-slate-900">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Credit Limit</span>
                        <span className="text-sm font-black text-red-600">₹ {(ledger.creditLimit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
              >
                Close
              </button>
              <button className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 active:scale-95">
                <Edit3 size={16} />
                Edit Ledger
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const InfoItem = ({ label, value, isUpper = false }: { label: string, value: string, isUpper?: boolean }) => (
  <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-2">
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${isUpper ? 'uppercase' : ''}`}>{value}</span>
  </div>
);

const ContactItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

const StatRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{value}</span>
  </div>
);

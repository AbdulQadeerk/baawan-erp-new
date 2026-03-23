import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Save, 
  Eraser,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Loader2,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ledgerService, groupService } from '../services/api';

interface AddLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddLedgerModal: React.FC<AddLedgerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    groupId: '',
    salesPerson: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    area: '',
    pinCode: '',
    mobile: '',
    email: '',
    gstin: '',
    pan: '',
    openingBalance: '0',
    balanceType: 'Dr'
  });

  useEffect(() => {
    if (isOpen) {
      const fetchGroups = async () => {
        try {
          const data = await groupService.list();
          setGroups(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching groups:', error);
        }
      };
      fetchGroups();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-derive PAN from GSTIN (chars 3 to 12)
    if (name === 'gstin' && value.length >= 12) {
      const derivedPan = value.substring(2, 12).toUpperCase();
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.toUpperCase(),
        pan: derivedPan
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
    "Lakshadweep", "Puducherry"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.state || !formData.city || !formData.mobile || !formData.groupId || !formData.gstin) {
      alert('Please fill in required fields: Name, Group, State, City, Mobile, and GSTIN');
      return;
    }

    if (formData.gstin.length !== 15) {
      alert('GSTIN must be exactly 15 characters long (e.g., 27ABCDE1234F1Z5)');
      return;
    }

    setLoading(true);
    setDebugInfo(null);
    try {
      const payload = {
        LedgerName: formData.name,
        GroupID: formData.groupId,
        Address: formData.address,
        City: formData.city,
        Area: formData.area,
        State: formData.state,
        Country: formData.country,
        PinCode: formData.pinCode,
        Mobile: formData.mobile,
        Email: formData.email,
        GSTIN: formData.gstin,
        PAN: formData.pan,
        OpeningBalance: parseFloat(formData.openingBalance) || 0,
        BalanceType: formData.balanceType
      };

      setDebugInfo({ status: 'Sending...', payload });
      const result = await ledgerService.create(payload) as any;
      setDebugInfo({ status: 'Success!', response: result.data, finalPayload: result.sentPayload });
      alert('Ledger created successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating ledger:', error);
      const errorMsg = error.message || 'Failed to create ledger.';
      setDebugInfo({ 
        status: 'Error', 
        error: errorMsg, 
        attemptedPayload: error.attemptedPayload,
        formData: formData,
        details: error.response?.data 
      });
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="bg-yellow-50/50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Add New Ledger</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                    placeholder="Enter ledger name" 
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Account Group <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      name="groupId"
                      value={formData.groupId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all appearance-none text-sm"
                    >
                      <option value="">Select Group</option>
                      {groups.map(g => (
                        <option key={g.id || g.groupId} value={g.id || g.groupId}>
                          {g.groupName || g.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm resize-none" 
                  placeholder="Enter complete billing address" 
                  rows={3}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed" 
                      readOnly 
                      type="text" 
                      value="India"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all appearance-none text-sm"
                    >
                      <option value="">Select State</option>
                      {indianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                      placeholder="Enter City" 
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Pin Code
                  </label>
                  <input 
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                    placeholder="400001" 
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                      placeholder="Locality / Landmark" 
                      type="text"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-700 pr-2">
                       <span className="text-xs font-bold text-slate-500">+91</span>
                    </div>
                    <input 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-16 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                      placeholder="98765 43210" 
                      type="tel"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                      placeholder="example@company.com" 
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    GSTIN <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm uppercase" 
                    placeholder="22AAAAA0000A1Z5" 
                    type="text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    PAN
                  </label>
                  <input 
                    name="pan"
                    value={formData.pan}
                    onChange={handleInputChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm uppercase" 
                    placeholder="ABCDE1234F" 
                    type="text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Opening Balance
                  </label>
                  <div className="flex gap-2">
                    <input 
                      name="openingBalance"
                      value={formData.openingBalance}
                      onChange={handleInputChange}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm" 
                      placeholder="0.00" 
                      type="number"
                      step="0.01"
                    />
                    <select
                      name="balanceType"
                      value={formData.balanceType}
                      onChange={handleInputChange}
                      className="w-24 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all text-sm"
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </div>
                </div>
                <div></div>
              </div>

              {debugInfo && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] overflow-auto max-h-48 border border-slate-700">
                  <h3 className="text-blue-400 mb-2 font-bold border-b border-slate-700 pb-1">DEBUG: API INTERACTION</h3>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 -mx-6 -mb-6">
                <button 
                  type="button"
                  onClick={() => setFormData({
                    name: '', groupId: '', salesPerson: '', address: '', country: 'India', state: '', city: '', area: '', pinCode: '', mobile: '', email: '', gstin: '', pan: '', openingBalance: '0', balanceType: 'Dr'
                  })}
                  className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm shadow-sm active:scale-95 gap-2"
                >
                  <Eraser size={18} />
                  Clear Form
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white border border-transparent rounded-xl font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all text-sm shadow-lg shadow-blue-600/20 active:scale-95 gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Insert Ledger
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

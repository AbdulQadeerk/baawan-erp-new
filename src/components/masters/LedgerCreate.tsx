import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Fingerprint, 
  MapPin, 
  Building2, 
  Users, 
  Gavel, 
  Wallet, 
  Plus, 
  Trash2, 
  UploadCloud,
  ChevronDown,
  Tag,
  Map,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ledgerService, groupService } from '../../services/api';

export const LedgerCreate: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    ledgerName: '',
    groupId: '',
    address: '',
    country: 'India',
    state: '',
    city: '',
    area: '',
    pinCode: '',
    mobile: '',
    email: '',
    gstIn: '',
    pan: '',
    openingBalance: '0.00',
    balanceType: 'Dr'
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await groupService.search({ isSync: false });
        setGroups(Array.isArray(res.list) ? res.list : []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };
    fetchGroups();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-derive PAN from GSTIN (chars 3 to 12)
    if (name === 'gstIn' && value.length >= 12) {
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

  const handleSubmit = async () => {
    if (!formData.ledgerName || !formData.groupId || !formData.state || !formData.city || !formData.mobile || !formData.gstIn) {
      alert('Please fill in required fields: Ledger Name, Group, State, City, Mobile, and GSTIN');
      return;
    }

    if (formData.gstIn.length !== 15) {
      alert('GSTIN must be exactly 15 characters long (e.g., 27ABCDE1234F1Z5)');
      return;
    }

    setLoading(true);
    setDebugInfo(null);
    try {
      // Map frontend fields to API expected fields (guessing based on common patterns)
      const payload = {
        LedgerName: formData.ledgerName,
        GroupID: formData.groupId,
        Address: formData.address,
        City: formData.city,
        Area: formData.area,
        State: formData.state,
        Country: formData.country,
        PinCode: formData.pinCode,
        Mobile: formData.mobile,
        Email: formData.email,
        GSTIN: formData.gstIn,
        PAN: formData.pan,
        OpeningBalance: parseFloat(formData.openingBalance),
        BalanceType: formData.balanceType
      };

      setDebugInfo({ status: 'Sending...', payload });
      const result = await ledgerService.create(payload) as any;
      setDebugInfo({ status: 'Success!', response: result.data, finalPayload: result.sentPayload });
      alert('Ledger created successfully!');
      // Reset form
      setFormData({
        ledgerName: '',
        groupId: '',
        address: '',
        country: 'India',
        state: '',
        city: '',
        area: '',
        pinCode: '',
        mobile: '',
        email: '',
        gstIn: '',
        pan: '',
        openingBalance: '0.00',
        balanceType: 'Dr'
      });
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-6 space-y-8 pb-32"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create New Ledger</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">Configure your accounts and master data</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Identity Section */}
          <FormSection icon={<Fingerprint className="text-blue-600" />} title="Identity & Categorization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput 
                label="Ledger Name" 
                name="ledgerName"
                value={formData.ledgerName}
                onChange={handleInputChange}
                placeholder="e.g. Hatimi Enterprises" 
                required 
              />
              <FormSelect 
                label="Group" 
                name="groupId"
                value={formData.groupId}
                onChange={handleInputChange}
                options={groups.length > 0 ? groups.map(g => ({ label: g.groupName || g.name, value: g.id || g.groupId })) : [
                  { label: 'Sundry Debtors', value: '1' },
                  { label: 'Sundry Creditors', value: '2' },
                  { label: 'Bank Accounts', value: '3' },
                  { label: 'Direct Expenses', value: '4' }
                ]} 
                required 
              />
            </div>
          </FormSection>

          {/* Address Section */}
          <FormSection icon={<MapPin className="text-rose-600" />} title="Address & Contact Info">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold p-5 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" 
                  placeholder="House/Flat No, Street, Landmark..." 
                  rows={4}
                ></textarea>
              </div>
              <div className="space-y-6">
                <FormSelect 
                  label="Country" 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  options={[{ label: 'India', value: 'India' }, { label: 'United States', value: 'United States' }, { label: 'UAE', value: 'UAE' }]} 
                  required 
                />
                <FormSelect 
                  label="State" 
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  options={indianStates.map(s => ({ label: s, value: s }))}
                  required
                />
              </div>
              <FormInput 
                label="City" 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City Name" 
                required
              />
              <FormInput 
                label="Area" 
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="Locality / Landmark" 
              />
              <FormInput 
                label="Pin Code" 
                name="pinCode"
                value={formData.pinCode}
                onChange={handleInputChange}
                placeholder="400001" 
              />
              <FormInput 
                label="Mobile" 
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="9876543210" 
                required
              />
              <FormInput 
                label="Email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@domain.com" 
                type="text" 
              />
            </div>
          </FormSection>

          {/* Statutory & Tax */}
          <FormSection icon={<Gavel className="text-amber-600" />} title="Statutory & Tax">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput 
                label="GSTIN" 
                name="gstIn"
                value={formData.gstIn}
                onChange={handleInputChange}
                placeholder="27XXXXX0000X1Z1" 
                required
              />
              <FormInput 
                label="PAN" 
                name="pan"
                value={formData.pan}
                onChange={handleInputChange}
                placeholder="ABCDE1234F" 
              />
            </div>
          </FormSection>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-8">
          <FormSection icon={<Wallet className="text-emerald-600" />} title="Credit & Balances">
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormInput 
                    label="Opening Bal." 
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleInputChange}
                    type="number" 
                    required 
                  />
                </div>
                <FormSelect 
                  label="Type" 
                  name="balanceType"
                  value={formData.balanceType}
                  onChange={handleInputChange}
                  options={[{ label: 'Dr', value: 'Dr' }, { label: 'Cr', value: 'Cr' }]} 
                />
              </div>
            </div>
          </FormSection>

          {debugInfo && (
            <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl font-mono text-xs overflow-auto max-h-96 border border-slate-700">
              <h3 className="text-blue-400 mb-4 font-bold border-b border-slate-700 pb-2">DEBUG: API INTERACTION</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-8">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-3 px-16 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-slate-800/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
            INSERT LEDGER
          </button>
          <button 
            onClick={() => setFormData({
              ledgerName: '',
              groupId: '',
              address: '',
              country: 'India',
              state: '',
              city: '',
              area: '',
              pinCode: '',
              mobile: '',
              email: '',
              gstIn: '',
              pan: '',
              openingBalance: '0.00',
              balanceType: 'Dr'
            })}
            className="flex items-center gap-3 px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            <RefreshCw size={20} /> CLEAR FORM
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FormSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-3 mb-8 text-slate-800 dark:text-white">
      {icon}
      <h2 className="text-sm font-black uppercase tracking-[0.2em]">{title}</h2>
    </div>
    {children}
  </section>
);

const FormInput = ({ label, name, placeholder, type = "text", value, onChange, required = false, bg = "bg-slate-50 dark:bg-slate-800" }: { label: string, name: string, placeholder?: string, type?: string, value?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, bg?: string }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full ${bg} border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all`} 
      placeholder={placeholder} 
      type={type}
    />
  </div>
);

const FormSelect = ({ label, name, options, value, onChange, required = false, bg = "bg-slate-50 dark:bg-slate-800" }: { label: string, name: string, options: { label: string, value: string }[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, required?: boolean, bg?: string }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${bg} border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 outline-none transition-all appearance-none cursor-pointer`}
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);

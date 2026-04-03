import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  UserPlus, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  MapPin, 
  Shield,
  CheckCircle2,
  Loader2,
  Building2,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { userApi, type UserRecord } from '../../services/user.service';
import { commonApi } from '../../services/common.service';
import { toast } from '../../lib/toast';

interface UserCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: UserRecord, isUpdate: boolean) => void;
}

export const UserCreate: React.FC<UserCreateProps> = ({ onBack, editId, onSaved }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  
  const [roles, setRoles] = useState<{ id: number, name: string, isSelected?: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UserRecord>({
    first_Name: '',
    lastname: '',
    designation: '',
    login_Name: '',
    password: '',
    emailPwd: '',
    email_ID: '',
    mobileNo: '',
    address: '',
    isLedger: false,
    isEmployee: false,
    isBlocked: false,
    isDeleted: false,
    description: '',
    roles: []
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, [editId]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Load Roles
      const rolesData = await commonApi.getDropdown({ table: 8 });
      let loadedRoles = Array.isArray(rolesData) ? rolesData.map((r: any) => ({ ...r, isSelected: false })) : [];

      if (editId) {
        const userData = await userApi.getById(editId);
        setFormData({
          id: userData.id,
          first_Name: userData.first_Name || '',
          lastname: userData.lastname || '',
          designation: userData.designation || '',
          login_Name: userData.login_Name || '',
          password: userData.password || '',
          emailPwd: userData.emailPwd || '',
          email_ID: userData.email_ID || '',
          mobileNo: userData.mobileNo || '',
          address: userData.address || '',
          isLedger: userData.isLedger || false,
          isEmployee: userData.isEmployee || false,
          isBlocked: userData.isBlocked || false,
          isDeleted: userData.isDeleted || false,
          description: userData.description || '',
          roles: userData.roles || []
        });

        // Set Password Confirm to match (assuming backend hashes, but handling as legacy)
        setConfirmPassword(userData.password || '');

        // Pre-select loaded roles
        if (userData.roles && userData.roles.length > 0) {
          loadedRoles = loadedRoles.map((r: any) => ({
            ...r,
            isSelected: userData.roles?.some(ur => ur.role_id === r.id)
          }));
        }
      }
      
      setRoles(loadedRoles);
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load user form initialization.');
      }
      onBack?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, isSelected: !r.isSelected } : r));
  };

  const validate = (): string | null => {
    if (!formData.first_Name?.trim()) return 'First Name is required.';
    if (!formData.lastname?.trim()) return 'Last Name is required.';
    if (!formData.login_Name?.trim()) return 'Login Name is required.';
    if (!formData.designation?.trim()) return 'Designation is required.';

    if (formData.password) {
      if (formData.password !== confirmPassword) {
        return 'Passwords do not match.';
      }
    }

    if (formData.email_ID && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email_ID)) {
      return 'Invalid email address format.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.info(errorMsg, 'Validation Request');
      return;
    }

    setIsSaving(true);
    try {
      const selectedRoles = roles.filter(r => r.isSelected).map(r => ({ role_id: r.id }));
      const payload: UserRecord = {
        ...formData,
        roles: selectedRoles
      };

      if (editId) {
        await userApi.update(payload);
        toast.success(`User '${payload.login_Name}' updated successfully.`);
        onSaved?.(payload, true);
      } else {
        const newId = await userApi.create(payload);
        toast.success(`User '${payload.login_Name}' created successfully.`);
        onSaved?.({ ...payload, id: newId }, false);
      }
      onBack?.();
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.message || 'Failed to save user context.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setFormData({
      first_Name: '',
      lastname: '',
      designation: '',
      login_Name: '',
      password: '',
      emailPwd: '',
      email_ID: '',
      mobileNo: '',
      address: '',
      isLedger: false,
      isEmployee: false,
      isBlocked: false,
      isDeleted: false,
      description: '',
      roles: []
    });
    setConfirmPassword('');
    setRoles(prev => prev.map(r => ({ ...r, isSelected: false })));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 opacity-50">
        <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Retrieving Information...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {editId ? `Edit User: ${formData.login_Name}` : 'Create New User'}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider opacity-60">
              Manage authentication and privileges.
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 px-8 py-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-sm font-black mb-8 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 uppercase tracking-widest text-slate-800 dark:text-slate-200">
              <Users size={18} className="text-indigo-500" /> Identity Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name <span className="text-rose-500">*</span></label>
                <input 
                  autoFocus
                  value={formData.first_Name}
                  onChange={(e) => setFormData({ ...formData, first_Name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" 
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Name <span className="text-rose-500">*</span></label>
                <input 
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" 
                  placeholder="Last name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Designation <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all cursor-pointer"
                >
                  <option value="">Select Designation...</option>
                  <option value="Administration">Administration</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Sales">Sales</option>
                  <option value="Operator">Operator</option>
                  <option value="Manager">Manager</option>
                  <option value="System">System Layer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Login Name <span className="text-rose-500">*</span></label>
                <input 
                  value={formData.login_Name}
                  onChange={(e) => setFormData({ ...formData, login_Name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all text-indigo-600 dark:text-indigo-400" 
                  placeholder="Choose login name"
                />
              </div>

              {/* Passwords */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{editId ? 'New Password' : 'Password'}</label>
                <div className="relative group">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all pr-12" 
                    placeholder="********"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{editId ? 'Confirm New Password' : 'Confirm Password'}</label>
                <div className="relative group">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all pr-12" 
                    placeholder="********"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 outline-none">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Contacts */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Id</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    value={formData.email_ID}
                    onChange={(e) => setFormData({ ...formData, email_ID: e.target.value })}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" 
                    placeholder="example@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Application Password</label>
                <div className="relative group">
                  <input 
                    type={showEmailPassword ? "text" : "password"}
                    value={formData.emailPwd}
                    onChange={(e) => setFormData({ ...formData, emailPwd: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all pr-12" 
                    placeholder="App password..."
                  />
                  <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 outline-none">
                    {showEmailPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Mobile Number</label>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      value={formData.mobileNo}
                      onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all" 
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Address Notes</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all resize-none" 
                    placeholder="Full residential or office address"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.isLedger}
                  onChange={(e) => setFormData({ ...formData, isLedger: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Is Ledger</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.isEmployee}
                  onChange={(e) => setFormData({ ...formData, isEmployee: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Is Employee</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.isBlocked}
                  onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-rose-300 text-rose-600 focus:ring-rose-500" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-rose-600">Blocked</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.isDeleted}
                  onChange={(e) => setFormData({ ...formData, isDeleted: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-rose-300 text-rose-600 focus:ring-rose-500" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-rose-600">Delete Mark</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 px-8 py-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col" style={{ maxHeight: '600px' }}>
            <h2 className="text-sm font-black mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between uppercase tracking-widest text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-indigo-500" /> User Roles
              </div>
              <span className="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest">
                {roles.filter(r => r.isSelected).length} Attached
              </span>
            </h2>
            
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {roles.length === 0 ? (
                <div className="text-center py-10 opacity-50 text-slate-500 font-bold text-xs uppercase tracking-widest">
                  No roles accessible
                </div>
              ) : (
                roles.map(role => (
                  <label key={role.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={role.isSelected}
                        onChange={() => handleRoleToggle(role.id)}
                        className="peer w-6 h-6 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500 transition-all appearance-none checked:bg-indigo-600 checked:border-indigo-600" 
                      />
                      <CheckCircle2 className="absolute text-white pt-px pl-px opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{role.name}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {editId ? 'Apply Update' : 'Initialize User'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { Building2, Save, ArrowLeft, Loader2, MapPin, Phone, Mail, FileText, User } from 'lucide-react';
import { motion } from 'motion/react';
import { projectSiteApi, type ProjectSiteRecord } from '../../../services/project-site.service';
import { toast } from '../../../lib/toast';

interface ProjectSiteCreateProps {
  onBack?: () => void;
  editId?: number | null;
  onSaved?: (record: ProjectSiteRecord, isUpdate: boolean) => void;
}

export const ProjectSiteCreate: React.FC<ProjectSiteCreateProps> = ({ onBack, editId, onSaved }) => {
  const [formData, setFormData] = useState<ProjectSiteRecord>({
    id: 0,
    name: '',
    address: '',
    shipAddress: '',
    area: '',
    country: 'India',
    state: '',
    city: '',
    pinCode: '',
    phone_1: '',
    phone_2: '',
    mobile: '',
    email: '',
    contact_Person: '',
    gstNo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      loadRecord(editId);
    }
  }, [editId]);

  const loadRecord = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await projectSiteApi.getById(id);
      setFormData({
        id: data.id,
        name: data.name || '',
        address: data.address || '',
        shipAddress: data.shipAddress || '',
        area: data.area || '',
        country: data.country || '',
        state: data.state || '',
        city: data.city || '',
        pinCode: data.pinCode || '',
        phone_1: data.phone_1 || '',
        phone_2: data.phone_2 || '',
        mobile: data.mobile || '',
        email: data.email || '',
        contact_Person: data.contact_Person || '',
        gstNo: data.gstNo || ''
      });
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.error('Failed to load project site details.');
      }
      onBack?.();
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!formData.name?.trim()) return 'Name is required.';
    const nameRegex = /^[a-zA-Z0-9\s.\-]+$/;
    if (!nameRegex.test(formData.name)) return 'Name can only contain alphanumeric characters, spaces, dots, and hyphens.';
    
    if (!formData.area?.trim()) return 'Area is required.';
    if (!formData.country?.trim()) return 'Country is required.';
    if (!formData.state?.trim()) return 'State is required.';
    if (!formData.city?.trim()) return 'City is required.';

    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      return 'Invalid email address format.';
    }

    if (formData.gstNo) {
      // Basic GST validation logic check (length + alphanumeric)
      const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      const trnPattern = /^[0-9]{15}$/;
      const val = formData.gstNo.trim().toUpperCase();
      if (!gstPattern.test(val) && !trnPattern.test(val)) {
        return 'Invalid Tax Registration Number (GST/TRN format incorrect).';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) {
      toast.info(errorMsg, 'Validation Error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        gstNo: formData.gstNo ? formData.gstNo.toUpperCase() : ''
      };

      if (editId) {
        await projectSiteApi.update(payload);
        toast.success('Project Site updated successfully.', 'Success');
        onSaved?.(payload, true);
      } else {
        const newId = await projectSiteApi.create(payload);
        const newRecord = { ...payload, id: newId };
        toast.success('Project Site created successfully.', 'Success');
        onSaved?.(newRecord, false);
      }
      onBack?.();
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.message || 'Save failed.', 'Error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 opacity-50">
        <Loader2 size={32} className="animate-spin text-indigo-600 mb-4" />
        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Configuration...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {editId ? 'Edit Project Site' : 'Create Project Site'}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider opacity-60">
              Manage operational sites and construction projects.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
              <Building2 size={18} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">Site Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Project Site Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g. Downtown Highrise Complex"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Tax Registration (GST/TRN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <FileText size={16} />
                  </span>
                  <input
                    type="text"
                    value={formData.gstNo}
                    onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                    placeholder="Tax Reg Number..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm uppercase focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Contact Person
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={formData.contact_Person}
                    onChange={(e) => setFormData({ ...formData, contact_Person: e.target.value })}
                    placeholder="Manager Name..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
              <MapPin size={18} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">Geographical Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Billing Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none resize-none"
                  placeholder="Street address..."
                />
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Shipping Address
                </label>
                <textarea
                  value={formData.shipAddress}
                  onChange={(e) => setFormData({ ...formData, shipAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none resize-none"
                  placeholder="Shipping site address..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Area <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                  placeholder="Local district or area..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Pin Code / Zip
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                  placeholder="Postcode"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
              <Phone size={18} className="text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-widest">Communications</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mobile</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone 1</label>
                <input
                  type="text"
                  value={formData.phone_1}
                  onChange={(e) => setFormData({ ...formData, phone_1: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phone 2</label>
                <input
                  type="text"
                  value={formData.phone_2}
                  onChange={(e) => setFormData({ ...formData, phone_2: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:border-amber-500 outline-none"
                    placeholder="site@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/20"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'Saving Route...' : (editId ? 'Update Record' : 'Create Record')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

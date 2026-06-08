import React, { useState } from 'react';
import { Palette, Upload, Image as ImageIcon, CheckCircle2, Loader2, Save } from 'lucide-react';
import { toast } from '../../../../lib/toast';
import { settingsApi } from '../../../../services/settings.service';

export const AppearanceTab: React.FC = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'logo') setLogoPreview(e.target?.result as string);
      else setStampPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', type);
      
      // We will try to upload, if API requires different format, this is a starting point
      await settingsApi.uploadCompanyDocument(formData);
      toast.success(`${type === 'logo' ? 'Company Logo' : 'Company Stamp'} uploaded successfully.`);
    } catch (err) {
      toast.info('The upload API endpoint might need adjustments, but preview is updated.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Palette size={20} className="text-purple-500" />
            Appearance & Branding
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your brand identity and theme</p>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Logo Upload */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-purple-500" /> Company Logo
              </h4>
              <p className="text-xs text-slate-500 mb-6">This logo will appear on all your invoices, reports, and dashboards. Recommended size: 512x512px.</p>
              
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 relative hover:border-purple-500 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Company Logo" className="h-32 object-contain" />
                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload logo</span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stamp Upload */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-500" /> Company Stamp / Seal
              </h4>
              <p className="text-xs text-slate-500 mb-6">Upload a digital stamp or authorized signature to be automatically appended to printed documents.</p>
              
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-900 relative hover:border-indigo-500 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'stamp')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {stampPreview ? (
                  <div className="relative">
                    <img src={stampPreview} alt="Company Stamp" className="h-32 object-contain" />
                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload stamp</span>
                    <span className="text-xs text-slate-400 mt-1">PNG (transparent) up to 2MB</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Theme Setup */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
             <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Palette size={16} className="text-rose-500" /> Color Theme Options
             </h4>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {['Slate', 'Indigo', 'Emerald', 'Rose'].map(theme => (
                 <div key={theme} className="flex flex-col items-center p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl cursor-pointer transition-colors group">
                   <div className="w-12 h-12 rounded-full mb-3 shadow-md" style={{
                     background: theme === 'Slate' ? '#475569' : theme === 'Indigo' ? '#4f46e5' : theme === 'Emerald' ? '#10b981' : '#e11d48'
                   }} />
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{theme}</span>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
      
      {isUploading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-200 dark:border-slate-700">
            <Loader2 className="animate-spin text-indigo-600" size={24} />
            <span className="font-bold text-slate-700 dark:text-slate-300">Uploading Image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

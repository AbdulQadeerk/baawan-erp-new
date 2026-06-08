import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit3, Trash2, Loader2, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { toast } from '../../../../lib/toast';
import { announcementApi, Announcement } from '../../../../services/announcement.service';

export const AnnouncementsTab: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [formData, setFormData] = useState<Announcement>({
    announcement: '',
    fromDate: '',
    toDate: '',
    createdDate: new Date().toISOString(),
    companyId: 1
  });

  useEffect(() => {
    if (view === 'list') {
      fetchAnnouncements();
    }
  }, [view]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await announcementApi.list();
      setAnnouncements(data || []);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      announcement: '',
      fromDate: '',
      toDate: '',
      createdDate: new Date().toISOString(),
      companyId: 1
    });
    setView('form');
  };

  const handleEdit = (ann: Announcement) => {
    setFormData({
      ...ann,
      fromDate: ann.fromDate ? ann.fromDate.split('T')[0] : '',
      toDate: ann.toDate ? ann.toDate.split('T')[0] : ''
    });
    setView('form');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await announcementApi.delete(deleteTarget);
      toast.success('Announcement deleted');
      setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget));
    } catch (err) {
      toast.error('Failed to delete announcement');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async () => {
    if (!formData.announcement.trim()) {
      toast.error('Announcement text is required');
      return;
    }
    
    setIsSaving(true);
    try {
      if (formData.id) {
        await announcementApi.update(formData);
        toast.success('Announcement updated');
      } else {
        await announcementApi.create(formData);
        toast.success('Announcement created');
      }
      setView('list');
    } catch (err) {
      toast.error('Failed to save announcement');
    } finally {
      setIsSaving(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('list')}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {formData.id ? 'Edit Announcement' : 'New Announcement'}
              </h3>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Announcement
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message <span className="text-red-500">*</span></label>
              <textarea 
                value={formData.announcement}
                onChange={e => setFormData({...formData, announcement: e.target.value})}
                rows={4}
                placeholder="Enter announcement text..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valid From</label>
                <input 
                  type="date" 
                  value={formData.fromDate}
                  onChange={e => setFormData({...formData, fromDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valid Until</label>
                <input 
                  type="date" 
                  value={formData.toDate}
                  onChange={e => setFormData({...formData, toDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-8rem)] relative">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Megaphone size={20} className="text-amber-500" />
            Announcements
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage company-wide announcements</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <Plus size={16} />
          Add Announcement
        </button>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No announcements</h3>
            <p className="text-slate-500 text-sm mt-1">Create your first announcement to show on dashboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex items-start justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{ann.announcement}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 flex gap-4">
                    {ann.fromDate && <span>From: {ann.fromDate.split('T')[0]}</span>}
                    {ann.toDate && <span>To: {ann.toDate.split('T')[0]}</span>}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(ann)} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(ann.id!)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Delete Announcement</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this announcement?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-rose-600/20">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

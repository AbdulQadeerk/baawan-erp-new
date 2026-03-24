import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  ChevronDown,
  Loader2,
  Save,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  groupApi,
  type GroupDropdownItem,
  type GroupCreatePayload,
  type GroupRecord,
} from '../../../services/group.service';
import { toast } from '../../../lib/toast';

interface GroupCreateProps {
  /** If provided, we are editing an existing group */
  editId?: number | null;
  onBack?: () => void;
  /** Called after successful create/update — returns the saved record so the list can update without a re-fetch */
  onSaved?: (record: GroupRecord, isUpdate: boolean) => void;
}

// ─── Validation regex (letters, spaces, dots, hyphens) ──────────────────────
const NAME_PATTERN = /^[a-zA-Z\s.\-]+$/;

interface FormErrors {
  name?: string;
  parentId?: string;
}

export const GroupCreate: React.FC<GroupCreateProps> = ({ editId, onBack, onSaved }) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [groupList, setGroupList] = useState<GroupDropdownItem[]>([]);
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Original values for "clear" when editing
  const [originalData, setOriginalData] = useState<{ name: string; parentId: string } | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editId;

  // ─── Load dropdown & edit data on mount ─────────────────────────────────────
  useEffect(() => {
    loadParentGroups();
    if (editId) {
      loadEditData(editId);
    }
  }, [editId]);

  // Focus name field on create mode after mount
  useEffect(() => {
    if (!isEditMode && nameRef.current) {
      nameRef.current.focus();
    }
  }, [isEditMode]);

  // ─── API Calls ──────────────────────────────────────────────────────────────
  async function loadParentGroups() {
    try {
      const data = await groupApi.getParentGroupsDropdown();
      setGroupList(data ?? []);
    } catch (err: any) {
      // Silently handled by interceptor
    }
  }

  async function loadEditData(id: number) {
    setIsDataLoading(true);
    try {
      const data = await groupApi.getById(id);
      if (data) {
        setName(data.name || '');
        setParentId(data.parentId ? String(data.parentId) : '');
        setOriginalData({
          name: data.name || '',
          parentId: data.parentId ? String(data.parentId) : '',
        });
      }
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info('Failed to load group data.', 'Info');
      }
    } finally {
      setIsDataLoading(false);
    }
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!name.trim()) {
      errs.name = 'This value is required.';
    } else if (!NAME_PATTERN.test(name.trim())) {
      errs.name = 'Name can only contain letters, spaces, dots, and hyphens.';
    }

    if (!parentId) {
      errs.parentId = 'This value is required.';
    }

    return errs;
  }

  // ─── Submit Handler ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    setIsBtnLoading(true);

    const payload: GroupCreatePayload = {
      name: name.trim(),
      parentId: parentId ? parseInt(parentId, 10) : null,
    };

    try {
      // Resolve parent info from dropdown for immediate list update
      const parentItem = groupList.find(x => String(x.id) === parentId);

      if (isEditMode && editId) {
        // Update
        payload.id = editId;
        await groupApi.update(payload);
        toast.success('Record updated successfully.', 'Info');

        const updatedRecord: GroupRecord = {
          id: editId,
          name: name.trim(),
          parentId: parentId ? parseInt(parentId, 10) : null,
          parent: parentItem?.name ?? '',
          nature: parentItem?.field3 ?? '',
          isCr: parentItem?.field2 === 'true' || (parentItem?.field2 as any) === true,
        };
        onSaved?.(updatedRecord, true);
      } else {
        // Create
        const newId = await groupApi.create(payload);
        toast.success('Record created successfully.', 'Info');

        const newRecord: GroupRecord = {
          id: typeof newId === 'number' ? newId : 0,
          name: name.trim(),
          parentId: parentId ? parseInt(parentId, 10) : null,
          parent: parentItem?.name ?? '',
          nature: parentItem?.field3 ?? '',
          isCr: parentItem?.field2 === 'true' || (parentItem?.field2 as any) === true,
          modifiedDate: new Date().toISOString(),
        };
        onSaved?.(newRecord, false);
      }

      onBack?.();
    } catch (err: any) {
      if (!err?._processedByInterceptor) {
        toast.info(err?.error || err?.message || 'Operation failed.', 'Info');
      }
    } finally {
      setIsBtnLoading(false);
    }
  }

  // ─── Clear Handler ──────────────────────────────────────────────────────────
  function handleClear() {
    const yes = window.confirm('Are you sure you want to clear the form?');
    if (!yes) return;

    if (originalData) {
      // In edit mode, reset to original values
      setName(originalData.name);
      setParentId(originalData.parentId);
    } else {
      setName('');
      setParentId('');
    }
    setSubmitted(false);
    setErrors({});
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-6 py-10"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {isEditMode ? 'Edit Group' : 'Create New Group'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider opacity-60">
            {isEditMode
              ? 'Update the group details below.'
              : 'Add a new financial or organizational group to your master list.'}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        {isDataLoading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off" onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]"
                    htmlFor="group-name"
                  >
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none ${
                      submitted && errors.name
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    id="group-name"
                    placeholder="Enter group name"
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (submitted) {
                        // Live validation
                        const newErrors = { ...errors };
                        if (!e.target.value.trim()) {
                          newErrors.name = 'This value is required.';
                        } else if (!NAME_PATTERN.test(e.target.value.trim())) {
                          newErrors.name = 'Name can only contain letters, spaces, dots, and hyphens.';
                        } else {
                          delete newErrors.name;
                        }
                        setErrors(newErrors);
                      }
                    }}
                  />
                  {submitted && errors.name && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Parent Group Dropdown */}
                <div className="space-y-2">
                  <label
                    className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]"
                    htmlFor="parent-select"
                  >
                    Parent Group <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={parentId}
                      onChange={e => {
                        setParentId(e.target.value);
                        if (submitted) {
                          const newErrors = { ...errors };
                          if (!e.target.value) {
                            newErrors.parentId = 'This value is required.';
                          } else {
                            delete newErrors.parentId;
                          }
                          setErrors(newErrors);
                        }
                      }}
                      className={`w-full bg-slate-50 dark:bg-slate-900/50 border rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none outline-none cursor-pointer ${
                        submitted && errors.parentId
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      id="parent-select"
                    >
                      <option value="">--Select Parent--</option>
                      {groupList.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                  {submitted && errors.parentId && (
                    <p className="text-xs font-bold text-red-500 mt-1">{errors.parentId}</p>
                  )}
                </div>
              </div>

              <div className="my-12 border-t border-slate-100 dark:border-slate-700/50"></div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  type="submit"
                  disabled={isBtnLoading}
                  className="w-full sm:w-52 flex items-center justify-center gap-3 bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-800/20 disabled:opacity-60"
                >
                  {isBtnLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isEditMode ? <Save size={20} /> : <Upload size={20} />}
                      {isEditMode ? 'Update' : 'Insert'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full sm:w-52 flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                >
                  <RefreshCw size={20} /> Clear Form
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-900/50 px-10 py-5 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 gap-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={14} className="text-blue-500" />
                Fields marked with <span className="text-red-500">*</span> are mandatory.
              </div>
              <div className="flex items-center gap-6 opacity-60">
                <span>Last modified: {new Date().toLocaleDateString('en-GB')}</span>
                <span>Version 2.4.1</span>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          icon={<HelpCircle className="text-blue-600 dark:text-blue-400" />}
          title="What is a Parent Group?"
          desc="Hierarchical organization for better reporting and balance sheet management."
          color="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
        />
        <InfoCard
          icon={<Lightbulb className="text-amber-600 dark:text-amber-400" />}
          title="Pro Tip"
          desc="Use logical naming conventions to make searching faster for your accounting team."
          color="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
        />
        <InfoCard
          icon={<ShieldCheck className="text-emerald-600 dark:text-emerald-400" />}
          title="Audit Trail"
          desc="Every creation is logged with timestamps for compliance and security."
          color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
        />
      </div>
    </motion.div>
  );
};

const InfoCard = ({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) => (
  <div className={`${color} p-6 rounded-2xl border flex gap-4 shadow-sm`}>
    <div className="shrink-0">{icon}</div>
    <div>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
        {title}
      </h4>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
        {desc}
      </p>
    </div>
  </div>
);

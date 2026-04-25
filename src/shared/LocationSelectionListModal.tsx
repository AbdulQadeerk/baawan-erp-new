/**
 * LocationSelectionListModal — React equivalent of Angular's LocationSelectionListComponent
 * Angular: src/app/shared/location-selection-list/location-selection-list.component.ts
 */
import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocationSelectionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  cityList?: any[];
  stateList?: any[];
}

export const LocationSelectionListModal: React.FC<LocationSelectionListModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  cityList = [],
  stateList = [],
}) => {
  const [recordList, setRecordList] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const combined = cityList.map((city: any) => {
      const stateId = city.field1 || city.parent;
      const state = stateList.find((x: any) => x.id == stateId);
      return {
        city: { ...city, name: city.text || city.name },
        cityText: city.text || city.name,
        state: state || null,
        stateText: state ? state.name : '',
      };
    });

    setRecordList(combined);
  }, [isOpen, cityList, stateList]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> Select Location
            </h3>
            <button onClick={onClose} className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 rounded-lg transition-colors text-rose-600 dark:text-rose-400">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {recordList.length > 0 ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recordList.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => onSelect(item.city)}
                    className="px-6 py-3 hover:bg-blue-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col gap-0.5"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.cityText}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.stateText}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">No locations available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

import React from 'react';
import { X } from 'lucide-react';
import { Tab } from '../types';
import { motion } from 'motion/react';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSwitch: (id: string) => void;
  onTabClose: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabSwitch, onTabClose }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center overflow-x-auto no-scrollbar px-4 h-10 gap-1 sticky top-16 z-40 shadow-sm">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => onTabSwitch(tab.id)}
          className={`flex items-center gap-2 px-4 h-full border-t-2 transition-all cursor-pointer whitespace-nowrap text-[10px] font-black uppercase tracking-widest relative group ${
            activeTabId === tab.id
              ? 'bg-slate-50 dark:bg-slate-800 border-brand-red text-brand-red'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <span>{tab.title}</span>
          {tab.closable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={10} />
            </button>
          )}
          {activeTabId === tab.id && (
            <motion.div 
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-red/5 pointer-events-none"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

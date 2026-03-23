import React from 'react';
import { motion } from 'motion/react';
import { SplitMode } from '../types';

interface SplitScreenMenuProps {
  onSelect: (mode: SplitMode) => void;
  currentMode: SplitMode;
}

export const SplitScreenMenu: React.FC<SplitScreenMenuProps> = ({ onSelect, currentMode }) => {
  const layouts: { mode: SplitMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'single',
      label: 'Single',
      icon: (
        <div className="w-full h-full border-2 border-current rounded-sm" />
      )
    },
    {
      mode: 'split-v',
      label: 'Vertical Split',
      icon: (
        <div className="w-full h-full flex gap-1">
          <div className="flex-1 border-2 border-current rounded-sm" />
          <div className="flex-1 border-2 border-current rounded-sm" />
        </div>
      )
    },
    {
      mode: 'split-h',
      label: 'Horizontal Split',
      icon: (
        <div className="w-full h-full flex flex-col gap-1">
          <div className="flex-1 border-2 border-current rounded-sm" />
          <div className="flex-1 border-2 border-current rounded-sm" />
        </div>
      )
    },
    {
      mode: 'quad',
      label: 'Quad Split',
      icon: (
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1">
          <div className="border-2 border-current rounded-sm" />
          <div className="border-2 border-current rounded-sm" />
          <div className="border-2 border-current rounded-sm" />
          <div className="border-2 border-current rounded-sm" />
        </div>
      )
    },
    {
      mode: 'three-left',
      label: 'Three Left',
      icon: (
        <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-1">
          <div className="col-span-2 row-span-2 border-2 border-current rounded-sm" />
          <div className="border-2 border-current rounded-sm" />
          <div className="border-2 border-current rounded-sm" />
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] min-w-[240px]"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Snap Layouts</p>
      <div className="grid grid-cols-3 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.mode}
            onClick={() => onSelect(layout.mode)}
            className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
              currentMode === layout.mode 
                ? 'bg-primary/10 text-primary ring-2 ring-primary/20' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <div className="w-12 h-10">
              {layout.icon}
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 bg-slate-800 text-white px-2 py-1 rounded pointer-events-none z-10">
              {layout.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

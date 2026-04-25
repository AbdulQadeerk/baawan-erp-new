/**
 * ItemClassificationSelection — React equivalent of Angular's ItemClassificationSelectionComponent
 * Angular: src/app/shared/item-classification-selection/item-classification-selection.component.ts
 */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import { getClassificationParents } from './shared.service';
import { itemClassification, itemClasses } from '../constants/itemClassification';

interface ItemClassificationSelectionProps {
  name: string; // Form field name (replaces @Input() id)
}

export const ItemClassificationSelection: React.FC<ItemClassificationSelectionProps> = ({ name }) => {
  const { control, setValue, watch } = useFormContext();
  const fieldValue = watch(name);

  // Array of selected items matching the classification levels
  const [selectedClasses, setSelectedClasses] = useState<any[]>(Array(itemClassification.length).fill(null));
  // Options available for each level
  const [levelOptions, setLevelOptions] = useState<any[][]>(Array(itemClassification.length).fill([]));

  // Initialize top level
  useEffect(() => {
    const topLevel = itemClasses.filter((item) => item.parentId === 1);
    const newOptions = [...levelOptions];
    newOptions[0] = topLevel;
    setLevelOptions(newOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When form value changes externally, update the cascading dropdowns
  useEffect(() => {
    if (fieldValue) {
      const parents = getClassificationParents(fieldValue, itemClasses).reverse();
      const newSelected = Array(itemClassification.length).fill(null);
      const newOptions = [...levelOptions];

      parents.forEach((p, idx) => {
        if (idx < itemClassification.length) {
          newSelected[idx] = p;
          if (idx + 1 < itemClassification.length) {
            newOptions[idx + 1] = itemClasses.filter((item) => item.parentId === p.id);
          }
        }
      });

      setSelectedClasses(newSelected);
      setLevelOptions(newOptions);
    }
  }, [fieldValue]);

  const handleSelect = (idx: number, selected: any) => {
    const newSelected = [...selectedClasses];
    newSelected[idx] = selected;

    // Clear subsequent levels
    for (let i = idx + 1; i < itemClassification.length; i++) {
      newSelected[i] = null;
    }
    setSelectedClasses(newSelected);

    // Update form value to the deepest selected class
    const deepestClass = newSelected.slice().reverse().find(Boolean);
    setValue(name, deepestClass?.id || 1, { shouldValidate: true });

    // Populate next level options
    if (selected && idx + 1 < itemClassification.length) {
      const nextOptions = itemClasses.filter((item) => item.parentId === selected.id);
      const newOptions = [...levelOptions];
      newOptions[idx + 1] = nextOptions;
      setLevelOptions(newOptions);
    }
  };

  const handleClear = () => {
    const topLevel = itemClasses.filter((item) => item.parentId === 1);
    const newOptions = Array(itemClassification.length).fill([]);
    newOptions[0] = topLevel;
    
    setLevelOptions(newOptions);
    setSelectedClasses(Array(itemClassification.length).fill(null));
    setValue(name, 1, { shouldValidate: true });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {itemClassification.map((label, idx) => (
        <div key={idx} className="flex-1 min-w-[200px] relative">
          <Select
            options={levelOptions[idx] || []}
            value={selectedClasses[idx]}
            onChange={(val) => handleSelect(idx, val)}
            placeholder={label}
            getOptionLabel={(e: any) => e.name}
            getOptionValue={(e: any) => e.id}
            isDisabled={idx > 0 && !selectedClasses[idx - 1]}
            classNamePrefix="react-select"
            classNames={{
              control: () => '!min-h-[42px] !rounded-lg !border-slate-200 dark:!border-slate-700 dark:!bg-slate-900',
              menu: () => '!z-50 dark:!bg-slate-800 dark:!border-slate-700',
              option: (state) => `dark:!text-slate-200 ${state.isFocused ? '!bg-blue-50 dark:!bg-blue-900/30' : ''} ${state.isSelected ? '!bg-blue-500 !text-white' : ''}`,
              singleValue: () => 'dark:!text-slate-200',
            }}
          />
          {idx === itemClassification.length - 1 && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-[-28px] top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear Selection"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

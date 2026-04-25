/**
 * ItemSelection — React equivalent of Angular's ItemSelectionComponent
 * Angular: src/app/shared/item-selection/item-selection.component.ts
 */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';
import { CommonAutocompleteTemplate } from './CommonAutocompleteTemplate';

interface ItemSelectionProps {
  name: string; // Form field name (replaces @Input() id/item)
  label?: string;
  required?: boolean;
  onItemChange?: (item: any) => void;
  onReset?: () => void;
}

export const ItemSelection: React.FC<ItemSelectionProps> = ({
  name,
  label,
  required = true,
  onItemChange,
  onReset,
}) => {
  const { control } = useFormContext();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from local storage
  useEffect(() => {
    const loadData = () => {
      const list = storage.getItem<any[]>(STORAGE_KEYS.ITEM_LIST) || [];
      const formattedList = list
        .filter((ele: any) => ele.isact)
        .map((ele: any) => ({
          ...ele,
          value: ele.iid,
          label: ele.nm,
          particular: [ele.nm, ele.ict, ele.typ, ele.brd, ele.siz, ele.ig].filter(Boolean).join(' ')
        }));

      setItems(formattedList);
      setLoading(false);
    };

    loadData();
    window.addEventListener('bw-master-sync-complete', loadData);
    return () => window.removeEventListener('bw-master-sync-complete', loadData);
  }, []);

  const customFilter = (option: any, inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return true;
    const search = inputValue.toLowerCase();
    return option.data.particular?.toLowerCase().includes(search);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required }}
        render={({ field, fieldState }) => (
          <div>
            <Select
              {...field}
              options={items}
              isLoading={loading}
              isClearable
              filterOption={customFilter}
              getOptionLabel={(e: any) => `${e.ict || ''} ${e.nm || ''}`.trim()}
              getOptionValue={(e: any) => e.iid}
              formatOptionLabel={(data: any) => (
                <CommonAutocompleteTemplate result={data} templateType="item" />
              )}
              value={items.find((i) => i.iid === field.value?.iid || i.iid === field.value) || null}
              onChange={(selected) => {
                field.onChange(selected);
                if (selected && onItemChange) onItemChange(selected);
                if (!selected && onReset) onReset();
              }}
              classNamePrefix="react-select"
              classNames={{
                control: (state) => `!min-h-[42px] !rounded-lg !border-slate-200 dark:!border-slate-700 dark:!bg-slate-900 ${fieldState.error ? '!border-rose-500' : ''}`,
                menu: () => '!z-50 dark:!bg-slate-800 dark:!border-slate-700',
                option: (state) => `dark:!text-slate-200 ${state.isFocused ? '!bg-blue-50 dark:!bg-blue-900/30' : ''} ${state.isSelected ? '!bg-blue-500 !text-white' : ''}`,
                singleValue: () => 'dark:!text-slate-200',
                input: () => 'dark:!text-slate-200',
              }}
            />
            {fieldState.error && (
              <span className="text-xs text-rose-500 mt-1">{fieldState.error.message || 'Item is required'}</span>
            )}
          </div>
        )}
      />
    </div>
  );
};

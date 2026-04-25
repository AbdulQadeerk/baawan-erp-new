/**
 * LedgerSelection — React equivalent of Angular's LedgerSelectionComponent
 * Angular: src/app/shared/ledger-selection/ledger-selection.component.ts
 */
import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';
import { storage } from '../lib/storage';
import { STORAGE_KEYS } from '../lib/constants';
import { CommonAutocompleteTemplate } from './CommonAutocompleteTemplate';
import { getGroupChildren } from './shared.service';

interface LedgerSelectionProps {
  name: string; // Form field name (replaces @Input() id/ledger)
  label?: string;
  required?: boolean;
  ledgerlistFilter?: { groups: number[]; includeChildGroups?: boolean };
  excludeLedgerId?: number;
  isGetLedgerDetailsRequired?: boolean;
  onLedgerChange?: (ledger: any) => void;
  onReset?: () => void;
}

export const LedgerSelection: React.FC<LedgerSelectionProps> = ({
  name,
  label,
  required = false,
  ledgerlistFilter,
  excludeLedgerId,
  isGetLedgerDetailsRequired = true,
  onLedgerChange,
  onReset,
}) => {
  const { control, setValue, watch } = useFormContext();
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ledgers from local storage (mirrors Angular's localStorage usage)
  useEffect(() => {
    const loadData = () => {
      let ldrList = storage.getItem<any[]>(STORAGE_KEYS.LEDGER_LIST) || [];
      const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];

      if (ldrList.length && ledgerlistFilter?.groups?.length) {
        let childGroups: number[] = [];
        ledgerlistFilter.groups.forEach((gId) => {
          childGroups.push(gId);
          childGroups = [...childGroups, ...getGroupChildren(gId, grpList)];
        });

        ldrList = ldrList.filter((x: any) => !x.lock_Freeze && childGroups.includes(x.group_ID));
      }

      if (excludeLedgerId) {
        ldrList = ldrList.filter((x: any) => x.id !== excludeLedgerId);
      }

      // Format for react-select
      const formattedList = ldrList.map((ele) => ({
        ...ele,
        value: ele.id,
        label: ele.name,
        group: grpList.find((g: any) => g.id === ele.group_ID)?.name,
        particular: [
          ele.name, ele.address, ele.area, ele.city,
          ele.phone_1, ele.phone_2, ele.mobile
        ].filter(Boolean).join(' ')
      }));

      setLedgers(formattedList);
      setLoading(false);
    };

    loadData();
    window.addEventListener('bw-master-sync-complete', loadData);
    return () => window.removeEventListener('bw-master-sync-complete', loadData);
  }, [ledgerlistFilter, excludeLedgerId]);

  const customFilter = (option: any, inputValue: string) => {
    if (!inputValue) return true;
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
              options={ledgers}
              isLoading={loading}
              isClearable
              filterOption={customFilter}
              getOptionLabel={(e: any) => e.name}
              getOptionValue={(e: any) => e.id}
              formatOptionLabel={(data: any) => (
                <CommonAutocompleteTemplate result={data} templateType="ledger" />
              )}
              value={ledgers.find((l) => l.id === field.value?.id || l.id === field.value) || null}
              onChange={(selected) => {
                field.onChange(selected);
                if (selected && onLedgerChange) onLedgerChange(selected);
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
              <span className="text-xs text-rose-500 mt-1">{fieldState.error.message || 'Ledger is required'}</span>
            )}
          </div>
        )}
      />
    </div>
  );
};

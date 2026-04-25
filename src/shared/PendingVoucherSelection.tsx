/**
 * PendingVoucherSelection — React equivalent of Angular's PendingVoucherSelectionComponent
 * Angular: src/app/shared/pending-voucher-selection/pending-voucher-selection.component.ts
 */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';
import { storage } from '../lib/storage';
import { STORAGE_KEYS, INVOICE_VOUCHER_TYPES_BY_ID } from '../lib/constants';
import { getGroupChildren } from './shared.service';
import { apiClient } from '../lib/api-client';

interface PendingVoucherSelectionProps {
  name: string; // Form field name (replaces @Input() formFieldName)
  label?: string;
  ledgerForm?: any;
  invType?: number;
  ledgerDetailIndex?: number;
  subDetailIndex?: number;
  onVoucherSelect?: (item: any) => void;
  onReset?: () => void;
}

export const PendingVoucherSelection: React.FC<PendingVoucherSelectionProps> = ({
  name,
  label,
  ledgerForm,
  invType,
  ledgerDetailIndex,
  subDetailIndex,
  onVoucherSelect,
  onReset,
}) => {
  const { control } = useFormContext();
  const [recordList, setRecordList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Angular checkPartyGroup: groups 16 (Sundry Debtors), 17 (Sundry Creditors)
  const checkPartyGroup = (ledger: any) => {
    if (!ledger?.group_ID) return false;
    const grpList = storage.getItem<any[]>(STORAGE_KEYS.GROUP_LIST) || [];
    if (!grpList.length) return false;

    let childGroups: number[] = [16, 17];
    [16, 17].forEach((v) => {
      childGroups = [...childGroups, ...getGroupChildren(v, grpList)];
    });

    return childGroups.includes(ledger.group_ID);
  };

  useEffect(() => {
    const fetchPending = async () => {
      const ledger = ledgerForm?.ledger_ID_Object || ledgerForm?.value?.ledger_ID_Object;
      if (!invType || !ledger || !checkPartyGroup(ledger)) {
        setRecordList([]);
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient.post('/api/Voucher/PendingVoucher', { ledgerId: ledger.id, vtType: invType });
        if (data && data.length) {
          const formatted = data.map((v: any) => {
            const crdr = !(v.grandtotal < 0);
            return {
              ...v,
              value: v.id,
              label: v.bilL_NO,
              grandtotalCrdr: crdr,
              grandtotalAbs: `${Math.abs(v.grandtotal).toFixed(2)} ${crdr ? 'Cr' : 'Dr'}`,
              invTypeText: INVOICE_VOUCHER_TYPES_BY_ID[v.inV_TYPE] || '',
            };
          });
          setRecordList(formatted);
        } else {
          setRecordList([]);
        }
      } catch (err) {
        console.error('Failed to load pending vouchers', err);
        setRecordList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, [ledgerForm, invType]);

  const customFilter = (option: any, inputValue: string) => {
    if (!inputValue || inputValue.length < 2) return true;
    return option.data.bilL_NO?.toLowerCase().includes(inputValue.toLowerCase());
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <Select
              {...field}
              options={recordList}
              isLoading={loading}
              isClearable
              filterOption={customFilter}
              getOptionLabel={(e: any) => e.bilL_NO}
              getOptionValue={(e: any) => e.id}
              formatOptionLabel={(data: any) => (
                <div className="flex flex-col py-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {data.bilL_NO} <span className="text-xs text-slate-500 font-normal ml-2">({data.invTypeText})</span>
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                    {data.grandtotalAbs}
                  </span>
                </div>
              )}
              value={recordList.find((l) => l.id === field.value?.id || l.id === field.value) || null}
              onChange={(selected) => {
                field.onChange(selected);
                if (selected && onVoucherSelect) {
                  onVoucherSelect({ item: selected, ledgerDetailIndex, subDetailIndex });
                }
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
              noOptionsMessage={() => (loading ? 'Loading...' : 'No pending vouchers')}
            />
          </div>
        )}
      />
    </div>
  );
};

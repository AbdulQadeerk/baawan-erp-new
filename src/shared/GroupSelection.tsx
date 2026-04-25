/**
 * GroupSelection — React equivalent of Angular's GroupSelectionComponent
 * Angular: src/app/shared/group-selection/group-selection.component.ts
 */
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useFormContext, Controller } from 'react-hook-form';
import { apiClient } from '../lib/api-client';

interface GroupSelectionProps {
  name: string;
  label?: string;
  required?: boolean;
  onItemChange?: (groupId: number) => void;
  onReset?: () => void;
}

export const GroupSelection: React.FC<GroupSelectionProps> = ({
  name,
  label,
  required = false,
  onItemChange,
  onReset,
}) => {
  const { control } = useFormContext();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch groups via API (Angular used CommonService.dropdown)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await apiClient.post('/api/Common/Dropdown', { table: 10 });
        const formatted = data.map((g: any) => ({
          ...g,
          value: g.id,
          label: g.name
        }));
        setGroups(formatted);
      } catch (err) {
        console.error('Failed to load groups', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
              options={groups}
              isLoading={loading}
              isClearable
              getOptionLabel={(e: any) => e.name}
              getOptionValue={(e: any) => e.id}
              value={groups.find((g) => g.id === field.value?.id || g.id === field.value) || null}
              onChange={(selected) => {
                field.onChange(selected);
                if (selected && onItemChange) onItemChange(selected.id);
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
              <span className="text-xs text-rose-500 mt-1">{fieldState.error.message || 'Group is required'}</span>
            )}
          </div>
        )}
      />
    </div>
  );
};

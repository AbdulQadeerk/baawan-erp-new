import React, { useState, useEffect, useRef } from "react";
import flags from "react-phone-number-input/flags";
import countriesData from "./countries.json";

interface CountrySelectProps {
  value?: string; // e.g. "IN"
  onChange: (value?: string) => void;
  options: { value?: string; label: string }[];
  disabled?: boolean;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset search on close
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Find rich country data from countriesData
  const getCountryInfo = (iso2?: string) => {
    if (!iso2) return null;
    return countriesData.find((c) => c.iso2 === iso2.toUpperCase());
  };

  const SelectedFlag = value ? flags[value as keyof typeof flags] : null;

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!opt.value) return false; // Skip the "International" fallback
    const info = getCountryInfo(opt.value);
    if (!info) {
      // Fallback to name search using default label
      return opt.label.toLowerCase().includes(search.toLowerCase());
    }
    return (
      info.name.toLowerCase().includes(search.toLowerCase()) ||
      info.dialCode.includes(search) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="relative select-none" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 rounded-l-lg hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-full"
      >
        <div className="w-5 h-4 flex items-center justify-center overflow-hidden rounded-[2px] shadow-sm">
          {SelectedFlag ? (
            React.createElement(SelectedFlag as any, { className: "w-full h-full object-cover" })
          ) : (
            <span className="text-xs">🌐</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input
              type="text"
              autoFocus
              placeholder="Search Country"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold placeholder:font-normal placeholder:text-slate-400 outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
                No countries found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optCode = opt.value!;
                const info = getCountryInfo(optCode);
                const CountryFlag = flags[optCode as keyof typeof flags];
                const displayName = info ? info.name : opt.label;
                const dialCode = info ? `+${info.dialCode}` : "";

                return (
                  <button
                    key={optCode}
                    type="button"
                    onClick={() => {
                      onChange(optCode);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      value === optCode
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <div className="w-5 h-4 flex items-center justify-center overflow-hidden rounded-[2px] shadow-sm shrink-0">
                        {CountryFlag && React.createElement(CountryFlag as any, { className: "w-full h-full object-cover" })}
                      </div>
                      <span className="truncate">{displayName}</span>
                    </div>
                    {dialCode && (
                      <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] ml-auto shrink-0">
                        {dialCode}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

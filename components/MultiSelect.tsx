import React from 'react';
import { Check } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onManage?: () => void; // Callback to open management modal
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange, onManage }) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {onManage && (
          <button
            type="button"
            onClick={onManage}
            className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            Edit List
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                ${isSelected
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700 dark:hover:bg-indigo-900/70'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'}
              `}
            >
              {isSelected && <Check className="w-3.5 h-3.5 mr-1.5" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

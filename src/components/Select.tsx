interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
}

export function Select({ label, value, onChange, options, required = false }: SelectProps) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2'>{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className='w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400'>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

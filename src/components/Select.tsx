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
  id?: string;
  disabled?: boolean;
}

export function Select({ label, value, onChange, options, required = false, id, disabled = false }: SelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold mb-2"
        style={{ color: "var(--color-text)" }}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={
          {
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
            "--tw-ring-color": "var(--color-primary)",
          } as React.CSSProperties & { "--tw-ring-color": string }
        }>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

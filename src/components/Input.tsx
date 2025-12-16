// components/Input.tsx
interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export function Input({ label, type = "text", value, onChange, placeholder, required = false }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all"
        style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          '--tw-ring-color': 'var(--color-primary)'
        } as any}
      />
    </div>
  );
}
// components/EmptyState.tsx
interface EmptyStateProps {
  message: string;
  submessage?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ message, submessage, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <p className="font-medium" style={{ color: 'var(--color-text)' }}>
        {message}
      </p>
      {submessage && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>
          {submessage}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-sm font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
// components/BottomAction.tsx
interface BottomActionProps {
  children: React.ReactNode;
}

export function BottomAction({ children }: BottomActionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 border-t" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
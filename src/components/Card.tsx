// components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, onClick, style, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border transition-all ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${className} `}
      style={{
        ...style,
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        ...(onClick ? { ":hover": { backgroundColor: "var(--color-surfaceHover)" } } : {}),
      }}>
      {children}
    </div>
  );
}

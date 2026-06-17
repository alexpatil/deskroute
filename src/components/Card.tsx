interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, onClick, style, className = "", elevated = false, noPadding = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border transition-all ${noPadding ? "" : "p-4"} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{
        backgroundColor: elevated ? "var(--color-surfaceElevated)" : "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: elevated ? "var(--shadow-md)" : "var(--shadow-xs)",
        ...(onClick ? { ["--hover-bg" as any]: "var(--color-surfaceHover)" } : {}),
        ...style,
      }}
      onMouseEnter={onClick ? (e) => (e.currentTarget.style.backgroundColor = "var(--color-surfaceHover)") : undefined}
      onMouseLeave={onClick ? (e) => (e.currentTarget.style.backgroundColor = elevated ? "var(--color-surfaceElevated)" : "var(--color-surface)") : undefined}>
      {children}
    </div>
  );
}

// components/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "danger" | "neutral";
  dot?: boolean;
  onClick?: () => void;
}

export function Badge({ children, variant = "info", dot = false, onClick }: BadgeProps) {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case "success":
        return { backgroundColor: "var(--color-successLight)", color: "var(--color-success)" };
      case "warning":
        return { backgroundColor: "var(--color-warningLight)", color: "var(--color-warning)" };
      case "danger":
        return { backgroundColor: "var(--color-dangerLight)", color: "var(--color-danger)" };
      case "neutral":
        return { backgroundColor: "var(--color-backgroundAlt)", color: "var(--color-textMuted)" };
      default:
        return { backgroundColor: "var(--color-infoLight)", color: "var(--color-info)" };
    }
  };

  const dotColor: Record<string, string> = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    neutral: "var(--color-textSubtle)",
    info: "var(--color-info)",
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-[11px] px-2 py-0.5 rounded-full ${onClick ? "cursor-pointer" : ""}`}
      style={getStyles()}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor[variant] }}
        />
      )}
      {children}
    </span>
  );
}

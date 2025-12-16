// components/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "info" | "danger";
  onClick?: () => void;
}

export function Badge({ children, variant = "info", onClick }: BadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "var(--color-successLight)",
          color: "var(--color-success)",
        };
      case "warning":
        return {
          backgroundColor: "var(--color-warningLight)",
          color: "var(--color-warning)",
        };
      case "danger":
        return {
          backgroundColor: "var(--color-dangerLight)",
          color: "var(--color-danger)",
        };
      default:
        return {
          backgroundColor: "var(--color-infoLight)",
          color: "var(--color-info)",
        };
    }
  };

  return (
    <span
      onClick={onClick}
      className={`whitespace-nowrap font-semibold text-xs px-2.5 py-1 rounded-full ${onClick ? "cursor-pointer" : ""}`}
      style={getStyles()}>
      {children}
    </span>
  );
}

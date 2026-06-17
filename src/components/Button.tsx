import { ButtonLoader } from "./Loading";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = { ...style };
    switch (variant) {
      case "primary":
        return { backgroundColor: "var(--color-primary)", color: "var(--color-primaryContrast)", ...base };
      case "secondary":
        return {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xs)",
          ...base,
        };
      case "ghost":
        return { backgroundColor: "transparent", color: "var(--color-textMuted)", ...base };
      case "danger":
        return { backgroundColor: "var(--color-danger)", color: "#FFFFFF", ...base };
    }
  };

  const sizeClass = size === "sm"
    ? "h-7 px-3 text-xs rounded-lg gap-1.5"
    : "h-8 px-3.5 text-sm rounded-lg gap-2";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${fullWidth ? "w-full" : "inline-flex"} items-center justify-center font-medium transition-all active:scale-[0.97] cursor-pointer shrink-0 ${sizeClass} ${
        isDisabled ? "opacity-40 cursor-not-allowed" : ""
      } ${className}`}
      style={getStyles()}>
      {loading && <ButtonLoader />}
      {children}
    </button>
  );
}

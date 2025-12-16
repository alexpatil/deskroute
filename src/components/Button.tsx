// components/Button.tsx
import { ButtonLoader } from "./Loading";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e : React.MouseEvent) => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Button({ children, onClick, type = "button", variant = "primary", disabled = false, loading = false, className = "", style }: ButtonProps) {
  const isDisabled = disabled || loading;

  const getStyles = () => {
    if (variant === "primary") {
      return {
        backgroundColor: "var(--color-primary)",
        color: "#ffffff",
        ...style
      };
    }
    if (variant === "secondary") {
      return {
        backgroundColor: "var(--color-backgroundAlt)",
        color: "var(--color-text)",
        ...style
      };
    }
    if (variant === "danger") {
      return {
        backgroundColor: "var(--color-danger)",
        color: "#ffffff",
        ...style
      };
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full py-3 px-4 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={getStyles()}>
      {loading && <ButtonLoader />}
      {children}
    </button>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}>
        <h3
          className="text-base font-bold mb-2"
          style={{ color: "var(--color-text)" }}>
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "var(--color-textMuted)" }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95"
            style={{
              backgroundColor: "var(--color-backgroundAlt)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
            }}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              backgroundColor:
                variant === "danger" ? "var(--color-danger)" : "var(--color-primary)",
              color: variant === "danger" ? "#ffffff" : "var(--color-primaryContrast)",
            }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

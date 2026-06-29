import toast from "react-hot-toast";

const TOAST_DURATION_MS = 4000;

type ToastVariant = "success" | "error" | "info";

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: "var(--color-health-green)",
  error: "var(--color-health-red)",
  info: "var(--color-brand-500)",
};

/** Shared toast style: raised surface with a variant-colored left border. */
function toastStyle(variant: ToastVariant): React.CSSProperties {
  return {
    background: "var(--color-bg-overlay)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
    borderLeft: `4px solid ${VARIANT_BORDER[variant]}`,
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-md)",
    fontSize: "var(--text-sm)",
    padding: "var(--space-3) var(--space-4)",
    maxWidth: "360px",
  };
}

/** Green success toast (auto-dismiss after 4s). */
export function toastSuccess(message: string): void {
  toast(message, {
    id: message,
    duration: TOAST_DURATION_MS,
    style: toastStyle("success"),
    icon: null,
  });
}

/** Red error toast (auto-dismiss after 4s). */
export function toastError(message: string): void {
  toast(message, {
    id: message,
    duration: TOAST_DURATION_MS,
    style: toastStyle("error"),
    icon: null,
  });
}

/** Blue info toast (auto-dismiss after 4s). */
export function toastInfo(message: string): void {
  toast(message, {
    id: message,
    duration: TOAST_DURATION_MS,
    style: toastStyle("info"),
    icon: null,
  });
}

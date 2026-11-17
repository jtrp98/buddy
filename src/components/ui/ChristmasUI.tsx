"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Layout & Surface Containers                                                */
/* -------------------------------------------------------------------------- */

export function PageContainer({
  children,
  size = "lg",
  className = "",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const maxWidth = {
    sm: "max-w-md",
    md: "max-w-3xl",
    lg: "max-w-6xl",
  }[size];

  return (
    <div className={`mx-auto w-full px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  badge,
  className = "",
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-start ${className}`}
    >
      <div className="min-w-0 space-y-2">
        {(kicker || badge) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {kicker && (
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
                <span aria-hidden="true" className="h-px w-6 bg-primary/70" />
                <span>{kicker}</span>
              </span>
            )}
            {badge}
          </div>
        )}
        <h1 className="thai-keep text-3xl leading-tight text-text-primary sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function ChristmasCard({
  children,
  elevated = false,
  withStripe = false,
  tone = "night",
  className = "",
}: {
  children: ReactNode;
  elevated?: boolean;
  /** Adds a thin red velvet ribbon along the top edge. */
  withStripe?: boolean;
  /** "paper" renders an ivory invitation surface (tokens are re-scoped for ink-on-paper). */
  tone?: "night" | "paper";
  className?: string;
}) {
  const surface =
    tone === "paper"
      ? "theme-paper"
      : elevated
        ? "christmas-card-elevated"
        : "christmas-card";
  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] transition-[border-color,box-shadow,transform] duration-200 ${surface} ${className}`}
    >
      {withStripe && <div aria-hidden="true" className="ribbon-bar h-1.5 w-full" />}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive Buttons                                                        */
/* -------------------------------------------------------------------------- */

import {
  christmasButtonClass,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonStyles";

export { christmasButtonClass, type ButtonSize, type ButtonVariant };

export interface ChristmasButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
}

export const ChristmasButton = forwardRef<HTMLButtonElement, ChristmasButtonProps>(
  function ChristmasButton(
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      disabled,
      children,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={christmasButtonClass(variant, size, className)}
        {...rest}
      >
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
        <span className="inline-flex items-center gap-2">
          {loading && loadingText ? loadingText : children}
        </span>
      </button>
    );
  }
);

/* -------------------------------------------------------------------------- */
/* Form Controls & Fields                                                     */
/* -------------------------------------------------------------------------- */

export function FormField({
  label,
  htmlFor,
  required = false,
  helperText,
  error,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  helperText?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-text-primary"
      >
        <span>{label}</span>
        {required && (
          <span className="ml-1 text-christmas-red-light" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {helperText && !error && (
        <p className="text-xs leading-relaxed text-text-secondary/85">{helperText}</p>
      )}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-xs font-semibold text-christmas-red-light"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function Input({ className = "", hasError = false, ...rest }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={hasError || undefined}
      className={`analog-input w-full rounded-xl px-4 py-2.5 text-sm ${
        hasError ? "border-christmas-red-light focus:border-christmas-red-light" : ""
      } ${className}`}
      {...rest}
    />
  );
});

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { hasError?: boolean }
>(function PasswordInput({ className = "", hasError = false, ...rest }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        aria-invalid={hasError || undefined}
        className={`analog-input w-full rounded-xl py-2.5 pr-12 pl-4 text-sm ${
          hasError ? "border-christmas-red-light focus:border-christmas-red-light" : ""
        } ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-elevated hover:text-primary"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(function Select({ className = "", hasError = false, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={hasError || undefined}
      className={`analog-input w-full rounded-xl px-4 py-2.5 text-sm ${
        hasError ? "border-christmas-red-light" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(function Textarea({ className = "", hasError = false, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={hasError || undefined}
      className={`analog-input w-full rounded-xl px-4 py-2.5 text-sm ${
        hasError ? "border-christmas-red-light" : ""
      } ${className}`}
      {...rest}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Alerts, Empty & Loading States                                             */
/* -------------------------------------------------------------------------- */

export type AlertTone = "info" | "success" | "warning" | "error";

const ALERT_STYLES: Record<
  AlertTone,
  { container: string; icon: ReactNode; role: "alert" | "status" }
> = {
  info: {
    container: "border-border-strong/60 bg-surface-elevated/80 text-text-primary",
    icon: <Info className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />,
    role: "status",
  },
  success: {
    container: "border-success/45 bg-success-bg text-text-primary",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />,
    role: "status",
  },
  warning: {
    container: "border-warning/50 bg-warning-bg text-text-primary",
    icon: <AlertTriangle className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />,
    role: "status",
  },
  error: {
    container: "border-error/55 bg-error-bg text-text-primary",
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-error" aria-hidden="true" />,
    role: "alert",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const style = ALERT_STYLES[tone];
  return (
    <div
      role={style.role}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-sm ${style.container} ${className}`}
    >
      <span className="mt-0.5">{style.icon}</span>
      <div className="min-w-0 flex-1 space-y-1">
        {title && <div className="font-bold">{title}</div>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <ChristmasCard
      elevated
      withStripe
      className={className}
    >
      <div className="p-8 text-center sm:p-12">
        {icon && (
          <div className="mx-auto mb-4 flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="thai-keep text-xl text-text-primary sm:text-2xl">{title}</h2>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </ChristmasCard>
  );
}

const LOADING_BULBS = ["#ffe7a8", "#ff6f61", "#ffc552", "#9fd0ff", "#ffe7a8", "#ff6f61", "#ffc552"];

export function LoadingState({
  label = "กำลังเตรียมความอบอุ่นของคริสต์มาส...",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" className="christmas-card space-y-6 rounded-[1.4rem] p-6 sm:p-8">
      {/* A little string of lights that twinkles while we wait */}
      <div aria-hidden="true" className="relative h-8">
        <svg viewBox="0 0 280 32" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0 6 Q 70 30 140 10 T 280 8" fill="none" stroke="#06140f" strokeWidth="1.2" />
        </svg>
        <div className="absolute inset-0 flex items-start justify-between px-[4%]">
          {LOADING_BULBS.map((c, i) => (
            <span
              key={i}
              className="fairy-bulb mt-2 block h-2.5 w-2.5 rounded-full"
              style={{
                background: c,
                boxShadow: `0 0 12px 2px ${c}`,
                marginTop: `${[10, 18, 20, 12, 8, 9, 8][i]}px`,
                animationDelay: `${i * 0.28}s`,
                animationDuration: "1.6s",
              }}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-semibold text-text-primary">{label}</p>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-10 animate-pulse rounded-xl bg-surface-elevated/70 motion-reduce:animate-none"
            style={{ opacity: 1 - idx * 0.16 }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accessible Confirmation Dialog                                             */
/* -------------------------------------------------------------------------- */

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  tone = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        className="christmas-card-elevated parcel-reveal w-full max-w-md overflow-hidden rounded-[1.4rem] shadow-2xl"
      >
        <div className="ribbon-bar h-1.5 w-full" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="thai-keep text-lg font-bold text-text-primary">
              {title}
            </h2>
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              aria-label="ปิดหน้าต่างยืนยัน"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            id={descId}
            className="mt-3 text-sm leading-relaxed text-text-secondary"
          >
            {description}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <ChristmasButton
              ref={cancelRef}
              variant="secondary"
              disabled={loading}
              onClick={onCancel}
            >
              {cancelLabel}
            </ChristmasButton>
            <ChristmasButton
              variant={tone === "danger" ? "danger" : "primary"}
              loading={loading}
              loadingText="กำลังดำเนินการ..."
              onClick={onConfirm}
            >
              {confirmLabel}
            </ChristmasButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export type ButtonVariant =
  | "primary"
  | "gold"
  | "secondary"
  | "evergreen"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/*
 * All colours come from theme tokens (globals.css), so buttons adapt when placed
 * on an ivory `.theme-paper` surface, where the tokens are re-scoped.
 */
const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  // Red velvet with a gold hairline — the main call to action
  primary:
    "text-ivory border border-primary/55 bg-[linear-gradient(180deg,var(--color-christmas-red-hover)_0%,var(--color-christmas-red)_55%,var(--color-christmas-red-deep)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_18px_-6px_rgba(179,38,46,0.7)] hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_26px_-8px_rgba(179,38,46,0.85)]",
  // Champagne gold
  gold:
    "text-primary-foreground border border-white/40 bg-[linear-gradient(180deg,#f3d995_0%,#dcb75e_60%,#c39b45_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_6px_18px_-6px_rgba(220,183,94,0.6)] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_24px_-8px_rgba(220,183,94,0.75)]",
  // Quiet outlined button on the current surface
  secondary:
    "text-text-primary border border-border-strong/70 bg-surface-elevated/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-primary hover:bg-surface-elevated",
  evergreen:
    "text-ivory border border-primary/40 bg-[linear-gradient(180deg,#22573f_0%,#12372a_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_16px_-8px_rgba(11,43,38,0.9)] hover:brightness-115",
  danger:
    "text-ivory border border-christmas-red-light/45 bg-[linear-gradient(180deg,#9b1f26_0%,#6e141a_100%)] shadow-[0_6px_16px_-8px_rgba(132,25,31,0.8)] hover:brightness-115",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-surface-elevated/70 hover:text-text-primary",
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-[44px] sm:min-h-[40px] px-3.5 py-2 text-xs sm:text-sm",
  md: "min-h-[46px] px-5 py-2.5 text-sm",
  lg: "min-h-[54px] px-7 py-3 text-base",
};

export function christmasButtonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = ""
) {
  return `analog-btn thai-keep inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 ${BUTTON_VARIANT_CLASS[variant]} ${BUTTON_SIZE_CLASS[size]} ${extra}`;
}

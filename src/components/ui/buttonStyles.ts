export type ButtonVariant =
  | "primary"
  | "gold"
  | "secondary"
  | "evergreen"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-[#D43343] to-[#AE1F2E] text-[#FFF9F0] border border-[#FF99A3]/35 shadow-[0_4px_16px_rgba(198,40,56,0.38),inset_0_1px_0_rgba(255,255,255,0.28)] hover:from-[#DF3C4C] hover:to-[#BF2434] hover:shadow-[0_8px_24px_rgba(198,40,56,0.48),inset_0_1px_0_rgba(255,255,255,0.36)]",
  gold:
    "bg-gradient-to-b from-[#F4D996] to-[#DFB964] text-[#101E2E] border border-[#FFF9F0]/60 shadow-[0_4px_16px_rgba(232,196,122,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] hover:from-[#FAE3A8] hover:to-[#E8C47A] hover:shadow-[0_8px_22px_rgba(232,196,122,0.42),inset_0_1px_0_rgba(255,255,255,0.65)]",
  secondary:
    "bg-[#173049]/95 text-[#FFF9F0] border border-[#DCEFF5]/22 shadow-[0_2px_10px_rgba(4,10,20,0.32),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-[#1E3D5C] hover:border-[#E8C47A]/60",
  evergreen:
    "bg-gradient-to-b from-[#1C5848] to-[#123D32] text-[#FFF9F0] border border-[#E8C47A]/40 shadow-[0_4px_14px_rgba(18,61,50,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] hover:from-[#236A57] hover:to-[#164A3D]",
  danger:
    "bg-gradient-to-b from-[#9E1E2B] to-[#7B1420] text-[#FFF9F0] border border-[#FF99A3]/45 shadow-[0_4px_14px_rgba(150,26,39,0.35)] hover:from-[#B42534] hover:to-[#8C1824]",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-surface-elevated/80 hover:text-text-primary",
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-[44px] sm:min-h-[40px] px-3.5 py-2 text-xs sm:text-sm",
  md: "min-h-[44px] px-4.5 py-2.5 text-sm",
  lg: "min-h-[50px] px-6 py-3 text-sm sm:text-base",
};

export function christmasButtonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = ""
) {
  return `analog-btn thai-keep inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_VARIANT_CLASS[variant]} ${BUTTON_SIZE_CLASS[size]} ${extra}`;
}

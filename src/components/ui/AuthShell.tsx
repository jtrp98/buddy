import type { ReactNode } from "react";
import { WinterScene } from "@/components/scenery/WinterScene";

/**
 * Shared composition for sign-in style pages: a painted winter vignette on one
 * side and an ivory "invitation paper" form on the other. On phones the
 * vignette becomes a short banner above the form.
 */
export function AuthShell({
  vignette,
  tagline,
  taglineSub,
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  vignette: ReactNode;
  tagline: ReactNode;
  taglineSub?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12">
      <div className="rise-in grid overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[var(--shadow-card-lifted)] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative flex min-h-[230px] flex-col items-center justify-end overflow-hidden px-6 pt-8 pb-6 text-center lg:min-h-[580px] lg:justify-center lg:pb-10">
          <WinterScene variant="auth" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_68%,rgba(8,18,36,0.7),transparent_75%)]"
          />
          <div className="relative z-10 flex flex-col items-center">
            <div className="xmas-float [animation-duration:7s]">{vignette}</div>
            <p className="mt-3 rounded-full bg-background/75 px-4 py-0.5 font-script text-xl text-primary lg:mt-4 lg:bg-transparent lg:p-0 lg:text-3xl lg:[text-shadow:0_2px_12px_rgba(5,12,24,0.9)]">
              {tagline}
            </p>
            {taglineSub && (
              <p className="mt-1 hidden max-w-xs text-sm leading-relaxed text-text-secondary [text-shadow:0_1px_8px_rgba(5,12,24,0.9)] lg:block">
                {taglineSub}
              </p>
            )}
          </div>
        </div>

        <div className="theme-paper rounded-none border-0 p-6 shadow-none sm:p-10">
          {eyebrow && (
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-primary uppercase">
              <span aria-hidden="true" className="h-px w-6 bg-primary/70" />
              {eyebrow}
            </p>
          )}
          <h1 className="thai-keep mt-2 text-3xl leading-tight text-text-primary sm:text-4xl">{title}</h1>
          {description && <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">{description}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-8 border-t border-border pt-5 text-center text-sm text-text-secondary">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

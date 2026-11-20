"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Tag, X } from "lucide-react";
import { ChristmasCard } from "@/components/ui/ChristmasUI";
import { CURRENT_VERSION, RELEASES } from "@/lib/releases";

export function ReleaseNotesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="บันทึกการอัปเดตเวอร์ชัน (Release Notes)"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto">
        <ChristmasCard elevated withStripe className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <Tag className="h-3 w-3" aria-hidden="true" />
                v{CURRENT_VERSION}
              </span>
              <h2 className="mt-2 text-lg font-bold text-text-primary sm:text-xl">
                มีอะไรใหม่ใน Secret Buddy
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดหน้าต่าง"
              className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {RELEASES.map((rel, idx) => (
              <section
                key={rel.version}
                className={`rounded-2xl border p-4 ${
                  idx === 0
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-surface-elevated/50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className={`h-4 w-4 ${idx === 0 ? "text-gold" : "text-text-muted"}`}
                      aria-hidden="true"
                    />
                    <span className="font-bold text-text-primary">v{rel.version}</span>
                  </div>
                  <span className="text-[11px] text-text-muted">{rel.date}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-primary">{rel.title}</p>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-text-secondary">
                  {rel.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </ChristmasCard>
      </div>
    </div>,
    document.body
  );
}

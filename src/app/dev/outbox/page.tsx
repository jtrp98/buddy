"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw, Trash2 } from "lucide-react";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

interface OutboxItem {
  id: string;
  to: string;
  subject: string;
  text: string;
  createdAt: string;
}

function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          className="break-all font-bold text-xmas-red underline decoration-dashed underline-offset-2 hover:text-pine"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function DevOutboxPage() {
  const { triggerClickSound } = useFestiveAtmosphere();
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notAvailable, setNotAvailable] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/outbox", { cache: "no-store" });
      if (res.status === 404) {
        setNotAvailable(true);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClear = async () => {
    triggerClickSound();
    await fetch("/api/dev/outbox", { method: "DELETE" });
    setItems([]);
  };

  if (notAvailable) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm font-bold text-ink-soft">
        หน้านี้ใช้งานได้เฉพาะโหมดพัฒนา (Development) เท่านั้น
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="analog-card printed-double-rule flex flex-wrap items-center justify-between gap-4 rounded-md p-5 sm:p-6">
        <div className="relative z-10">
          <span className="font-type text-[10px] font-bold tracking-[0.16em] text-pine uppercase">
            POSTMAN&apos;S MAILBAG
          </span>
          <h1 className="thai-keep letterpress mt-1 flex items-start gap-2 font-display text-xl leading-[1.35] text-ink sm:items-center sm:text-2xl">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-xmas-red sm:mt-0 sm:h-6 sm:w-6" />
            <span>กล่องอีเมลจำลอง (Dev Outbox)</span>
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            ใช้สำหรับทดสอบการส่งอีเมลในเครื่อง Local เมื่อยังไม่ได้ตั้งค่า Gmail SMTP
          </p>
        </div>
        <div className="relative z-10 flex gap-2">
          <button
            type="button"
            onClick={() => {
              triggerClickSound();
              void load();
            }}
            className="analog-btn inline-flex min-h-[44px] items-center gap-1.5 rounded bg-paper px-3.5 py-2 text-xs font-bold text-ink hover:bg-cream sm:min-h-[38px]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>รีเฟรช</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="analog-btn inline-flex min-h-[44px] items-center gap-1.5 rounded bg-red-wash px-3.5 py-2 text-xs font-bold text-xmas-red-deep hover:bg-red-wash/80 sm:min-h-[38px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>ล้างกล่อง</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="analog-card rounded-md p-8 text-center text-sm font-bold text-ink-soft">
          กำลังโหลด...
        </div>
      ) : items.length === 0 ? (
        <div className="analog-kraft rounded-md border-dashed p-10 text-center text-sm font-bold text-ink-soft">
          ยังไม่มีอีเมลที่ถูกส่งในโหมดจำลอง
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="analog-card rounded-md p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-dashed border-rule pb-3">
                <div>
                  <div className="text-sm font-bold text-ink">{item.subject}</div>
                  <div className="mt-0.5 text-xs text-ink-soft">
                    ถึง: <span className="font-bold text-ink">{item.to}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-medium text-ink-soft">
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </span>
                  <PostageStamp topText="LOCAL" mainText="MAIL" bottomText="SENT" tone="red" />
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded border border-rule bg-cream p-3.5 font-sans text-xs leading-relaxed text-ink-soft">
                {renderTextWithLinks(item.text)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

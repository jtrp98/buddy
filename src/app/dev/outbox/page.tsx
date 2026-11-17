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
          className="break-all font-bold text-[#c8322b] underline decoration-dashed underline-offset-2 hover:text-[#1f5e46]"
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
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm font-bold text-[#675449]">
        หน้านี้ใช้งานได้เฉพาะโหมดพัฒนา (Development) เท่านั้น
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8">
      <div className="analog-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#1f5e46] uppercase">
            POSTMAN&apos;S MAILBAG
          </span>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#2a1f1b]">
            <Mail className="h-6 w-6 text-[#c8322b]" />
            <span>กล่องอีเมลจำลอง (Dev Outbox)</span>
          </h1>
          <p className="mt-1 text-xs text-[#675449]">
            ใช้สำหรับทดสอบการส่งอีเมลในเครื่อง Local เมื่อยังไม่ได้ตั้งค่า Gmail SMTP
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              triggerClickSound();
              void load();
            }}
            className="analog-btn inline-flex items-center gap-1.5 rounded-xl bg-[#fffdf7] px-3.5 py-2 text-xs font-bold text-[#2a1f1b] hover:bg-[#f3e7d1]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>รีเฟรช</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="analog-btn inline-flex items-center gap-1.5 rounded-xl bg-[#fdeceb] px-3.5 py-2 text-xs font-bold text-[#9e221d] hover:bg-[#fbd5d2]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>ล้างกล่อง</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="analog-card rounded-2xl p-8 text-center text-sm font-bold text-[#675449]">
          กำลังโหลด...
        </div>
      ) : items.length === 0 ? (
        <div className="analog-kraft rounded-2xl border-dashed p-10 text-center text-sm font-bold text-[#675449]">
          ยังไม่มีอีเมลที่ถูกส่งในโหมดจำลอง
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="analog-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-dashed border-[#cbb7a6] pb-3">
                <div>
                  <div className="text-sm font-bold text-[#2a1f1b]">{item.subject}</div>
                  <div className="mt-0.5 text-xs text-[#675449]">
                    ถึง: <span className="font-bold text-[#2a1f1b]">{item.to}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-medium text-[#675449]">
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </span>
                  <PostageStamp topText="LOCAL" mainText="MAIL" bottomText="SENT" tone="red" />
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-[#dfd0bf] bg-[#fdf6e9] p-3.5 font-sans text-xs leading-relaxed text-[#4d3d35]">
                {renderTextWithLinks(item.text)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw, Trash2 } from "lucide-react";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { NorthPoleMailbox3D } from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  ChristmasButton,
  ChristmasCard,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/ui/ChristmasUI";

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
          className="break-all font-semibold text-primary underline decoration-primary/60 underline-offset-2 hover:text-primary-hover"
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
      <PageContainer size="md" className="py-16">
        <EmptyState
          icon={<NorthPoleMailbox3D className="h-24 w-24" />}
          title="หน้านี้ใช้งานได้เฉพาะโหมดพัฒนา (Development) เท่านั้น"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl space-y-5">
      <ChristmasCard elevated withStripe>
        <div className="p-6">
          <PageHeader
            kicker="DEV OUTBOX"
            title="กล่องอีเมลจำลอง"
            description="ใช้สำหรับทดสอบการส่งอีเมลในเครื่อง Local เมื่อยังไม่ได้ตั้งค่า SMTP"
            actions={
              <>
                <ChristmasButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    triggerClickSound();
                    void load();
                  }}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>รีเฟรช</span>
                </ChristmasButton>
                <ChristmasButton variant="danger" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span>ล้างกล่อง</span>
                </ChristmasButton>
              </>
            }
          />
        </div>
      </ChristmasCard>

      {loading ? (
        <LoadingState label="กำลังโหลดอีเมลจำลอง..." rows={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<NorthPoleMailbox3D className="h-24 w-24" />}
          title="ยังไม่มีอีเมลที่ถูกส่งในโหมดจำลอง"
          description="เมื่อมีการลงทะเบียนหรือสุ่มจับคู่ในโหมดพัฒนา อีเมลจะมาปรากฏที่นี่"
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ChristmasCard key={item.id} className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2 text-base font-bold text-snow-white">
                    <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{item.subject}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                    ถึง: <strong className="text-primary">{item.to}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-secondary">
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </span>
                  <PostageStamp topText="LOCAL" mainText="MAIL" bottomText="SENT" tone="red" />
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-border bg-background/75 p-4 font-sans text-xs leading-relaxed text-text-secondary sm:text-sm">
                {renderTextWithLinks(item.text)}
              </pre>
            </ChristmasCard>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

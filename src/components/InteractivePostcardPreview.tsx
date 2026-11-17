"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { PostageStamp, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

export function InteractivePostcardPreview() {
  const [opened, setOpened] = useState(false);
  const { triggerStampSound, triggerChimeSound, triggerClickSound } = useFestiveAtmosphere();

  const handleToggle = () => {
    if (!opened) {
      triggerStampSound();
      setTimeout(() => triggerChimeSound(), 90);
    } else {
      triggerClickSound();
    }
    setOpened((prev) => !prev);
  };

  return (
    <div className="relative rounded-2xl border-2 border-[#2a1f1b] bg-[#f3e7d1] p-4 shadow-[4px_4px_0_#2a1f1b]">
      <div className="flex items-center justify-between border-b-2 border-dashed border-[#bfa995] pb-3">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#9e221d] uppercase">
            SAMPLE PARCEL • TRY ME!
          </div>
          <div className="text-sm font-bold text-[#2a1f1b]">
            ตัวอย่างซองลับ Secret Buddy
          </div>
        </div>
        <PostageStamp topText="XMAS" mainText="25 DEC" bottomText="POST" tone="green" />
      </div>

      {!opened ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border-2 border-[#2a1f1b] bg-[#fffdf7] px-4 py-6 text-center">
          <p className="font-mono text-[10px] font-bold tracking-widest text-[#675449] uppercase">
            TO: พี่มิ้นต์ (ฝ่าย HR)
          </p>
          <p className="mt-1 text-sm font-bold text-[#2a1f1b]">
            มีพัสดุลับจากเพื่อนร่วมทีมส่งถึงคุณ!
          </p>

          <button
            type="button"
            onClick={handleToggle}
            className="analog-btn-lg group mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#c8322b] px-5 py-2.5 text-xs font-bold text-[#fffdf7] hover:bg-[#b22923]"
          >
            <WaxSeal tone="gold" size="sm">
              <Gift className="h-4 w-4" />
            </WaxSeal>
            <span>ลองกดแกะผนึกขี้ผึ้งดูสิ!</span>
          </button>
        </div>
      ) : (
        <div className="parcel-reveal mt-4 rounded-xl border-2 border-[#2a1f1b] bg-[#fffdf7] p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 rounded border border-[#1f5e46] bg-[#dff0e6] px-2 py-0.5 text-[10px] font-bold text-[#154231]">
                <Sparkles className="h-3 w-3" />
                UNSEALED!
              </span>
              <div className="mt-2 text-lg font-bold text-[#c8322b]">🎁 คุณต้น (Dev Team)</div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="analog-btn rounded-lg bg-[#f3e7d1] px-2.5 py-1 text-[11px] font-bold text-[#2a1f1b]"
            >
              พับซองกลับ
            </button>
          </div>
          <div className="mt-2.5 space-y-1.5 border-t-2 border-dashed border-[#dfd0bf] pt-2.5 text-xs text-[#4d3d35]">
            <div>
              <span className="font-bold text-[#2a1f1b]">งบประมาณ:</span> 300–500 บาท
            </div>
            <div>
              <span className="font-bold text-[#2a1f1b]">ชอบ:</span> ☕ กาแฟคั่วกลาง, 🌲 ต้นไม้จิ๋ว
            </div>
            <div className="rounded-lg border border-[#1f5e46]/40 bg-[#edf7f1] px-2.5 py-1.5 text-[#154231]">
              <span className="font-bold">Wish List:</span> แก้วเก็บความเย็นสีเขียวเข้ม หรือเมล็ดกาแฟดริป
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

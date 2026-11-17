"use client";

import { useState } from "react";
import { KeyRound, MailCheck } from "lucide-react";
import { CandyStripeBar, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

export function RecoverForm({ initialInviteCode = "" }: { initialInviteCode?: string }) {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const cleanCode = inviteCode
        .trim()
        .replace(/^https?:\/\/[^/]+\/join\//i, "")
        .split(/[/?#]/)[0];

      const res = await fetch("/api/members/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: cleanCode, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถดำเนินการได้");
        return;
      }
      triggerChimeSound();
      setSuccessMsg(data.message);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="analog-card-lg printed-double-rule overflow-hidden rounded-md">
        <CandyStripeBar />
        <div className="relative z-10 p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <WaxSeal tone="gold" size="md">
              <KeyRound className="h-5 w-5" />
            </WaxSeal>
            <div>
              <span className="font-type text-[10px] font-bold tracking-[0.16em] text-pine uppercase">
                LOST KEY DISPATCH
              </span>
              <h1 className="thai-keep letterpress font-display text-xl text-ink">
                ขอลิงก์ส่วนตัวใหม่
              </h1>
            </div>
          </div>

          <p className="mt-3 text-sm leading-[1.75] text-ink-soft">
            กรอกรหัสกลุ่ม (หรือวางลิงก์เชิญกลุ่ม) และอีเมลที่ใช้ลงทะเบียน
            เพื่อรับลิงก์แก้ไขข้อมูลหรือลิงก์ดูผล Buddy ใหม่ (ลิงก์เก่าจะถูกยกเลิกอัตโนมัติ)
          </p>

          {successMsg ? (
            <div className="mt-6 rounded border border-pine/45 bg-pine-wash p-5 text-center shadow-paper">
              <MailCheck className="mx-auto h-10 w-10 text-pine" />
              <p className="mt-2.5 font-serif text-sm font-bold text-pine-deep">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded border border-xmas-red/45 bg-red-wash px-4 py-3 text-sm font-medium text-xmas-red-deep">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-serif text-sm font-bold text-ink">
                  รหัสกลุ่ม หรือลิงก์เชิญ
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="เช่น a3x9k2m7p4 หรือลิงก์ /join/..."
                  className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-serif text-sm font-bold text-ink">
                  อีเมลที่ใช้ลงทะเบียน
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="analog-btn-lg thai-keep min-h-[46px] w-full rounded bg-xmas-red py-3 text-sm font-bold text-paper hover:bg-xmas-red-deep disabled:opacity-60"
              >
                {loading ? "กำลังส่ง..." : "ส่งลิงก์ส่วนตัวใหม่ทางอีเมล"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

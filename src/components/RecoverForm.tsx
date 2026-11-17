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
      <div className="analog-card-lg overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <WaxSeal tone="gold" size="md">
              <KeyRound className="h-5 w-5" />
            </WaxSeal>
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#1f5e46] uppercase">
                LOST KEY DISPATCH
              </span>
              <h1 className="text-xl font-bold text-[#2a1f1b]">ขอลิงก์ส่วนตัวใหม่</h1>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[#675449]">
            กรอกรหัสกลุ่ม (หรือวางลิงก์เชิญกลุ่ม) และอีเมลที่ใช้ลงทะเบียน
            เพื่อรับลิงก์แก้ไขข้อมูลหรือลิงก์ดูผล Buddy ใหม่ (ลิงก์เก่าจะถูกยกเลิกอัตโนมัติ)
          </p>

          {successMsg ? (
            <div className="mt-6 rounded-2xl border-2 border-[#1f5e46] bg-[#edf7f1] p-5 text-center shadow-[3px_3px_0_#1f5e46]">
              <MailCheck className="mx-auto h-10 w-10 text-[#1f5e46]" />
              <p className="mt-2.5 text-sm font-bold text-[#154231]">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-[#2a1f1b]">
                  รหัสกลุ่ม หรือลิงก์เชิญ
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="เช่น a3x9k2m7p4 หรือลิงก์ /join/..."
                  className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2a1f1b]">
                  อีเมลที่ใช้ลงทะเบียน
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="analog-btn-lg w-full rounded-xl bg-[#c8322b] py-3 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923] disabled:opacity-60"
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

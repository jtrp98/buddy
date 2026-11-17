"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Gift } from "lucide-react";
import type { BudgetTypeValue } from "@/lib/budget";
import { CandyStripeBar, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

export function NewGroupForm({ defaultCloseAt }: { defaultCloseAt: string }) {
  const router = useRouter();
  const { triggerClickSound } = useFestiveAtmosphere();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState<BudgetTypeValue>("RANGE");
  const [budgetMin, setBudgetMin] = useState("200");
  const [budgetMax, setBudgetMax] = useState("500");
  const [registrationClosesAt, setRegistrationClosesAt] = useState(defaultCloseAt);
  const [revealAt, setRevealAt] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title,
        description: description || null,
        budgetType,
        budgetMin:
          budgetType === "UNLIMITED" ? null : budgetMin ? Number(budgetMin) : null,
        budgetMax:
          budgetType === "RANGE" ? (budgetMax ? Number(budgetMax) : null) : null,
        registrationClosesAt,
        revealAt: revealAt || null,
        publishNow,
      };

      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถสร้างกลุ่มได้");
        return;
      }

      router.push(`/admin/groups/${data.group.id}`);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5c493e] hover:text-[#c8322b]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>กลับไปหน้าแดชบอร์ด</span>
      </Link>

      <div className="analog-card-lg mt-4 overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <WaxSeal tone="red" size="md">
              <Gift className="h-5 w-5" />
            </WaxSeal>
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#1f5e46] uppercase">
                EVENT BLUEPRINT
              </span>
              <h1 className="text-xl font-bold text-[#2a1f1b] sm:text-2xl">
                สร้างกลุ่ม Secret Buddy ใหม่
              </h1>
              <p className="text-xs text-[#675449]">
                ตั้งชื่องบของขวัญและเวลาปิดรับสมัคร (เวลาไทย UTC+7)
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                ชื่อกิจกรรม <span className="text-[#c8322b]">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น Buddy Christmas 2026"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                รายละเอียดกิจกรรม (ไม่บังคับ)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น แลกของขวัญส่งท้ายปี นำของขวัญมาวางใต้ต้นคริสต์มาส เวลา 16:00 น."
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            {/* Gift Budget */}
            <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-4 sm:p-5">
              <label className="block text-sm font-bold text-[#2a1f1b]">
                งบประมาณของขวัญ <span className="text-[#c8322b]">*</span>
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {(
                  [
                    { id: "FIXED", label: "งบตายตัว" },
                    { id: "RANGE", label: "งบแบบช่วง" },
                    { id: "MIN", label: "งบขั้นต่ำ" },
                    { id: "UNLIMITED", label: "ไม่จำกัดงบ" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      triggerClickSound();
                      setBudgetType(opt.id);
                    }}
                    className={`analog-btn rounded-xl px-3 py-2 text-xs font-bold ${
                      budgetType === opt.id
                        ? "bg-[#c8322b] text-[#fffdf7]"
                        : "bg-[#fffdf7] text-[#2a1f1b] hover:bg-[#f3e7d1]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {budgetType === "FIXED" && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#5c493e]">
                    จำนวนเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="300"
                    className="analog-input mt-1 w-full rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              )}

              {budgetType === "RANGE" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5c493e]">
                      งบต่ำสุด (บาท)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="200"
                      className="analog-input mt-1 w-full rounded-xl px-3.5 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5c493e]">
                      งบสูงสุด (บาท)
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="500"
                      className="analog-input mt-1 w-full rounded-xl px-3.5 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {budgetType === "MIN" && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#5c493e]">
                    งบขั้นต่ำ (บาทขึ้นไป)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="200"
                    className="analog-input mt-1 w-full rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              )}

              {budgetType === "UNLIMITED" && (
                <p className="mt-3 text-xs text-[#675449]">
                  สมาชิกสามารถเลือกของขวัญได้อย่างอิสระตามความเหมาะสม
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-[#2a1f1b]">
                  <CalendarClock className="h-4 w-4 text-[#c8322b]" />
                  <span>วันและเวลาปิดรับสมัคร (เวลาไทย) *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={registrationClosesAt}
                  onChange={(e) => setRegistrationClosesAt(e.target.value)}
                  className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2a1f1b]">
                  วันเฉลย Buddy (ไม่บังคับ)
                </label>
                <input
                  type="datetime-local"
                  value={revealAt}
                  onChange={(e) => setRevealAt(e.target.value)}
                  className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Publish Option */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-[#2a1f1b] bg-[#edf7f1] p-4 hover:bg-[#dff0e6]">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => {
                  triggerClickSound();
                  setPublishNow(e.target.checked);
                }}
                className="mt-1 h-4 w-4 accent-[#1f5e46]"
              />
              <div>
                <div className="text-sm font-bold text-[#154231]">
                  เปิดรับสมัครทันที (สถานะ Open)
                </div>
                <div className="text-xs text-[#2d664f]">
                  หากไม่เลือก กลุ่มจะถูกบันทึกเป็น Draft เพื่อรอแก้ไขก่อนเปิดรับสมัครจริง
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="analog-btn-lg w-full rounded-xl bg-[#c8322b] py-3.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923] disabled:opacity-60"
            >
              {submitting
                ? "กำลังสร้างกลุ่ม..."
                : publishNow
                  ? "🎄 สร้างกลุ่มและเปิดรับสมัคร"
                  : "บันทึกเป็น Draft"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

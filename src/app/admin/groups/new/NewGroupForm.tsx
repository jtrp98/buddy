"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Gift, Info, Sparkles } from "lucide-react";
import { formatBudget, type BudgetTypeValue } from "@/lib/budget";
import { ElfCharacter3D } from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  FormField,
  Input,
  PageContainer,
  Textarea,
} from "@/components/ui/ChristmasUI";

const BUDGET_OPTIONS: ReadonlyArray<{
  id: BudgetTypeValue;
  label: string;
  hint: string;
}> = [
  { id: "FIXED", label: "งบตายตัว", hint: "กำหนดราคาเดียว เช่น 300 บาท" },
  { id: "RANGE", label: "งบแบบช่วง", hint: "กำหนดขั้นต่ำ–สูงสุด เช่น 200–500 บาท" },
  { id: "MIN", label: "งบขั้นต่ำ", hint: "กำหนดราคาเริ่มต้น เช่น 200 บาทขึ้นไป" },
  { id: "UNLIMITED", label: "ไม่จำกัดงบ", hint: "เลือกของขวัญตามความเหมาะสม" },
];

export function NewGroupForm({ defaultCloseAt }: { defaultCloseAt: string }) {
  const router = useRouter();
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const titleId = useId();
  const descId = useId();
  const budgetMinId = useId();
  const budgetMaxId = useId();
  const closeAtId = useId();
  const revealAtId = useId();

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

  const previewBudgetText = formatBudget(
    budgetType,
    budgetMin ? Number(budgetMin) : null,
    budgetMax ? Number(budgetMax) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");

    if (title.trim().length < 2) {
      setError("กรุณาตั้งชื่อกิจกรรมอย่างน้อย 2 ตัวอักษร");
      return;
    }
    if (budgetType === "RANGE" && Number(budgetMax) < Number(budgetMin)) {
      setError("งบสูงสุดต้องมากกว่าหรือเท่ากับงบต่ำสุด");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
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

      triggerChimeSound();
      router.push(`/admin/groups/${data.group.id}`);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer size="md">
      <Link
        href="/admin"
        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>กลับไปหน้า Mission Control</span>
      </Link>

      <ChristmasCard elevated withStripe className="mt-3">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div className="shrink-0 self-start rounded-2xl border border-primary/30 bg-background/70 p-2">
              <ElfCharacter3D className="h-20 w-20" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>PREPARE YOUR CHRISTMAS PARTY</span>
              </span>
              <h1 className="thai-keep mt-1 text-xl font-bold text-snow-white sm:text-2xl">
                เตรียมจัดกิจกรรม Secret Buddy ใหม่
              </h1>
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                ตั้งชื่อปาร์ตี้ งบประมาณของขวัญ และกำหนดเวลาปิดรับสมัคร (อ้างอิงเวลาประเทศไทย UTC+7)
              </p>
            </div>
          </div>

          {error && (
            <Alert tone="error" className="mt-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-7">
            {/* Section 1: Event Details */}
            <fieldset className="space-y-4 rounded-2xl border border-white/12 bg-background/45 p-5">
              <legend className="px-2 text-base font-bold text-primary">
                1. ข้อมูลปาร์ตี้คริสต์มาส
              </legend>

              <FormField
                label="ชื่อกิจกรรม"
                htmlFor={titleId}
                required
                helperText="ชื่อนี้จะแสดงบนบัตรเชิญและในซองลับของสมาชิกทุกคน"
              >
                <Input
                  id={titleId}
                  type="text"
                  required
                  minLength={2}
                  disabled={submitting}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น แลกของขวัญคริสต์มาส ทีม Product 2026"
                />
              </FormField>

              <FormField
                label="รายละเอียดหรือกติกาเพิ่มเติม (ไม่บังคับ)"
                htmlFor={descId}
                helperText="เช่น สถานที่วางของขวัญ หรือธีมแต่งกายวันแลกของขวัญ"
              >
                <Textarea
                  id={descId}
                  rows={3}
                  disabled={submitting}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เช่น นำของขวัญมาวางใต้ต้นคริสต์มาสโซน Pantry ก่อน 16:00 น."
                />
              </FormField>
            </fieldset>

            {/* Section 2: Gift Budget */}
            <fieldset className="space-y-4 rounded-2xl border border-primary/25 bg-background/55 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="flex items-center gap-2 text-base font-bold text-primary">
                  <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>2. งบประมาณของขวัญ *</span>
                </legend>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-surface-elevated px-3.5 py-1 text-xs font-bold text-primary">
                  ตัวอย่างที่จะแสดง: {previewBudgetText}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {BUDGET_OPTIONS.map((opt) => {
                  const selected = budgetType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitting}
                      aria-pressed={selected}
                      onClick={() => {
                        triggerClickSound();
                        setBudgetType(opt.id);
                      }}
                      className={`analog-btn flex min-h-[60px] flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-primary bg-primary/15 text-snow-white ring-1 ring-primary shadow-[0_0_16px_rgba(232,196,122,0.16)]"
                          : "border-border bg-surface text-text-secondary hover:border-white/35 hover:text-snow-white"
                      }`}
                    >
                      <span className="text-sm font-bold text-snow-white">
                        {opt.label}
                      </span>
                      <span className="text-xs text-text-secondary">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>

              {budgetType === "FIXED" && (
                <FormField label="จำนวนเงิน (บาท)" htmlFor={budgetMinId} required>
                  <Input
                    id={budgetMinId}
                    type="number"
                    min={1}
                    required
                    disabled={submitting}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="300"
                  />
                </FormField>
              )}

              {budgetType === "RANGE" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="งบต่ำสุด (บาท)" htmlFor={budgetMinId} required>
                    <Input
                      id={budgetMinId}
                      type="number"
                      min={1}
                      required
                      disabled={submitting}
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="200"
                    />
                  </FormField>
                  <FormField label="งบสูงสุด (บาท)" htmlFor={budgetMaxId} required>
                    <Input
                      id={budgetMaxId}
                      type="number"
                      min={1}
                      required
                      disabled={submitting}
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="500"
                    />
                  </FormField>
                </div>
              )}

              {budgetType === "MIN" && (
                <FormField label="งบขั้นต่ำ (บาทขึ้นไป)" htmlFor={budgetMinId} required>
                  <Input
                    id={budgetMinId}
                    type="number"
                    min={1}
                    required
                    disabled={submitting}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="200"
                  />
                </FormField>
              )}

              {budgetType === "UNLIMITED" && (
                <p className="flex items-center gap-2 text-xs text-text-secondary">
                  <Info className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>สมาชิกสามารถเลือกของขวัญได้อย่างอิสระตามความเหมาะสม</span>
                </p>
              )}
            </fieldset>

            {/* Section 3: Schedule */}
            <fieldset className="space-y-4 rounded-2xl border border-white/12 bg-background/45 p-5">
              <legend className="px-2 text-base font-bold text-primary">
                3. กำหนดวันและเวลา (เวลาไทย UTC+7)
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock
                        className="h-4 w-4 text-primary"
                        aria-hidden="true"
                      />
                      <span>วันและเวลาปิดรับสมัคร</span>
                    </span>
                  }
                  htmlFor={closeAtId}
                  required
                  helperText="เมื่อถึงเวลานี้ ระบบจะปิดรับสมัครและพร้อมสุ่มจับคู่"
                >
                  <Input
                    id={closeAtId}
                    type="datetime-local"
                    required
                    disabled={submitting}
                    value={registrationClosesAt}
                    onChange={(e) => setRegistrationClosesAt(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="วันนัดแลก / เฉลย Buddy (ไม่บังคับ)"
                  htmlFor={revealAtId}
                  helperText="แสดงให้สมาชิกทราบในซองลับว่านัดเฉลยกันวันไหน"
                >
                  <Input
                    id={revealAtId}
                    type="datetime-local"
                    disabled={submitting}
                    value={revealAt}
                    onChange={(e) => setRevealAt(e.target.value)}
                  />
                </FormField>
              </div>
            </fieldset>

            {/* Section 4: Publish Status */}
            <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-emerald-400/35 bg-evergreen/50 p-4 transition hover:border-emerald-400/60">
              <input
                type="checkbox"
                checked={publishNow}
                disabled={submitting}
                onChange={(e) => {
                  triggerClickSound();
                  setPublishNow(e.target.checked);
                }}
                className="mt-1 h-5 w-5 shrink-0 accent-[#E8C47A]"
              />
              <div>
                <div className="text-sm font-bold text-snow-white">
                  เปิดรับสมัครทันทีหลังสร้างกลุ่ม (สถานะ: เปิดรับสมัคร)
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                  หากไม่เลือก กลุ่มจะถูกบันทึกเป็นฉบับร่าง (Draft) เพื่อให้คุณตรวจสอบก่อนเปิดรับสมัครจริง
                </p>
              </div>
            </label>

            <ChristmasButton
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              loadingText="กำลังสร้างปาร์ตี้คริสต์มาส..."
              className="w-full"
            >
              <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {publishNow ? "สร้างปาร์ตี้และเปิดรับสมัครทันที" : "บันทึกเป็นฉบับร่าง"}
              </span>
            </ChristmasButton>
          </form>
        </div>
      </ChristmasCard>
    </PageContainer>
  );
}

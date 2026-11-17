"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { KeyRound, MailCheck, ShieldAlert } from "lucide-react";
import {
  MagicalSparkleBurst,
  NorthPoleMailbox3D,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  FormField,
  Input,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

export function RecoverForm({ initialInviteCode = "" }: { initialInviteCode?: string }) {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const codeId = useId();
  const emailId = useId();

  const [inviteCode, setInviteCode] = useState(initialInviteCode);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [burstActive, setBurstActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");
    setSuccessMsg("");

    const cleanCode = inviteCode
      .trim()
      .replace(/^https?:\/\/[^/]+\/join\//i, "")
      .split(/[/?#]/)[0];

    if (!cleanCode) {
      setError("กรุณาระบุรหัสกลุ่มหรือวางลิงก์เชิญ");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/members/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: cleanCode, email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถดำเนินการได้");
        return;
      }
      triggerChimeSound();
      setSuccessMsg(data.message);
      setBurstActive(true);
      window.setTimeout(() => setBurstActive(false), 2200);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer size="md" className="max-w-xl py-10 sm:py-14">
      <ChristmasCard elevated withStripe className="relative">
        <MagicalSparkleBurst active={burstActive} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>NORTH POLE DISPATCH · LINK RECOVERY</span>
              </span>
              <h1 className="thai-keep mt-1 text-xl font-bold text-snow-white sm:text-2xl">
                ขอลิงก์ส่วนตัวใหม่
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                กรอกรหัสกลุ่มและอีเมลที่ใช้ลงทะเบียน เพื่อรับลิงก์แก้ไข Wish List หรือลิงก์เปิดกล่องผลจับคู่ใหม่
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <NorthPoleMailbox3D className="h-24 w-24" />
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/25 bg-background/60 p-3.5 text-xs leading-relaxed text-text-secondary">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              เพื่อความปลอดภัย เมื่อระบบส่งลิงก์ใหม่ให้คุณ ลิงก์ส่วนตัวเดิมจะถูกยกเลิกการใช้งานทันทีโดยอัตโนมัติ
            </span>
          </div>

          {successMsg ? (
            <div className="mt-6 space-y-5 parcel-reveal">
              <Alert tone="success" title="ส่งคำขอเรียบร้อยแล้ว">
                <div className="flex flex-col items-start gap-2">
                  <p>{successMsg}</p>
                  <p className="text-xs opacity-90">
                    กรุณาตรวจสอบกล่องจดหมาย (และโฟลเดอร์ Spam) ของอีเมล {email}
                  </p>
                </div>
              </Alert>

              <div className="flex items-center justify-center rounded-2xl border border-emerald-400/35 bg-evergreen/55 p-6 text-center">
                <div>
                  <MailCheck className="mx-auto h-10 w-10 text-emerald-300" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-snow-white">
                    ระบบได้จัดส่งอีเมลลิงก์ใหม่ให้คุณแล้ว
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Link href="/" className={christmasButtonClass("secondary", "md")}>
                  กลับหน้าแรก
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              {error && <Alert tone="error">{error}</Alert>}

              <FormField
                label="รหัสกลุ่ม หรือลิงก์เชิญ"
                htmlFor={codeId}
                required
                helperText="สามารถวางทั้ง URL เช่น https://.../join/abc123 หรือเฉพาะรหัส abc123 ได้"
              >
                <Input
                  id={codeId}
                  type="text"
                  required
                  disabled={loading}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="เช่น a3x9k2m7p4 หรือวางลิงก์ /join/..."
                  className="font-mono"
                />
              </FormField>

              <FormField
                label="อีเมลที่ใช้ลงทะเบียน"
                htmlFor={emailId}
                required
                helperText="ต้องตรงกับอีเมลที่คุณใช้สมัครเข้าร่วมกลุ่ม"
              >
                <Input
                  id={emailId}
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FormField>

              <ChristmasButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="กำลังส่งคำขอ..."
                className="w-full"
              >
                ส่งลิงก์ส่วนตัวใหม่ทางอีเมล
              </ChristmasButton>
            </form>
          )}
        </div>
      </ChristmasCard>
    </PageContainer>
  );
}

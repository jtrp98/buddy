"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Gift, Lock, Sparkles, UserPlus } from "lucide-react";
import { SantaCharacter3D } from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  FormField,
  Input,
  PageContainer,
  PasswordInput,
} from "@/components/ui/ChristmasUI";

const HOST_PERKS = [
  "สร้างปาร์ตี้และแชร์ลิงก์เชิญได้ทันที",
  "เพื่อนกรอก Wish List ได้โดยไม่ต้องสมัครบัญชี",
  "ระบบสุ่มลับ 100% — ผู้จัดก็ร่วมเล่นด้วยได้",
] as const;

export default function AdminRegisterPage() {
  const router = useRouter();
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: { name?: string; email?: string; password?: string } = {};
    if (name.trim().length < 2) {
      next.name = "กรุณาระบุชื่อผู้ดูแลอย่างน้อย 2 ตัวอักษร";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    }
    if (password.length < 8) {
      next.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
        return;
      }
      triggerChimeSound();
      setSuccessMsg("สร้างบัญชี Admin สำเร็จ กำลังพาไปหน้า Santa's Mission Control...");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer size="lg" className="max-w-4xl py-10 sm:py-14">
      <ChristmasCard elevated withStripe>
        <div className="grid lg:grid-cols-12">
          {/* LEFT: Santa's Workshop Welcome Panel */}
          <div className="flex flex-col justify-between border-b border-border bg-[radial-gradient(circle_at_30%_20%,rgba(198,40,56,0.22),transparent_60%),linear-gradient(170deg,#122942_0%,#11372D_100%)] p-6 sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-background/65 px-3 py-1 text-[11px] font-bold tracking-wider text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SANTA&apos;S WORKSHOP</span>
              </span>
              <p className="font-display-en mt-4 text-2xl font-bold italic leading-tight text-primary">
                Welcome to Santa&apos;s Workshop
              </p>
              <h2 className="thai-keep mt-1.5 text-xl font-bold text-snow-white">
                เริ่มต้นจัดปาร์ตี้ Secret Buddy ของทีมคุณ
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:text-sm">
                สมัครบัญชีผู้ดูแลกิจกรรมเพียงครั้งเดียว เพื่อสร้างกลุ่ม ส่งคำเชิญ และติดตามความคืบหน้าของเพื่อน ๆ
              </p>

              <div className="my-6 flex justify-center">
                <div className="rounded-2xl border border-primary/30 bg-[#0B1728]/70 p-4 shadow-inner">
                  <SantaCharacter3D className="h-28 w-28" />
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 border-t border-white/10 pt-4">
              {HOST_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 text-xs font-medium text-text-secondary"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: Registration Form */}
          <div className="p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-christmas-red-light/40 bg-christmas-red/20 text-christmas-red-light">
                <UserPlus className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-primary uppercase">
                  NEW HOST ACCOUNT
                </span>
                <h1 className="thai-keep text-2xl font-bold text-text-primary">
                  สมัครบัญชีผู้จัดกิจกรรม (Admin)
                </h1>
              </div>
            </div>

            {error && (
              <Alert tone="error" className="mt-5">
                {error}
              </Alert>
            )}

            {successMsg && (
              <Alert tone="success" className="mt-5">
                {successMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <FormField
                label="ชื่อผู้ดูแลกิจกรรม"
                htmlFor={nameId}
                required
                helperText="ชื่อที่ใช้แสดงในระบบสำหรับผู้จัดกิจกรรม"
                error={fieldErrors.name}
              >
                <Input
                  id={nameId}
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  disabled={loading}
                  hasError={Boolean(fieldErrors.name)}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="เช่น พี่มิ้นต์ HR"
                />
              </FormField>

              <FormField
                label="อีเมล"
                htmlFor={emailId}
                required
                helperText="ใช้สำหรับเข้าสู่ระบบจัดการกลุ่มกิจกรรม"
                error={fieldErrors.email}
              >
                <Input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  hasError={Boolean(fieldErrors.email)}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="admin@example.com"
                />
              </FormField>

              <FormField
                label="รหัสผ่าน"
                htmlFor={passwordId}
                required
                helperText="ต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
                error={fieldErrors.password}
              >
                <PasswordInput
                  id={passwordId}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  hasError={Boolean(fieldErrors.password)}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
              </FormField>

              <ChristmasButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="กำลังสร้างบัญชี..."
                className="w-full"
              >
                <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>เข้าสู่ Santa&apos;s Workshop และเริ่มสร้างกิจกรรม</span>
              </ChristmasButton>
            </form>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/55 px-3.5 py-2.5 text-xs text-text-secondary">
              <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>ผู้เข้าร่วมทุกคนลงทะเบียนผ่านลิงก์เชิญได้ทันทีโดยไม่ต้องสมัครสมาชิก</span>
            </div>

            <p className="mt-6 border-t border-border pt-5 text-center text-sm text-text-secondary">
              มีบัญชี Admin อยู่แล้ว?{" "}
              <Link
                href="/admin/login"
                className="font-bold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </ChristmasCard>
    </PageContainer>
  );
}

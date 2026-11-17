"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, Sparkles } from "lucide-react";
import { SnowGlobe3D } from "@/components/illustrations/ChristmasIllustrations";
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "กรุณากรอกอีเมลให้ถูกต้อง";
    }
    if (!password) {
      next.password = "กรุณากรอกรหัสผ่าน";
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
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน");
        return;
      }
      triggerChimeSound();
      setSuccessMsg("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้า Santa's Mission Control...");
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
          {/* LEFT: Cozy Winter Welcome */}
          <div className="flex flex-col items-center justify-center border-b border-border bg-[radial-gradient(circle_at_50%_25%,rgba(232,196,122,0.16),transparent_62%),linear-gradient(170deg,#122942_0%,#0F352C_100%)] p-6 text-center sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-background/65 px-3 py-1 text-[11px] font-bold tracking-wider text-primary uppercase">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>HOST PORTAL</span>
            </span>

            <div className="my-5 rounded-2xl border border-primary/25 bg-[#0B1728]/70 p-4 shadow-inner">
              <SnowGlobe3D className="h-28 w-28" />
            </div>

            <p className="font-display-en text-2xl font-bold italic text-primary">
              Santa&apos;s Mission Control
            </p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-text-secondary sm:text-sm">
              เข้าสู่ระบบเพื่อดูแลปาร์ตี้ Secret Buddy ตรวจสอบรายชื่อผู้เข้าร่วม และเริ่มสุ่มจับคู่ความสุข
            </p>
          </div>

          {/* RIGHT: Login Form */}
          <div className="p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-evergreen/80 text-emerald-200">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-primary uppercase">
                  ADMIN LOGIN
                </span>
                <h1 className="thai-keep text-2xl font-bold text-text-primary">
                  เข้าสู่ระบบ Admin
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              เข้าสู่ระบบสำหรับผู้จัดกิจกรรม (ผู้เข้าร่วมกิจกรรมไม่ต้องเข้าสู่ระบบ)
            </p>

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
                label="อีเมล"
                htmlFor={emailId}
                required
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
                error={fieldErrors.password}
              >
                <PasswordInput
                  id={passwordId}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  hasError={Boolean(fieldErrors.password)}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </FormField>

              <ChristmasButton
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="กำลังเข้าสู่ระบบ..."
                className="w-full"
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>เข้าสู่ระบบ Mission Control</span>
              </ChristmasButton>
            </form>

            <p className="mt-6 border-t border-border pt-5 text-center text-sm text-text-secondary">
              ยังไม่มีบัญชี Admin?{" "}
              <Link
                href="/admin/register"
                className="font-bold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover"
              >
                สมัครสมาชิก Admin ฟรี
              </Link>
            </p>
          </div>
        </div>
      </ChristmasCard>
    </PageContainer>
  );
}

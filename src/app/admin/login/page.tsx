"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { LanternDoor } from "@/components/scenery/Vignettes";
import { AuthShell } from "@/components/ui/AuthShell";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  FormField,
  Input,
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
      setSuccessMsg("เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าจัดการกิจกรรม...");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      vignette={<LanternDoor className="h-32 w-auto lg:h-48" />}
      tagline="ยินดีต้อนรับกลับมา"
      taglineSub="ดูแลปาร์ตี้ Secret Buddy ตรวจรายชื่อผู้เข้าร่วม และเริ่มจับคู่ความสุข"
      eyebrow="สำหรับผู้จัดกิจกรรม"
      title="เข้าสู่ระบบ Admin"
      description="ผู้เข้าร่วมกิจกรรมไม่ต้องเข้าสู่ระบบ ใช้ลิงก์เชิญหรือลิงก์ส่วนตัวในอีเมลได้เลย"
      footer={
        <>
          ยังไม่มีบัญชี Admin?{" "}
          <Link
            href="/admin/register"
            className="font-bold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover"
          >
            สมัครฟรี
          </Link>
        </>
      }
    >
    {error && (
      <Alert tone="error" className="mb-5">
        {error}
      </Alert>
    )}

    {successMsg && (
      <Alert tone="success" className="mb-5">
        {successMsg}
      </Alert>
    )}

    <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
        <span>เข้าสู่ระบบ</span>
      </ChristmasButton>
    </form>
    </AuthShell>
  );
}

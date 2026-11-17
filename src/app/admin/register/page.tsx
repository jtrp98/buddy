"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Gift, Lock } from "lucide-react";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { AuthShell } from "@/components/ui/AuthShell";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  Alert,
  ChristmasButton,
  FormField,
  Input,
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
      setSuccessMsg("สร้างบัญชี Admin สำเร็จ กำลังพาไปหน้า หน้าจัดการกิจกรรม...");
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
      vignette={<ChristmasTree stage={3} ground={false} className="h-36 w-auto lg:h-52" />}
      tagline="เริ่มตกแต่งต้นไม้ของกลุ่มคุณ"
      taglineSub="สมัครครั้งเดียว สร้างกลุ่ม ส่งคำเชิญ และดูต้นคริสต์มาสสว่างขึ้นเมื่อเพื่อนตอบรับ"
      eyebrow="บัญชีผู้จัดกิจกรรมใหม่"
      title="สมัครบัญชี Admin"
      description={
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          {HOST_PERKS.map((perk) => (
            <span key={perk} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {perk}
            </span>
          ))}
        </span>
      }
      footer={
        <>
          มีบัญชี Admin อยู่แล้ว?{" "}
          <Link
            href="/admin/login"
            className="font-bold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover"
          >
            เข้าสู่ระบบ
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
          placeholder="เช่น พี่มิ้นต์"
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
        <span>สร้างบัญชีและเริ่มจัดกิจกรรม</span>
      </ChristmasButton>
    </form>

    <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-xs text-text-secondary">
      <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span>ผู้เข้าร่วมทุกคนลงทะเบียนผ่านลิงก์เชิญได้ทันทีโดยไม่ต้องสมัครสมาชิก</span>
    </div>
    </AuthShell>
  );
}

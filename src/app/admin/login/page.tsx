"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { CandyStripeBar, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

export default function AdminLoginPage() {
  const router = useRouter();
  const { triggerClickSound } = useFestiveAtmosphere();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="analog-card-lg printed-double-rule overflow-hidden rounded-md">
        <CandyStripeBar />
        <div className="relative z-10 p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <WaxSeal tone="green" size="md">
              <LogIn className="h-5 w-5" />
            </WaxSeal>
            <div>
              <span className="font-type text-[10px] font-bold tracking-[0.16em] text-pine uppercase">
                WORKSHOP STAFF PASS
              </span>
              <h1 className="thai-keep letterpress font-display text-2xl text-ink">
                เข้าสู่ระบบ Admin
              </h1>
            </div>
          </div>

          <p className="mt-2.5 text-sm leading-[1.7] text-ink-soft">
            เข้าสู่ระบบเพื่อสร้างและจัดการกลุ่ม Secret Buddy ของคุณ
          </p>

          {error && (
            <div className="mt-4 rounded border border-xmas-red/45 bg-red-wash px-4 py-3 text-sm font-medium text-xmas-red-deep">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block font-serif text-sm font-bold text-ink">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-serif text-sm font-bold text-ink">รหัสผ่าน</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="analog-btn-lg min-h-[46px] w-full rounded bg-xmas-red py-3 text-sm font-bold text-paper hover:bg-xmas-red-deep disabled:opacity-60"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 border-t border-dashed border-rule pt-4 text-center text-sm text-ink-soft">
            ยังไม่มีบัญชี Admin?{" "}
            <Link
              href="/admin/register"
              className="font-bold text-xmas-red underline decoration-dashed underline-offset-4 hover:text-pine"
            >
              สมัครสมาชิก Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

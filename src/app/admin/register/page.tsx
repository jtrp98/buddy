"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { CandyStripeBar, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { triggerClickSound } = useFestiveAtmosphere();
  const [name, setName] = useState("");
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
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
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
      <div className="analog-card-lg overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-8">
          <div className="flex items-center gap-3">
            <WaxSeal tone="red" size="md">
              <UserPlus className="h-5 w-5" />
            </WaxSeal>
            <div>
              <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#9e221d] uppercase">
                NEW HOST BADGE
              </span>
              <h1 className="text-2xl font-bold text-[#2a1f1b]">สมัครบัญชี Admin</h1>
            </div>
          </div>

          <p className="mt-2.5 text-sm text-[#675449]">
            สร้างบัญชีสำหรับผู้จัดกิจกรรม Secret Buddy (สมาชิกที่เข้าร่วมไม่ต้องสมัครบัญชี)
          </p>

          {error && (
            <div className="mt-4 rounded-xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                ชื่อผู้ดูแลกิจกรรม
              </label>
              <input
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น พี่มิ้นต์ HR"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="analog-btn-lg w-full rounded-xl bg-[#c8322b] py-3 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923] disabled:opacity-60"
            >
              {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิกและเริ่มใช้งาน"}
            </button>
          </form>

          <p className="mt-6 border-t-2 border-dashed border-[#cbb7a6] pt-4 text-center text-sm text-[#675449]">
            มีบัญชี Admin อยู่แล้ว?{" "}
            <Link
              href="/admin/login"
              className="font-bold text-[#c8322b] underline decoration-dashed underline-offset-4 hover:text-[#1f5e46]"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

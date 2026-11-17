"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, Gift, Save, XCircle } from "lucide-react";
import {
  BuddyProfileFormFields,
  EMPTY_BUDDY_PROFILE,
  type BuddyProfileValues,
} from "@/components/BuddyProfileFormFields";
import { StatusBadge } from "@/components/StatusBadge";
import { CandyStripeBar, WashiTape } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";

interface ProfileResponse {
  profile: {
    displayName: string;
    email: string;
    interests: string[];
    interestOther: string | null;
    favoriteColor: string | null;
    favoriteFoodDrink: string | null;
    hobbies: string | null;
    giftStyle: string | null;
    dislikes: string | null;
    allergies: string | null;
    wishList: string | null;
    noteToBuddy: string | null;
  };
  group: {
    id: string;
    title: string;
    inviteCode: string;
    budgetType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    registrationClosesAt: string;
    status: string;
  };
  canEdit: boolean;
}

function ProfileEditorContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "ไม่พบลิงก์ส่วนตัวของคุณ");
  const [group, setGroup] = useState<ProfileResponse["group"] | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<BuddyProfileValues>(EMPTY_BUDDY_PROFILE);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members/profile", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "ไม่สามารถโหลดข้อมูลส่วนตัวได้");
          setLoading(false);
          return;
        }
        const typed = data as ProfileResponse;
        setGroup(typed.group);
        setCanEdit(typed.canEdit);
        setDisplayName(typed.profile.displayName);
        setEmail(typed.profile.email);
        setProfile({
          interests: typed.profile.interests || [],
          interestOther: typed.profile.interestOther || "",
          favoriteColor: typed.profile.favoriteColor || "",
          favoriteFoodDrink: typed.profile.favoriteFoodDrink || "",
          hobbies: typed.profile.hobbies || "",
          giftStyle: typed.profile.giftStyle || "",
          dislikes: typed.profile.dislikes || "",
          allergies: typed.profile.allergies || "",
          wishList: typed.profile.wishList || "",
          noteToBuddy: typed.profile.noteToBuddy || "",
        });
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    triggerClickSound();
    setSaveError("");
    setSaveMessage("");

    if (profile.interests.length === 0) {
      setSaveError("กรุณาเลือกความชอบอย่างน้อย 1 หมวดหมู่");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/members/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          ...profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "บันทึกไม่สำเร็จ");
        return;
      }
      triggerChimeSound();
      setSaveMessage("บันทึกข้อมูล Buddy Profile เรียบร้อยแล้ว!");
    } catch {
      setSaveError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="analog-card rounded-3xl p-10 text-center text-sm font-bold text-[#675449]">
        กำลังโหลดข้อมูลของคุณ...
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="analog-card rounded-3xl p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-[#c8322b]" />
        <h1 className="mt-4 text-xl font-bold text-[#2a1f1b]">ไม่สามารถเข้าถึงข้อมูลได้</h1>
        <p className="mt-2 text-sm font-medium text-[#9e221d]">{error}</p>
        <Link
          href="/recover"
          className="analog-btn-lg mt-6 inline-flex rounded-xl bg-[#c8322b] px-5 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
        >
          ขอลิงก์ส่วนตัวใหม่
        </Link>
      </div>
    );
  }

  const isPreDraw = group.status === "OPEN" || group.status === "DRAFT";

  return (
    <div className="space-y-6">
      <section className="analog-card overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={group.status} />
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a1f1b] bg-[#fdf6e9] px-3 py-1 text-xs font-bold text-[#5c493e]">
              <CalendarClock className="h-3.5 w-3.5 text-[#c8322b]" />
              ปิดรับสมัคร: {formatThaiDateTime(group.registrationClosesAt)}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#2a1f1b]">
            Buddy Profile ของคุณ — {group.title}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-[#2a1f1b] bg-[#fde2df] px-3 py-1 text-sm font-bold text-[#9e221d]">
            <Gift className="h-4 w-4" />
            <span>
              งบประมาณของขวัญ:{" "}
              {formatBudget(group.budgetType, group.budgetMin, group.budgetMax)}
            </span>
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="analog-card-lg relative space-y-6 rounded-3xl p-6 sm:p-8"
      >
        <WashiTape tone="red" className="absolute -top-2.5 left-8 -rotate-3" />

        {saveMessage && (
          <div className="flex items-center gap-2 rounded-xl border-2 border-[#1f5e46] bg-[#edf7f1] px-4 py-3 text-sm font-bold text-[#154231]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {saveError && (
          <div className="rounded-xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
            {saveError}
          </div>
        )}

        {!canEdit && (
          <div className="rounded-xl border-2 border-[#2a1f1b] bg-[#efe5d5] px-4 py-3 text-sm font-bold text-[#4d3d35]">
            กิจกรรมนี้จบลงแล้ว จึงไม่สามารถแก้ไขข้อมูลได้
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-[#2a1f1b]">
              ชื่อ / ชื่อเล่น
            </label>
            <input
              type="text"
              required
              disabled={!canEdit || !isPreDraw}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
            />
            {!isPreDraw && (
              <p className="mt-1 text-[11px] text-[#675449]">
                หลังสุ่มจับคู่แล้วจะไม่สามารถเปลี่ยนชื่อได้ (แต่ยังแก้ไขความชอบและ Wish List ได้)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2a1f1b]">
              อีเมลที่ลงทะเบียน
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <hr className="border-t-2 border-dashed border-[#cbb7a6]" />

        <BuddyProfileFormFields
          value={profile}
          onChange={setProfile}
          disabled={!canEdit}
        />

        {canEdit && (
          <button
            type="submit"
            disabled={saving}
            className="analog-btn-lg inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f5e46] py-3.5 text-sm font-bold text-[#fffdf7] hover:bg-[#174a37] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
          </button>
        )}
      </form>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="analog-card rounded-3xl p-10 text-center text-sm font-bold text-[#675449]">
            กำลังโหลด...
          </div>
        }
      >
        <ProfileEditorContent />
      </Suspense>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarClock, Gift, KeyRound, Save } from "lucide-react";
import {
  BuddyProfileFormFields,
  EMPTY_BUDDY_PROFILE,
  type BuddyProfileValues,
} from "@/components/BuddyProfileFormFields";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import { StatusBadge } from "@/components/StatusBadge";
import {
  WishListGiftStack3D,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  EmptyState,
  FormField,
  Input,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";
import { SnowGlobeKey } from "@/components/scenery/Vignettes";

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

  const nameId = useId();
  const emailId = useId();

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
      setSaveError("กรุณาเลือกหมวดหมู่ความชอบอย่างน้อย 1 ข้อ");
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
      setSaveMessage(
        data.notifiedSanta
          ? "บันทึกข้อมูลเรียบร้อย และส่งอีเมลแจ้งข้อมูลล่าสุดให้ซานต้าของคุณแล้ว!"
          : "บันทึก Buddy Profile & Wish List เรียบร้อยแล้ว!"
      );
    } catch {
      setSaveError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="กำลังโหลดข้อมูล Buddy Profile ของคุณ..." rows={4} />;
  }

  if (error || !group) {
    return (
      <EmptyState
        icon={<SnowGlobeKey className="h-32 w-auto" />}
        title="ไม่สามารถเข้าถึงหน้าแก้ไขโปรไฟล์ได้"
        description={error || "ลิงก์ส่วนตัวนี้อาจไม่ถูกต้องหรือถูกยกเลิกแล้ว"}
        action={
          <Link href="/recover" className={christmasButtonClass("primary", "md")}>
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>ขอลิงก์ส่วนตัวใหม่</span>
          </Link>
        }
      />
    );
  }

  const isPreDraw = group.status === "OPEN" || group.status === "DRAFT";
  const journeyStep = group.status === "ACTIVE" || group.status === "COMPLETED" ? 4 : 3;

  return (
    <div className="space-y-6">
      <ChristmasJourney mode="participant" currentStep={journeyStep} />

      <header className="rise-in flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={group.status} />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <CalendarClock className="h-3.5 w-3.5 text-christmas-red-light" aria-hidden="true" />
              ปิดรับสมัคร {formatThaiDateTime(group.registrationClosesAt)}
            </span>
          </div>
          <p className="mt-4 font-script text-2xl text-primary">จดหมายถึงซานต้าของคุณ</p>
          <h1 className="thai-keep mt-1 text-3xl leading-tight text-text-primary sm:text-4xl">
            Buddy Profile · {group.title}
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
            งบประมาณของขวัญ {formatBudget(group.budgetType, group.budgetMin, group.budgetMax)}
          </p>
        </div>
        <WishListGiftStack3D className="hidden h-24 w-24 shrink-0 sm:block" />
      </header>

      <ChristmasCard tone="paper" className="relative">
        <div aria-hidden="true" className="paper-frame" />
        <form onSubmit={handleSave} className="relative space-y-6 p-6 sm:p-10">
          {saveMessage && <Alert tone="success">{saveMessage}</Alert>}
          {saveError && <Alert tone="error">{saveError}</Alert>}

          {!canEdit && (
            <Alert tone="info">
              กิจกรรมนี้จบลงแล้ว จึงไม่สามารถแก้ไขข้อมูลได้
            </Alert>
          )}

          {canEdit && !isPreDraw && (
            <Alert tone="info">
              คุณยังสามารถเพิ่มหรือแก้ไขข้อมูลความชอบและ Wish List ได้ตลอดกิจกรรม เมื่อกดบันทึก ระบบจะส่งอีเมลแจ้งข้อมูลล่าสุดให้ซานต้าของคุณทราบโดยอัตโนมัติ
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="ชื่อ / ชื่อเล่น"
              htmlFor={nameId}
              required
              helperText={
                !isPreDraw
                  ? "หลังสุ่มจับคู่แล้วจะไม่สามารถเปลี่ยนชื่อได้ (แต่ยังแก้ไขความชอบและ Wish List ได้)"
                  : undefined
              }
            >
              <Input
                id={nameId}
                type="text"
                required
                disabled={!canEdit || !isPreDraw || saving}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </FormField>

            <FormField label="อีเมลที่ลงทะเบียน" htmlFor={emailId}>
              <Input id={emailId} type="email" disabled value={email} />
            </FormField>
          </div>

          <div className="border-t border-border pt-6">
            <BuddyProfileFormFields
              value={profile}
              onChange={setProfile}
              disabled={!canEdit || saving}
            />
          </div>

          {canEdit && (
            <ChristmasButton
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              loadingText="กำลังบันทึก..."
              className="w-full"
            >
              <Save className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>บันทึก Buddy Profile &amp; Wish List</span>
            </ChristmasButton>
          )}
        </form>
      </ChristmasCard>
    </div>
  );
}

export default function MyProfilePage() {
  return (
    <PageContainer size="md">
      <Suspense fallback={<LoadingState label="กำลังโหลด..." rows={4} />}>
        <ProfileEditorContent />
      </Suspense>
    </PageContainer>
  );
}

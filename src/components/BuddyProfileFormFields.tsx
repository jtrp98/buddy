"use client";

import { useId } from "react";
import { BUDDY_INTEREST_OPTIONS } from "@/lib/constants";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { WishListGiftStack3D } from "@/components/illustrations/ChristmasIllustrations";
import { FormField, Input, Textarea } from "@/components/ui/ChristmasUI";
import {
  AlertOctagon,
  BookOpen,
  Check,
  Coffee,
  Cookie,
  Gift,
  Headphones,
  Heart,
  MessageSquareHeart,
  Palette,
  PenTool,
  Plus,
  Shirt,
  Sparkles,
  Sprout,
  ThumbsDown,
} from "lucide-react";

export interface BuddyProfileValues {
  interests: string[];
  interestOther: string;
  favoriteColor: string;
  favoriteFoodDrink: string;
  hobbies: string;
  giftStyle: string;
  dislikes: string;
  allergies: string;
  wishList: string;
  noteToBuddy: string;
}

export const EMPTY_BUDDY_PROFILE: BuddyProfileValues = {
  interests: [],
  interestOther: "",
  favoriteColor: "",
  favoriteFoodDrink: "",
  hobbies: "",
  giftStyle: "",
  dislikes: "",
  allergies: "",
  wishList: "",
  noteToBuddy: "",
};

const INTEREST_ICONS: Record<string, React.ReactNode> = {
  snacks: <Cookie className="h-4 w-4 shrink-0" aria-hidden="true" />,
  coffee_tea: <Coffee className="h-4 w-4 shrink-0" aria-hidden="true" />,
  books: <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />,
  stationery: <PenTool className="h-4 w-4 shrink-0" aria-hidden="true" />,
  tech: <Headphones className="h-4 w-4 shrink-0" aria-hidden="true" />,
  plants: <Sprout className="h-4 w-4 shrink-0" aria-hidden="true" />,
  plushies: <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />,
  skincare: <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />,
  daily_use: <Shirt className="h-4 w-4 shrink-0" aria-hidden="true" />,
  other: <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />,
};

const WISHLIST_IDEAS = [
  "แก้วเก็บความเย็น",
  "เมล็ดกาแฟ / ชาหอม ๆ",
  "เทียนหอม",
  "สมุดโน้ตปกแข็ง",
  "ช็อกโกแลต / ขนมพรีเมียม",
  "ของแต่งโต๊ะทำงาน",
] as const;

interface BuddyProfileFormFieldsProps {
  value: BuddyProfileValues;
  onChange: (next: BuddyProfileValues) => void;
  disabled?: boolean;
}

export function BuddyProfileFormFields({
  value,
  onChange,
  disabled = false,
}: BuddyProfileFormFieldsProps) {
  const { triggerClickSound } = useFestiveAtmosphere();

  const otherId = useId();
  const colorId = useId();
  const foodId = useId();
  const hobbiesId = useId();
  const styleId = useId();
  const dislikesId = useId();
  const allergiesId = useId();
  const wishListId = useId();
  const noteId = useId();

  const toggleInterest = (key: string) => {
    if (disabled) return;
    triggerClickSound();
    const exists = value.interests.includes(key);
    const nextInterests = exists
      ? value.interests.filter((k) => k !== key)
      : [...value.interests, key];
    onChange({ ...value, interests: nextInterests });
  };

  const setField = (field: keyof BuddyProfileValues, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const addWishIdea = (idea: string) => {
    if (disabled) return;
    triggerClickSound();
    const current = value.wishList.trim();
    if (current.includes(idea)) return;
    const next = current ? `${current}, ${idea}` : idea;
    setField("wishList", next);
  };

  const hasOther = value.interests.includes("other");

  return (
    <div className="space-y-8">
      {/* Group 1: Gift Preferences */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-primary sm:text-lg">
              ความชอบและสไตล์ของขวัญ (Gift Preferences)
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              เลือกหมวดหมู่ที่สนใจอย่างน้อย 1 ข้อ เพื่อเป็นเบาะแสให้ Buddy เลือกของขวัญได้ตรงใจ
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-primary/40 bg-background/70 px-3 py-1 text-xs font-bold text-primary">
            เลือกแล้ว {value.interests.length} หมวดหมู่
          </span>
        </div>

        <div>
          <div className="text-sm font-semibold text-snow-white">
            หมวดหมู่ของขวัญที่สนใจ <span className="text-christmas-red-light">*</span>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {BUDDY_INTEREST_OPTIONS.map((opt) => {
              const selected = value.interests.includes(opt.key);
              const icon = INTEREST_ICONS[opt.key] ?? (
                <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
              );
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => toggleInterest(opt.key)}
                  className={`analog-btn thai-keep flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                    selected
                      ? "border-primary bg-gradient-to-br from-primary/20 to-christmas-red/15 text-snow-white ring-1 ring-primary shadow-[0_0_16px_rgba(232,196,122,0.16)]"
                      : "border-border bg-background/60 text-text-secondary hover:border-white/35 hover:text-snow-white"
                  } disabled:cursor-not-allowed disabled:opacity-55`}
                >
                  <span className="flex items-center gap-2">
                    <span className={selected ? "text-primary" : "text-emerald-300"}>
                      {icon}
                    </span>
                    <span>{opt.label}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-white/30 bg-surface text-transparent"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </button>
              );
            })}
          </div>

          {hasOther && (
            <div className="mt-3 rounded-xl border border-primary/40 bg-background/70 p-4">
              <FormField
                label="ระบุความชอบอื่น ๆ เพิ่มเติม"
                htmlFor={otherId}
                helperText="ใส่รายละเอียดเพิ่มเติมเพื่อให้ Buddy เข้าใจสไตล์ของคุณมากขึ้น"
              >
                <Input
                  id={otherId}
                  type="text"
                  disabled={disabled}
                  value={value.interestOther}
                  onChange={(e) => setField("interestOther", e.target.value)}
                  placeholder="เช่น แผ่นเสียง, ของแต่งโต๊ะคอม, เทียนหอม..."
                />
              </FormField>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>สีที่ชอบ</span>
              </span>
            }
            htmlFor={colorId}
          >
            <Input
              id={colorId}
              type="text"
              disabled={disabled}
              value={value.favoriteColor}
              onChange={(e) => setField("favoriteColor", e.target.value)}
              placeholder="เช่น เอิร์ธโทน, เขียวมัทฉะ, แดงเบอร์กันดี"
            />
          </FormField>

          <FormField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Coffee className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>อาหารหรือเครื่องดื่มโปรด</span>
              </span>
            }
            htmlFor={foodId}
          >
            <Input
              id={foodId}
              type="text"
              disabled={disabled}
              value={value.favoriteFoodDrink}
              onChange={(e) => setField("favoriteFoodDrink", e.target.value)}
              placeholder="เช่น ลาเต้เย็นไม่หวาน, ชาเขียว, ช็อกโกแลต"
            />
          </FormField>

          <FormField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-christmas-red-light" aria-hidden="true" />
                <span>งานอดิเรก</span>
              </span>
            }
            htmlFor={hobbiesId}
          >
            <Input
              id={hobbiesId}
              type="text"
              disabled={disabled}
              value={value.hobbies}
              onChange={(e) => setField("hobbies", e.target.value)}
              placeholder="เช่น อ่านนิยาย, วิ่ง, ถ่ายรูปฟิล์ม, เล่นบอร์ดเกม"
            />
          </FormField>

          <FormField
            label={
              <span className="inline-flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <span>สไตล์ของขวัญที่ชอบ</span>
              </span>
            }
            htmlFor={styleId}
          >
            <Input
              id={styleId}
              type="text"
              disabled={disabled}
              value={value.giftStyle}
              onChange={(e) => setField("giftStyle", e.target.value)}
              placeholder="เช่น มินิมอล, ใช้งานได้จริง, วินเทจ, ของกิน"
            />
          </FormField>
        </div>
      </section>

      {/* Group 2: Dislikes & Allergies */}
      <section className="space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="text-base font-bold text-christmas-red-light">
            สิ่งที่ไม่ชอบและอาการแพ้ (Dislikes &amp; Allergies)
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
            ช่วยให้ Buddy หลีกเลี่ยงของที่คุณแพ้หรือไม่สะดวกใช้งานได้อย่างปลอดภัย
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-400/35 bg-amber-950/35 p-4">
            <FormField
              label={
                <span className="inline-flex items-center gap-1.5 text-amber-200">
                  <ThumbsDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>สิ่งที่ไม่ชอบ</span>
                </span>
              }
              htmlFor={dislikesId}
            >
              <Textarea
                id={dislikesId}
                rows={2}
                disabled={disabled}
                value={value.dislikes}
                onChange={(e) => setField("dislikes", e.target.value)}
                placeholder="เช่น น้ำหอมกลิ่นฉุน, ตุ๊กตาตัวใหญ่"
              />
            </FormField>
          </div>

          <div className="rounded-2xl border border-christmas-red-light/45 bg-[#45111C]/55 p-4">
            <FormField
              label={
                <span className="inline-flex items-center gap-1.5 text-[#FFE8EC]">
                  <AlertOctagon className="h-4 w-4 shrink-0 text-christmas-red-light" aria-hidden="true" />
                  <span>สิ่งที่แพ้หรือควรหลีกเลี่ยง (ไม่บังคับ)</span>
                </span>
              }
              htmlFor={allergiesId}
            >
              <Textarea
                id={allergiesId}
                rows={2}
                disabled={disabled}
                value={value.allergies}
                onChange={(e) => setField("allergies", e.target.value)}
                placeholder="เช่น แพ้ถั่ว, แพ้นมวัว, แพ้แอลกอฮอล์"
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* Group 3: Christmas Wish List Showcase & Personal Note */}
      <section className="space-y-5 border-t border-border pt-6">
        <div className="rounded-2xl border border-primary/40 bg-[radial-gradient(circle_at_90%_15%,rgba(232,196,122,0.14),transparent_55%),linear-gradient(160deg,rgba(18,61,50,0.85)_0%,rgba(12,30,49,0.92)_100%)] p-5 sm:p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-display-en text-sm font-semibold italic text-primary">
                What&apos;s on Your Christmas Wish List?
              </span>
              <h3 className="mt-0.5 text-lg font-bold text-snow-white">
                ใบขอพร Christmas Wish List ของคุณ
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm">
                บอกใบ้ของขวัญที่อยากได้ในใจให้ซานต้าประจำทีม หรือกดเลือกไอเดียแนะนำด้านล่างได้เลย
              </p>
            </div>
            <div className="hidden shrink-0 sm:block">
              <WishListGiftStack3D className="h-20 w-20" />
            </div>
          </div>

          <div className="mt-4">
            <FormField
              label={
                <span className="inline-flex items-center gap-1.5 text-emerald-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>Wish List ของที่อยากได้</span>
                </span>
              }
              htmlFor={wishListId}
              helperText="ใส่ได้มากกว่า 1 อย่างเพื่อเป็นตัวเลือกให้ Buddy เซอร์ไพรส์คุณ"
            >
              <Textarea
                id={wishListId}
                rows={3}
                disabled={disabled}
                value={value.wishList}
                onChange={(e) => setField("wishList", e.target.value)}
                placeholder="เช่น แก้วเก็บความเย็นสีเข้ม, สมุดโน้ตปกแข็ง, เมล็ดกาแฟคั่วกลาง"
              />
            </FormField>

            {!disabled && (
              <div className="mt-3">
                <span className="block text-[11px] font-bold tracking-wider text-primary uppercase">
                  แตะเพื่อเพิ่มไอเดียยอดฮิต:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {WISHLIST_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => addWishIdea(idea)}
                      className="analog-btn inline-flex min-h-[34px] items-center gap-1 rounded-full border border-primary/35 bg-background/70 px-3 py-1 text-xs font-semibold text-snow-white transition hover:border-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3 w-3 text-primary" aria-hidden="true" />
                      <span>{idea}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <FormField
          label={
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareHeart className="h-4 w-4 text-christmas-red-light" aria-hidden="true" />
              <span>ข้อความเพิ่มเติมถึง Buddy</span>
            </span>
          }
          htmlFor={noteId}
        >
          <Textarea
            id={noteId}
            rows={2}
            disabled={disabled}
            value={value.noteToBuddy}
            onChange={(e) => setField("noteToBuddy", e.target.value)}
            placeholder="ฝากข้อความน่ารัก ๆ ถึงคนที่จะมาดูแลคุณได้เลย!"
          />
        </FormField>
      </section>
    </div>
  );
}

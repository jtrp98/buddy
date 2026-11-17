"use client";

import { BUDDY_INTEREST_OPTIONS } from "@/lib/constants";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
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
  snacks: <Cookie className="h-3.5 w-3.5 shrink-0" />,
  coffee_tea: <Coffee className="h-3.5 w-3.5 shrink-0" />,
  books: <BookOpen className="h-3.5 w-3.5 shrink-0" />,
  stationery: <PenTool className="h-3.5 w-3.5 shrink-0" />,
  tech: <Headphones className="h-3.5 w-3.5 shrink-0" />,
  plants: <Sprout className="h-3.5 w-3.5 shrink-0" />,
  plushies: <Heart className="h-3.5 w-3.5 shrink-0" />,
  skincare: <Sparkles className="h-3.5 w-3.5 shrink-0" />,
  daily_use: <Shirt className="h-3.5 w-3.5 shrink-0" />,
  other: <Gift className="h-3.5 w-3.5 shrink-0" />,
};

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

  const hasOther = value.interests.includes("other");

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-serif text-sm font-bold text-ink">
          สิ่งที่ชอบ / หมวดหมู่ของขวัญที่สนใจ <span className="text-xmas-red">*</span>
        </label>
        <p className="mt-0.5 text-xs text-ink-soft">
          กดเลือกบัตรหมวดหมู่ได้มากกว่า 1 ข้อ เพื่อช่วยให้ Buddy เลือกของขวัญได้ตรงใจมากขึ้น
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {BUDDY_INTEREST_OPTIONS.map((opt) => {
            const selected = value.interests.includes(opt.key);
            const icon = INTEREST_ICONS[opt.key] ?? <Gift className="h-3.5 w-3.5 shrink-0" />;
            return (
              <button
                key={opt.key}
                type="button"
                disabled={disabled}
                onClick={() => toggleInterest(opt.key)}
                className={`analog-btn thai-keep flex min-h-[44px] items-center justify-between gap-2 rounded px-3 py-2 text-left text-xs font-semibold sm:text-sm ${
                  selected
                    ? "border-xmas-red/45 bg-red-wash text-xmas-red-deep"
                    : "bg-paper text-ink hover:bg-cream"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={selected ? "text-xmas-red" : "text-pine"}>
                    {icon}
                  </span>
                  <span>{opt.label}</span>
                </span>
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border ${
                    selected
                      ? "border-xmas-red bg-xmas-red text-paper"
                      : "border-ink/35 bg-paper text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              </button>
            );
          })}
        </div>

        {hasOther && (
          <div className="mt-3 rounded border border-dashed border-rule bg-cream p-3">
            <label className="block font-serif text-xs font-bold text-ink">
              ระบุความชอบอื่น ๆ เพิ่มเติม
            </label>
            <input
              type="text"
              disabled={disabled}
              value={value.interestOther}
              onChange={(e) => setField("interestOther", e.target.value)}
              placeholder="เช่น แผ่นเสียง, ของแต่งโต๊ะคอม, เทียนหอม..."
              className="analog-input mt-1.5 w-full rounded px-3.5 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
            <Palette className="h-3.5 w-3.5 text-xmas-red" />
            <span>สีที่ชอบ</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.favoriteColor}
            onChange={(e) => setField("favoriteColor", e.target.value)}
            placeholder="เช่น เอิร์ธโทน, เขียวมัทฉะ, แดงเบอร์กันดี"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
            <Coffee className="h-3.5 w-3.5 text-gold-ink" />
            <span>อาหารหรือเครื่องดื่มโปรด</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.favoriteFoodDrink}
            onChange={(e) => setField("favoriteFoodDrink", e.target.value)}
            placeholder="เช่น ลาเต้เย็นไม่หวาน, ชาเขียว, ช็อกโกแลต"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
            <Heart className="h-3.5 w-3.5 text-xmas-red" />
            <span>งานอดิเรก</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.hobbies}
            onChange={(e) => setField("hobbies", e.target.value)}
            placeholder="เช่น อ่านนิยาย, วิ่ง, ถ่ายรูปฟิล์ม, เล่นบอร์ดเกม"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
            <Gift className="h-3.5 w-3.5 text-pine" />
            <span>สไตล์ของขวัญที่ชอบ</span>
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.giftStyle}
            onChange={(e) => setField("giftStyle", e.target.value)}
            placeholder="เช่น มินิมอล, ใช้งานได้จริง, วินเทจ, ของกิน"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-amber-ink/40 bg-amber-wash/70 p-3.5">
          <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-amber-ink">
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>สิ่งที่ไม่ชอบ</span>
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={value.dislikes}
            onChange={(e) => setField("dislikes", e.target.value)}
            placeholder="เช่น น้ำหอมกลิ่นฉุน, ตุ๊กตาตัวใหญ่"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2 text-sm"
          />
        </div>

        <div className="rounded border border-xmas-red/40 bg-red-wash/75 p-3.5">
          <label className="flex flex-wrap items-center gap-1.5 font-serif text-sm font-bold text-xmas-red-deep">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>สิ่งที่แพ้หรือควรหลีกเลี่ยง</span>
            <span className="text-xs font-medium text-xmas-red">(ไม่บังคับ)</span>
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={value.allergies}
            onChange={(e) => setField("allergies", e.target.value)}
            placeholder="เช่น แพ้ถั่ว, แพ้นมวัว, แพ้แอลกอฮอล์"
            className="analog-input mt-1.5 w-full rounded px-3.5 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded border border-pine/40 bg-pine-wash/70 p-4">
        <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-pine-deep">
          <Sparkles className="h-4 w-4 text-pine" />
          <span>Wish List ของที่อยากได้</span>
        </label>
        <textarea
          rows={3}
          disabled={disabled}
          value={value.wishList}
          onChange={(e) => setField("wishList", e.target.value)}
          placeholder="ใส่ไอเดียของขวัญที่อยากได้ในช่วงงบนี้ เช่น แก้วเก็บความเย็น, สมุดโน้ตปกแข็ง, เมล็ดกาแฟคั่วกลาง"
          className="analog-input mt-2 w-full rounded px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 font-serif text-sm font-bold text-ink">
          <MessageSquareHeart className="h-3.5 w-3.5 text-xmas-red" />
          <span>ข้อความเพิ่มเติมถึง Buddy</span>
        </label>
        <textarea
          rows={2}
          disabled={disabled}
          value={value.noteToBuddy}
          onChange={(e) => setField("noteToBuddy", e.target.value)}
          placeholder="ฝากข้อความน่ารัก ๆ ถึงคนที่จะมาดูแลเราได้เลย!"
          className="analog-input mt-1.5 w-full rounded px-3.5 py-2.5 text-sm"
        />
      </div>
    </div>
  );
}

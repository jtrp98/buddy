"use client";

import { BUDDY_INTEREST_OPTIONS } from "@/lib/constants";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { Check } from "lucide-react";

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

const INTEREST_ICONS: Record<string, string> = {
  snacks: "🍪",
  coffee_tea: "☕",
  books: "📚",
  stationery: "✒️",
  tech: "🎧",
  plants: "🌲",
  plushies: "🧸",
  skincare: "🧴",
  daily_use: "🧦",
  other: "🎁",
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
        <label className="block text-sm font-bold text-[#2a1f1b]">
          สิ่งที่ชอบ / หมวดหมู่ของขวัญที่สนใจ <span className="text-[#c8322b]">*</span>
        </label>
        <p className="mt-0.5 text-xs text-[#675449]">
          กดเลือกการ์ดสติกเกอร์ได้มากกว่า 1 ข้อ เพื่อช่วยให้ Buddy เลือกของขวัญได้ตรงใจมากขึ้น
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {BUDDY_INTEREST_OPTIONS.map((opt) => {
            const selected = value.interests.includes(opt.key);
            const icon = INTEREST_ICONS[opt.key] ?? "🎄";
            return (
              <button
                key={opt.key}
                type="button"
                disabled={disabled}
                onClick={() => toggleInterest(opt.key)}
                className={`analog-btn flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm font-semibold ${
                  selected
                    ? "bg-[#fde2df] text-[#9e221d]"
                    : "bg-[#fffdf7] text-[#2a1f1b] hover:bg-[#f6eddd]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-base leading-none">
                    {icon}
                  </span>
                  <span>{opt.label}</span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[#2a1f1b] ${
                    selected
                      ? "bg-[#c8322b] text-[#fffdf7]"
                      : "bg-[#fffdf7] text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              </button>
            );
          })}
        </div>

        {hasOther && (
          <div className="mt-3 rounded-xl border-2 border-dashed border-[#cbb7a6] bg-[#fdf6e9] p-3">
            <label className="block text-xs font-bold text-[#2a1f1b]">
              ระบุความชอบอื่น ๆ เพิ่มเติม
            </label>
            <input
              type="text"
              disabled={disabled}
              value={value.interestOther}
              onChange={(e) => setField("interestOther", e.target.value)}
              placeholder="เช่น แผ่นเสียง, ของแต่งโต๊ะคอม, เทียนหอม..."
              className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-[#2a1f1b]">🎨 สีที่ชอบ</label>
          <input
            type="text"
            disabled={disabled}
            value={value.favoriteColor}
            onChange={(e) => setField("favoriteColor", e.target.value)}
            placeholder="เช่น เอิร์ธโทน, เขียวมัทฉะ, แดงเบอร์กันดี"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#2a1f1b]">
            ☕ อาหารหรือเครื่องดื่มโปรด
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.favoriteFoodDrink}
            onChange={(e) => setField("favoriteFoodDrink", e.target.value)}
            placeholder="เช่น ลาเต้เย็นไม่หวาน, ชาเขียว, ช็อกโกแลต"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#2a1f1b]">🧶 งานอดิเรก</label>
          <input
            type="text"
            disabled={disabled}
            value={value.hobbies}
            onChange={(e) => setField("hobbies", e.target.value)}
            placeholder="เช่น อ่านนิยาย, วิ่ง, ถ่ายรูปฟิล์ม, เล่นบอร์ดเกม"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[#2a1f1b]">
            🎀 สไตล์ของขวัญที่ชอบ
          </label>
          <input
            type="text"
            disabled={disabled}
            value={value.giftStyle}
            onChange={(e) => setField("giftStyle", e.target.value)}
            placeholder="เช่น มินิมอล, ใช้งานได้จริง, วินเทจ, ของกิน"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-[#d9b37c] bg-[#fdf3db] p-3.5">
          <label className="block text-sm font-bold text-[#5e3b09]">🚫 สิ่งที่ไม่ชอบ</label>
          <textarea
            rows={2}
            disabled={disabled}
            value={value.dislikes}
            onChange={(e) => setField("dislikes", e.target.value)}
            placeholder="เช่น น้ำหอมกลิ่นฉุน, ตุ๊กตาตัวใหญ่"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm"
          />
        </div>

        <div className="rounded-2xl border-2 border-[#c8322b]/50 bg-[#fdeceb] p-3.5">
          <label className="block text-sm font-bold text-[#8b1a15]">
            ⚠️ สิ่งที่แพ้หรือควรหลีกเลี่ยง{" "}
            <span className="text-xs font-medium text-[#9e221d]">(ไม่บังคับ)</span>
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={value.allergies}
            onChange={(e) => setField("allergies", e.target.value)}
            placeholder="เช่น แพ้ถั่ว, แพ้นมวัว, แพ้แอลกอฮอล์"
            className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#1f5e46] bg-[#edf7f1] p-4">
        <label className="block text-sm font-bold text-[#154231]">
          🎄 Wish List ของที่อยากได้
        </label>
        <textarea
          rows={3}
          disabled={disabled}
          value={value.wishList}
          onChange={(e) => setField("wishList", e.target.value)}
          placeholder="ใส่ไอเดียของขวัญที่อยากได้ในช่วงงบนี้ เช่น แก้วเก็บความเย็น, สมุดโน้ตปกแข็ง, เมล็ดกาแฟคั่วกลาง"
          className="analog-input mt-2 w-full rounded-xl px-3.5 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-[#2a1f1b]">
          💌 ข้อความเพิ่มเติมถึง Buddy
        </label>
        <textarea
          rows={2}
          disabled={disabled}
          value={value.noteToBuddy}
          onChange={(e) => setField("noteToBuddy", e.target.value)}
          placeholder="ฝากข้อความน่ารัก ๆ ถึงคนที่จะมาดูแลเราได้เลย!"
          className="analog-input mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
        />
      </div>
    </div>
  );
}

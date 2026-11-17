import Link from "next/link";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <ChristmasTree stage={0} ground={false} className="h-44 w-auto opacity-90" />
      <p className="mt-6 font-script text-2xl text-primary">หลงทางในป่าสนหรือเปล่า?</p>
      <h1 className="thai-keep mt-1 text-3xl text-text-primary sm:text-4xl">ไม่พบหน้าที่คุณตามหา</h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
        ลิงก์นี้อาจพิมพ์ผิด หมดอายุ หรือถูกย้ายไปแล้ว ถ้าเป็นลิงก์ส่วนตัวของคุณ ขอลิงก์ใหม่ทางอีเมลได้เลย
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={christmasButtonClass("primary", "md")}>
          กลับหน้าแรก
        </Link>
        <Link href="/recover" className={christmasButtonClass("secondary", "md")}>
          ขอลิงก์ส่วนตัวใหม่
        </Link>
      </div>
    </div>
  );
}

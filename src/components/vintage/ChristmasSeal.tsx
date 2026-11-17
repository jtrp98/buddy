import { Ornament } from "@/components/vintage/Ornament";

interface ChristmasSealProps {
  year?: string;
  tone?: "red" | "pine";
  className?: string;
}

/**
 * 1950s perforated Christmas Seal decorative charity sticker for envelope backs.
 */
export function ChristmasSeal({
  year = "1955",
  tone = "pine",
  className = "",
}: ChristmasSealProps) {
  const palette =
    tone === "pine"
      ? "bg-pine text-paper border-paper/45"
      : "bg-xmas-red text-paper border-paper/45";

  return (
    <div aria-hidden="true" className={`stamp-shadow inline-block select-none ${className}`}>
      <div className="stamp-perforated bg-paper p-[4px]">
        <div
          className={`flex w-14 flex-col items-center justify-between border px-1.5 py-1.5 text-center ${palette}`}
        >
          <span className="font-type text-[6.5px] tracking-[0.16em] uppercase opacity-90">
            XMAS SEAL
          </span>
          <Ornament name="star" className="my-0.5 h-5 w-5 text-gold" />
          <span className="font-serif text-[8px] font-bold tracking-widest opacity-95">
            ★ {year} ★
          </span>
        </div>
      </div>
    </div>
  );
}

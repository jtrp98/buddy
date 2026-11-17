import { Ornament } from "@/components/vintage/Ornament";

interface ChristmasSealProps {
  year?: string;
  tone?: "red" | "pine";
  className?: string;
}

/**
 * Perforated Christmas Seal decorative sticker for envelope backs.
 */
export function ChristmasSeal({
  year = "1955",
  tone = "pine",
  className = "",
}: ChristmasSealProps) {
  const palette =
    tone === "pine"
      ? "bg-[#123229] text-text-primary border-primary/50"
      : "bg-christmas-red text-text-primary border-text-primary/45";

  return (
    <div aria-hidden="true" className={`stamp-shadow inline-block select-none ${className}`}>
      <div className="stamp-perforated bg-text-primary p-[4px]">
        <div
          className={`flex w-14 flex-col items-center justify-between border px-1.5 py-1.5 text-center ${palette}`}
        >
          <span className="text-[7px] font-bold tracking-[0.14em] uppercase">
            XMAS SEAL
          </span>
          <Ornament name="star" className="my-0.5 h-5 w-5 text-primary" />
          <span className="text-[8px] font-bold tracking-widest">
            ★ {year} ★
          </span>
        </div>
      </div>
    </div>
  );
}

import { Ornament, type OrnamentName } from "@/components/vintage/Ornament";

interface OrnamentDividerProps {
  ornament?: OrnamentName;
  label?: string;
  className?: string;
}

/**
 * Editorial rule with centered engraved ornament or short typewriter stamp text.
 */
export function OrnamentDivider({
  ornament = "flourish",
  label,
  className = "",
}: OrnamentDividerProps) {
  return (
    <div
      aria-hidden={!label}
      className={`flex items-center gap-3 text-gold-ink ${className}`}
    >
      <span className="gold-foil-rule flex-1" />
      {label ? (
        <span className="whitespace-nowrap font-type text-[10px] tracking-[0.22em] text-ink-soft uppercase">
          {label}
        </span>
      ) : (
        <Ornament
          name={ornament}
          className={ornament === "flourish" ? "h-5 w-16 shrink-0" : "h-5 w-6 shrink-0"}
        />
      )}
      <span className="gold-foil-rule flex-1" />
    </div>
  );
}

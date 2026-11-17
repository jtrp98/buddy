import { Ornament, type OrnamentName } from "@/components/vintage/Ornament";

interface OrnamentDividerProps {
  ornament?: OrnamentName;
  label?: string;
  className?: string;
}

/**
 * High-contrast editorial divider with subtle gold line and ornament or readable label.
 */
export function OrnamentDivider({
  ornament = "flourish",
  label,
  className = "",
}: OrnamentDividerProps) {
  return (
    <div
      aria-hidden={!label}
      className={`flex items-center gap-3 text-primary ${className}`}
    >
      <span className="gold-foil-rule flex-1" />
      {label ? (
        <span className="whitespace-nowrap text-xs font-semibold tracking-[0.16em] text-text-secondary uppercase">
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

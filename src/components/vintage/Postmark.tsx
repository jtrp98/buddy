import { useId } from "react";

interface PostmarkProps {
  city?: string;
  date?: string;
  subtext?: string;
  wavyLines?: boolean;
  tone?: "ink" | "red" | "pine";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Circular 1950s North Pole postal cancellation mark with optional wavy lines.
 */
export function Postmark({
  city = "NORTH POLE POST",
  date = "25 DEC 1955",
  subtext = "SECRET SERVICE",
  wavyLines = true,
  tone = "ink",
  size = "md",
  className = "",
}: PostmarkProps) {
  const uid = useId().replace(/:/g, "");
  const topPathId = `pm-top-${uid}`;
  const botPathId = `pm-bot-${uid}`;

  const colorClass = {
    ink: "text-ink/70",
    red: "text-xmas-red/75",
    pine: "text-pine/75",
  }[tone];

  const sizeClass = {
    sm: wavyLines ? "h-14 w-24" : "h-14 w-14",
    md: wavyLines ? "h-16 w-32" : "h-16 w-16",
    lg: wavyLines ? "h-20 w-36" : "h-20 w-20",
  }[size];

  const viewWidth = wavyLines ? 176 : 96;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} 96`}
      aria-hidden="true"
      className={`pointer-events-none select-none ${colorClass} ${sizeClass} ${className}`}
    >
      <defs>
        <path id={topPathId} d="M 18,48 A 30,30 0 1,1 78,48" />
        <path id={botPathId} d="M 16,52 A 32,32 0 0,0 80,52" />
      </defs>

      {/* Outer and inner inked rings */}
      <circle
        cx="48"
        cy="48"
        r="41"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="110 3 24 2"
      />
      <circle cx="48" cy="48" r="24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.85" />

      {/* Curved upper & lower post office text */}
      <text
        fill="currentColor"
        fontSize="7.4"
        fontWeight="700"
        letterSpacing="1.6"
        className="font-type"
      >
        <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
          {city}
        </textPath>
      </text>

      <text
        fill="currentColor"
        fontSize="6.5"
        fontWeight="700"
        letterSpacing="1.3"
        className="font-type"
      >
        <textPath href={`#${botPathId}`} startOffset="50%" textAnchor="middle">
          {subtext}
        </textPath>
      </text>

      {/* Center date bars */}
      <line x1="25" y1="40.5" x2="71" y2="40.5" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
      <text
        x="48"
        y="50.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8.6"
        fontWeight="700"
        letterSpacing="0.8"
        className="font-type"
      >
        {date}
      </text>
      <line x1="25" y1="55.5" x2="71" y2="55.5" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />

      {/* Classic 1950s wavy machine-cancellation bars */}
      {wavyLines && (
        <g stroke="currentColor" strokeWidth="1.35" fill="none" opacity="0.65">
          <path d="M 92,31 Q 104,24 116,31 T 140,31 T 164,31" />
          <path d="M 94,40 Q 106,33 118,40 T 142,40 T 166,40" />
          <path d="M 94,49 Q 106,42 118,49 T 142,49 T 166,49" />
          <path d="M 94,58 Q 106,51 118,58 T 142,58 T 166,58" />
          <path d="M 92,67 Q 104,60 116,67 T 140,67 T 164,67" />
        </g>
      )}
    </svg>
  );
}

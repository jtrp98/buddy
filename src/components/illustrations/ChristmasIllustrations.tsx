"use client";

import { useId } from "react";

interface IllustrationProps {
  className?: string;
}

/**
 * Hero Diorama: Santa's Snowy North Pole Workshop, decorated tree, presents,
 * waving Santa, playful reindeer, and cozy winter lights.
 */
export function NorthPoleWorkshopScene({ className = "w-full h-auto" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      aria-hidden="true"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0C1B30" />
          <stop offset="60%" stopColor="#142944" />
          <stop offset="100%" stopColor="#163C38" />
        </linearGradient>
        <radialGradient id={`${uid}-moon`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF9E6" />
          <stop offset="70%" stopColor="#F4D790" />
          <stop offset="100%" stopColor="#E8C47A" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id={`${uid}-aurora`} cx="50%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0C1B30" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-snowHill1`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFF7FA" />
          <stop offset="100%" stopColor="#BCD6E4" />
        </linearGradient>
        <linearGradient id={`${uid}-snowHill2`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF9F0" />
          <stop offset="100%" stopColor="#D7EAF2" />
        </linearGradient>
        <linearGradient id={`${uid}-cabinWall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8C4830" />
          <stop offset="100%" stopColor="#5C2B1B" />
        </linearGradient>
        <linearGradient id={`${uid}-cabinRoof`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D63647" />
          <stop offset="100%" stopColor="#941926" />
        </linearGradient>
        <radialGradient id={`${uid}-windowGlow`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FFF6C9" />
          <stop offset="65%" stopColor="#F5BA4B" />
          <stop offset="100%" stopColor="#D97724" />
        </radialGradient>
        <linearGradient id={`${uid}-treeBody`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#26735B" />
          <stop offset="55%" stopColor="#175240" />
          <stop offset="100%" stopColor="#0D3428" />
        </linearGradient>
        <linearGradient id={`${uid}-giftRed`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E13E4E" />
          <stop offset="100%" stopColor="#A61C2A" />
        </linearGradient>
        <linearGradient id={`${uid}-giftGold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FAE19E" />
          <stop offset="100%" stopColor="#D4A64A" />
        </linearGradient>
        <filter id={`${uid}-softGlow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky & Aurora */}
      <rect width="640" height="360" rx="20" fill={`url(#${uid}-sky)`} />
      <ellipse cx="320" cy="110" rx="280" ry="110" fill={`url(#${uid}-aurora)`} />

      {/* Distant Winter Moon & Halo */}
      <circle cx="520" cy="76" r="44" fill="#E8C47A" opacity="0.14" />
      <circle cx="520" cy="76" r="28" fill={`url(#${uid}-moon)`} />

      {/* Twinkling Stars */}
      <g fill="#FFF9F0">
        <circle cx="72" cy="54" r="2" className="xmas-twinkle" />
        <circle cx="145" cy="36" r="1.6" opacity="0.7" />
        <circle cx="218" cy="78" r="2.2" className="xmas-twinkle" style={{ animationDelay: "0.7s" }} />
        <circle cx="308" cy="42" r="1.8" opacity="0.8" />
        <circle cx="394" cy="66" r="2.4" className="xmas-twinkle" style={{ animationDelay: "1.4s" }} />
        <circle cx="445" cy="34" r="1.5" opacity="0.65" />
        <circle cx="585" cy="48" r="2" className="xmas-twinkle" style={{ animationDelay: "1s" }} />
      </g>

      {/* Distant Pine Silhouettes */}
      <g fill="#102C33" opacity="0.8">
        <path d="M26 250 L48 188 L70 250 Z" />
        <path d="M58 252 L85 174 L112 252 Z" />
        <path d="M532 250 L558 182 L584 250 Z" />
        <path d="M566 252 L598 168 L630 252 Z" />
      </g>

      {/* Snowy Hills */}
      <path d="M0 248 Q165 206 335 244 T640 232 L640 360 L0 360 Z" fill={`url(#${uid}-snowHill1)`} />
      <path d="M0 278 Q190 244 375 276 T640 264 L640 360 L0 360 Z" fill={`url(#${uid}-snowHill2)`} />

      {/* Santa's Workshop Cabin (Left-Center) */}
      <g transform="translate(88, 122)">
        {/* Chimney + Smoke */}
        <rect x="136" y="4" width="26" height="44" rx="4" fill="#9E2A36" stroke="#5A141D" strokeWidth="1.5" />
        <rect x="132" y="2" width="34" height="8" rx="4" fill="#FFF9F0" />
        <circle cx="152" cy="-12" r="8" fill="#DCEFF5" opacity="0.45" className="xmas-float" />
        <circle cx="164" cy="-28" r="11" fill="#DCEFF5" opacity="0.3" className="xmas-float" style={{ animationDelay: "0.8s" }} />

        {/* Cabin Body */}
        <rect x="24" y="66" width="152" height="100" rx="8" fill={`url(#${uid}-cabinWall)`} />
        {/* Log trim lines */}
        <path d="M24 90 H176 M24 114 H176 M24 138 H176" stroke="#472013" strokeWidth="1.5" opacity="0.45" />

        {/* Warm Glowing Windows */}
        <g filter={`url(#${uid}-softGlow)`}>
          <rect x="42" y="92" width="38" height="36" rx="6" fill={`url(#${uid}-windowGlow)`} />
          <rect x="122" y="92" width="38" height="36" rx="6" fill={`url(#${uid}-windowGlow)`} />
        </g>
        <path d="M61 92 V128 M42 110 H80" stroke="#5C2B1B" strokeWidth="3" />
        <path d="M141 92 V128 M122 110 H160" stroke="#5C2B1B" strokeWidth="3" />
        <rect x="38" y="126" width="46" height="6" rx="3" fill="#FFF9F0" />
        <rect x="118" y="126" width="46" height="6" rx="3" fill="#FFF9F0" />

        {/* Cozy Arched Door */}
        <path d="M84 166 V118 A16 16 0 0 1 116 118 V166 Z" fill="#C62838" stroke="#E8C47A" strokeWidth="2.5" />
        <circle cx="109" cy="140" r="2.8" fill="#E8C47A" />
        {/* Wreath on Door */}
        <circle cx="100" cy="122" r="8" fill="none" stroke="#1A5C48" strokeWidth="4" />
        <circle cx="100" cy="129" r="2.2" fill="#E8C47A" />

        {/* Pitched Roof & Snow Cap */}
        <path d="M8 72 L100 12 L192 72 Z" fill={`url(#${uid}-cabinRoof)`} />
        <path
          d="M4 72 Q28 84 52 72 Q76 82 100 72 Q124 82 148 72 Q172 84 196 72 L100 8 Z"
          fill="#FFF9F0"
        />
        <path
          d="M14 70 L100 15 L186 70"
          fill="none"
          stroke="#E8C47A"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity="0.7"
        />
      </g>

      {/* North Pole Signpost */}
      <g transform="translate(52, 210)">
        <rect x="10" y="0" width="8" height="72" rx="4" fill="#8C4830" />
        <rect x="0" y="8" width="44" height="16" rx="5" fill="#C62838" stroke="#FFF9F0" strokeWidth="1.5" />
        <text x="22" y="19" textAnchor="middle" fill="#FFF9F0" fontSize="6.5" fontWeight="700" letterSpacing="0.8">
          NORTH POLE
        </text>
        <circle cx="14" cy="0" r="5" fill="#E8C47A" />
      </g>

      {/* Grand Decorated 3D Christmas Tree (Center) */}
      <g transform="translate(306, 86)">
        <ellipse cx="64" cy="192" rx="52" ry="11" fill="#8CB2C5" opacity="0.4" />
        <rect x="52" y="162" width="24" height="30" rx="4" fill="#6F3822" />
        <path d="M64 10 L18 84 H110 Z" fill={`url(#${uid}-treeBody)`} />
        <path d="M64 46 L10 126 H118 Z" fill={`url(#${uid}-treeBody)`} />
        <path d="M64 82 L2 168 H126 Z" fill={`url(#${uid}-treeBody)`} />

        {/* Snow Edges on Boughs */}
        <path d="M40 72 Q64 84 88 72" stroke="#FFF9F0" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        <path d="M26 116 Q64 130 102 116" stroke="#FFF9F0" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
        <path d="M14 160 Q64 176 114 160" stroke="#FFF9F0" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

        {/* Golden Star Topper */}
        <g filter={`url(#${uid}-softGlow)`}>
          <path
            d="M64 -4 L68.5 7 L80 8.5 L71.5 16.5 L73.8 28 L64 22.5 L54.2 28 L56.5 16.5 L48 8.5 L59.5 7 Z"
            fill="#FAE19E"
            stroke="#FFF9F0"
            strokeWidth="1.2"
          />
        </g>

        {/* Glowing Ornaments */}
        <circle cx="52" cy="64" r="5.5" fill="#D93546" />
        <circle cx="50.5" cy="62.2" r="1.8" fill="#FFF9F0" opacity="0.8" />
        <circle cx="78" cy="74" r="5" fill="#E8C47A" />
        <circle cx="42" cy="108" r="6" fill="#E8C47A" />
        <circle cx="84" cy="112" r="6" fill="#D93546" />
        <circle cx="64" cy="138" r="6.5" fill="#DCEFF5" />
        <circle cx="34" cy="150" r="6" fill="#D93546" />
        <circle cx="94" cy="148" r="6" fill="#E8C47A" />
      </g>

      {/* Wrapped 3D Presents Under Tree */}
      <g transform="translate(274, 246)">
        <rect x="0" y="14" width="40" height="32" rx="6" fill={`url(#${uid}-giftRed)`} />
        <rect x="16" y="14" width="8" height="32" fill="#E8C47A" />
        <rect x="-2" y="8" width="44" height="9" rx="4" fill="#D93546" />
        <path d="M20 8 C12 -2 6 6 20 8 C34 6 28 -2 20 8 Z" fill="#FAE19E" />
      </g>

      <g transform="translate(324, 256)">
        <rect x="0" y="10" width="36" height="28" rx="6" fill={`url(#${uid}-giftGold)`} />
        <rect x="14" y="10" width="8" height="28" fill="#C62838" />
        <rect x="-2" y="5" width="40" height="8" rx="3.5" fill="#FAE19E" />
        <path d="M18 5 C11 -3 7 4 18 5 C29 4 25 -3 18 5 Z" fill="#C62838" />
      </g>

      {/* Waving Santa Character (Right of Tree) */}
      <g transform="translate(430, 178)">
        <ellipse cx="38" cy="110" rx="30" ry="8" fill="#8CB2C5" opacity="0.45" />
        {/* Boots */}
        <rect x="20" y="92" width="14" height="16" rx="5" fill="#1C2938" />
        <rect x="42" y="92" width="14" height="16" rx="5" fill="#1C2938" />
        {/* Waving Left/Right Arm */}
        <g className="santa-wave-arm">
          <path d="M56 54 Q74 36 80 26" stroke="#C62838" strokeWidth="14" strokeLinecap="round" />
          <circle cx="81" cy="24" r="7" fill="#FFF9F0" />
        </g>
        {/* Coat */}
        <rect x="14" y="42" width="48" height="54" rx="22" fill="#C62838" />
        <rect x="14" y="66" width="48" height="8" fill="#1C2938" />
        <rect x="33" y="65" width="10" height="10" rx="2" fill="#E8C47A" />
        <rect x="34" y="44" width="8" height="50" rx="4" fill="#FFF9F0" />
        {/* Head & Beard */}
        <circle cx="38" cy="28" r="18" fill="#FAD2B8" />
        <path d="M18 32 Q38 60 58 32 Q54 46 38 48 Q22 46 18 32 Z" fill="#FFF9F0" />
        <circle cx="32" cy="24" r="2.2" fill="#132234" />
        <circle cx="44" cy="24" r="2.2" fill="#132234" />
        <circle cx="38" cy="29" r="3" fill="#E15A64" />
        {/* Santa Hat */}
        <path d="M18 18 Q38 -4 60 16 L66 26 L56 26 Z" fill="#C62838" />
        <rect x="17" y="13" width="42" height="9" rx="4.5" fill="#FFF9F0" />
        <circle cx="65" cy="26" r="5.5" fill="#FFF9F0" />
      </g>

      {/* Playful Reindeer (Right) */}
      <g transform="translate(514, 212)">
        <ellipse cx="32" cy="78" rx="26" ry="7" fill="#8CB2C5" opacity="0.4" />
        {/* Antlers */}
        <path d="M22 14 C16 2 10 4 12 -4 M16 6 L24 4" stroke="#C89B62" strokeWidth="3" strokeLinecap="round" />
        <path d="M42 14 C48 2 54 4 52 -4 M48 6 L40 4" stroke="#C89B62" strokeWidth="3" strokeLinecap="round" />
        {/* Body */}
        <rect x="16" y="38" width="32" height="36" rx="14" fill="#9E623C" />
        <rect x="18" y="38" width="28" height="9" rx="4.5" fill="#C62838" />
        {/* Head */}
        <circle cx="32" cy="24" r="15" fill="#B5754B" />
        <ellipse cx="32" cy="29" rx="9" ry="7" fill="#E3BA98" />
        <circle cx="32" cy="27" r="4.2" fill="#E02D3C" filter={`url(#${uid}-softGlow)`} />
        <circle cx="26" cy="20" r="2" fill="#132234" />
        <circle cx="38" cy="20" r="2" fill="#132234" />
      </g>
    </svg>
  );
}

/**
 * Tactile 3D-inspired interactive Gift Box for Hero preview & Secret Buddy Reveal.
 */
export function InteractiveGiftBox3D({
  tone = "red",
  stage = "idle",
  className = "h-44 w-44",
}: {
  tone?: "red" | "gold" | "evergreen";
  stage?: "idle" | "untying" | "opening" | "open";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");

  const palette = {
    red: {
      boxLight: "#E53E4F",
      boxDark: "#9E1C2A",
      lidLight: "#F04C5C",
      lidDark: "#B42231",
      ribbonLight: "#FCE6A6",
      ribbonDark: "#D4A346",
    },
    gold: {
      boxLight: "#F7DC94",
      boxDark: "#C7963A",
      lidLight: "#FCE6A6",
      lidDark: "#D9AC4E",
      ribbonLight: "#E53E4F",
      ribbonDark: "#9E1C2A",
    },
    evergreen: {
      boxLight: "#256F5B",
      boxDark: "#10382D",
      lidLight: "#2F856D",
      lidDark: "#144739",
      ribbonLight: "#FCE6A6",
      ribbonDark: "#D4A346",
    },
  }[tone];

  const lidOpenClass =
    stage === "opening" || stage === "open" ? "gift-lid-opening" : "";
  const ribbonUntieClass =
    stage === "untying" || stage === "opening" || stage === "open"
      ? "ribbon-untying"
      : "";

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className={`select-none ${stage === "idle" ? "xmas-float xmas-gift-hover" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.boxLight} />
          <stop offset="100%" stopColor={palette.boxDark} />
        </linearGradient>
        <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.lidLight} />
          <stop offset="100%" stopColor={palette.lidDark} />
        </linearGradient>
        <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.ribbonLight} />
          <stop offset="100%" stopColor={palette.ribbonDark} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6CC" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#E8C47A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E8C47A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Shadow */}
      <ellipse cx="100" cy="182" rx="64" ry="12" fill="rgba(4,10,20,0.48)" />

      {/* Magical Inner Glow when opening */}
      {(stage === "opening" || stage === "open") && (
        <ellipse
          cx="100"
          cy="76"
          rx="74"
          ry="58"
          fill={`url(#${uid}-glow)`}
          className="magical-beam"
        />
      )}

      {/* Box Base */}
      <rect
        x="38"
        y="84"
        width="124"
        height="92"
        rx="14"
        fill={`url(#${uid}-box)`}
        stroke="rgba(255,249,240,0.22)"
        strokeWidth="1.5"
      />
      {/* Subtle 3D specular highlight on left edge */}
      <rect
        x="43"
        y="89"
        width="14"
        height="82"
        rx="7"
        fill="rgba(255,255,255,0.12)"
      />
      {/* Vertical Satin Ribbon */}
      <rect x="88" y="84" width="24" height="92" fill={`url(#${uid}-ribbon)`} />
      <rect x="38" y="122" width="124" height="16" fill={`url(#${uid}-ribbon)`} opacity="0.92" />

      {/* Lid + Bow */}
      <g className={lidOpenClass}>
        <rect
          x="30"
          y="64"
          width="140"
          height="28"
          rx="10"
          fill={`url(#${uid}-lid)`}
          stroke="rgba(255,249,240,0.3)"
          strokeWidth="1.5"
        />
        <rect x="88" y="64" width="24" height="28" fill={`url(#${uid}-ribbon)`} />

        {/* 3D Satin Bow */}
        <g className={ribbonUntieClass}>
          <path
            d="M100 66 C74 36 46 46 66 66 Z"
            fill={`url(#${uid}-ribbon)`}
            stroke="rgba(16,30,46,0.22)"
            strokeWidth="1"
          />
          <path
            d="M100 66 C126 36 154 46 134 66 Z"
            fill={`url(#${uid}-ribbon)`}
            stroke="rgba(16,30,46,0.22)"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="63"
            r="10"
            fill={`url(#${uid}-ribbon)`}
            stroke="rgba(255,249,240,0.5)"
            strokeWidth="1.5"
          />
        </g>
      </g>

      {/* Golden Tag */}
      <g transform="translate(124, 108) rotate(8)">
        <rect x="0" y="0" width="28" height="36" rx="5" fill="#FFF9F0" stroke="#E8C47A" strokeWidth="1.5" />
        <circle cx="14" cy="7" r="2.2" fill="#C62838" />
        <path d="M7 17 H21 M7 24 H18" stroke="#132234" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      </g>
    </svg>
  );
}

/**
 * Cheerful 3D Santa Character illustration for Dashboard & Admin Register.
 */
export function SantaCharacter3D({ className = "h-28 w-28" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <radialGradient id={`${uid}-coat`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#EC4A5A" />
          <stop offset="65%" stopColor="#C62838" />
          <stop offset="100%" stopColor="#8E1723" />
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFE0CA" />
          <stop offset="100%" stopColor="#F0B999" />
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="128" rx="40" ry="7" fill="rgba(4,10,20,0.35)" />
      {/* Waving Arm */}
      <g className="santa-wave-arm">
        <path d="M98 76 Q116 56 120 44" stroke="#C62838" strokeWidth="16" strokeLinecap="round" />
        <circle cx="121" cy="42" r="9" fill="#FFF9F0" />
      </g>
      {/* Left Arm */}
      <path d="M40 78 Q24 90 24 102" stroke="#B42231" strokeWidth="15" strokeLinecap="round" />
      <circle cx="24" cy="103" r="8.5" fill="#FFF9F0" />
      {/* Body */}
      <rect x="34" y="64" width="72" height="62" rx="30" fill={`url(#${uid}-coat)`} />
      <rect x="34" y="96" width="72" height="10" fill="#182738" />
      <rect x="61" y="93" width="18" height="16" rx="4" fill="#E8C47A" />
      <rect x="65" y="97" width="10" height="8" rx="2" fill="#182738" />
      {/* Head & Fluffy Beard */}
      <circle cx="70" cy="48" r="24" fill={`url(#${uid}-face)`} />
      <path
        d="M42 52 Q70 92 98 52 Q94 74 70 78 Q46 74 42 52 Z"
        fill="#FFF9F0"
      />
      <circle cx="52" cy="52" r="4.5" fill="#FF9AA2" opacity="0.55" />
      <circle cx="88" cy="52" r="4.5" fill="#FF9AA2" opacity="0.55" />
      <circle cx="61" cy="44" r="2.8" fill="#132234" />
      <circle cx="79" cy="44" r="2.8" fill="#132234" />
      <circle cx="70" cy="50" r="4.2" fill="#E15A64" />
      {/* Hat */}
      <path d="M44 36 Q70 2 104 28 L112 42 L94 42 Z" fill={`url(#${uid}-coat)`} />
      <rect x="42" y="30" width="56" height="12" rx="6" fill="#FFF9F0" />
      <circle cx="110" cy="44" r="7.5" fill="#FFF9F0" />
    </svg>
  );
}

/**
 * Playful 3D Christmas Elf holding a golden gift box.
 */
export function ElfCharacter3D({ className = "h-28 w-28" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <linearGradient id={`${uid}-tunic`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#277962" />
          <stop offset="100%" stopColor="#123D32" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="128" rx="38" ry="7" fill="rgba(4,10,20,0.35)" />
      {/* Ears */}
      <path d="M44 48 L32 42 L44 56 Z" fill="#F4C3A3" />
      <path d="M96 48 L108 42 L96 56 Z" fill="#F4C3A3" />
      {/* Tunic */}
      <path d="M40 70 H100 L108 118 H32 Z" fill={`url(#${uid}-tunic)`} />
      <path d="M46 70 L58 84 L70 70 L82 84 L94 70" fill="#C62838" />
      {/* Head */}
      <circle cx="70" cy="50" r="21" fill="#FCD4B8" />
      <circle cx="62" cy="48" r="2.6" fill="#132234" />
      <circle cx="78" cy="48" r="2.6" fill="#132234" />
      <path d="M63 57 Q70 63 77 57" stroke="#C62838" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Elf Hat */}
      <path d="M46 38 L70 6 L104 28 L94 38 Z" fill={`url(#${uid}-tunic)`} />
      <rect x="44" y="32" width="52" height="10" rx="5" fill="#C62838" />
      <circle cx="105" cy="28" r="6" fill="#E8C47A" />
      {/* Golden Gift Held */}
      <rect x="52" y="88" width="36" height="28" rx="6" fill="#E8C47A" />
      <rect x="67" y="88" width="6" height="28" fill="#C62838" />
      <rect x="52" y="99" width="36" height="6" fill="#C62838" />
    </svg>
  );
}

/**
 * Glass Snow Globe 3D illustration with miniature winter cottage and tree.
 */
export function SnowGlobe3D({ className = "h-32 w-32" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <radialGradient id={`${uid}-globe`} cx="35%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#3B6D96" stopOpacity="0.65" />
          <stop offset="65%" stopColor="#142C47" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#0A192B" />
        </radialGradient>
        <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8C392B" />
          <stop offset="100%" stopColor="#4A1A13" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="148" rx="44" ry="8" fill="rgba(4,10,20,0.45)" />
      {/* Glass Sphere */}
      <circle cx="80" cy="70" r="54" fill={`url(#${uid}-globe)`} stroke="#DCEFF5" strokeOpacity="0.45" strokeWidth="2.5" />
      {/* Miniature Snow Ground */}
      <path d="M32 94 Q80 82 128 94 A54 54 0 0 1 32 94 Z" fill="#FFF9F0" />
      {/* Miniature Pine Tree */}
      <path d="M62 44 L44 74 H80 Z" fill="#1F6A54" />
      <path d="M62 58 L40 88 H84 Z" fill="#144D3D" />
      <circle cx="62" cy="40" r="4" fill="#E8C47A" />
      {/* Miniature Cottage */}
      <rect x="86" y="68" width="24" height="20" rx="3" fill="#B42231" />
      <path d="M82 70 L98 54 L114 70 Z" fill="#FFF9F0" />
      <rect x="94" y="76" width="8" height="8" rx="1.5" fill="#F7D78A" />
      {/* Snow Particles Inside Globe */}
      <circle cx="52" cy="40" r="2.2" fill="#FFF9F0" className="xmas-twinkle" />
      <circle cx="86" cy="36" r="2.5" fill="#DCEFF5" className="xmas-twinkle" style={{ animationDelay: "0.8s" }} />
      <circle cx="108" cy="52" r="2" fill="#FFF9F0" className="xmas-twinkle" style={{ animationDelay: "1.4s" }} />
      <circle cx="46" cy="68" r="1.8" fill="#DCEFF5" />
      {/* Glass Specular Reflection */}
      <path d="M44 46 A42 42 0 0 1 76 24" stroke="#FFF9F0" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      {/* Pedestal Base */}
      <path d="M38 114 H122 L128 140 H32 Z" fill={`url(#${uid}-base)`} />
      <rect x="34" y="110" width="92" height="10" rx="5" fill="#E8C47A" />
      <rect x="60" y="124" width="40" height="10" rx="3" fill="#E8C47A" />
    </svg>
  );
}

/**
 * 3D Evergreen Christmas Tree with twinkling ornaments & gifts.
 */
export function ChristmasTree3D({ className = "h-32 w-32" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 150" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <linearGradient id={`${uid}-pine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#287D64" />
          <stop offset="100%" stopColor="#0F3A2E" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="140" rx="44" ry="7" fill="rgba(4,10,20,0.4)" />
      <rect x="61" y="116" width="18" height="22" rx="3" fill="#6F3822" />
      <path d="M70 20 L38 62 H102 Z" fill={`url(#${uid}-pine)`} />
      <path d="M70 44 L28 92 H112 Z" fill={`url(#${uid}-pine)`} />
      <path d="M70 68 L20 120 H120 Z" fill={`url(#${uid}-pine)`} />
      {/* Gold Garland */}
      <path d="M46 56 Q70 66 94 56" stroke="#E8C47A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 84 Q70 96 104 84" stroke="#E8C47A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 112 Q70 124 112 112" stroke="#E8C47A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Star */}
      <path d="M70 4 L73.5 12 L82 13 L75.5 19 L77 28 L70 23.5 L63 28 L64.5 19 L58 13 L66.5 12 Z" fill="#FAE19E" />
      {/* Ornaments */}
      <circle cx="58" cy="52" r="4.5" fill="#C62838" />
      <circle cx="84" cy="76" r="5" fill="#E8C47A" />
      <circle cx="50" cy="80" r="4.5" fill="#DCEFF5" />
      <circle cx="68" cy="104" r="5.5" fill="#C62838" />
      <circle cx="96" cy="108" r="4.5" fill="#E8C47A" />
    </svg>
  );
}

/**
 * 3D North Pole Mailbox with sealed Christmas letter.
 */
export function NorthPoleMailbox3D({ className = "h-28 w-28" }: IllustrationProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DF3849" />
          <stop offset="100%" stopColor="#941825" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="130" rx="32" ry="6" fill="rgba(4,10,20,0.4)" />
      <rect x="64" y="84" width="12" height="44" rx="4" fill="#174D3E" />
      {/* Mailbox Body */}
      <path d="M30 56 A26 26 0 0 1 56 30 H88 A26 26 0 0 1 114 56 V88 H30 Z" fill={`url(#${uid}-box)`} />
      <path d="M30 56 A26 26 0 0 1 56 30 V88 H30 Z" fill="#9E1C2A" />
      {/* Snow on Top */}
      <path d="M44 30 Q72 22 100 32 Q108 38 96 42 Q72 34 46 40 Z" fill="#FFF9F0" />
      {/* Peeking Magical Letter */}
      <g className="xmas-float">
        <rect x="34" y="48" width="38" height="26" rx="4" transform="rotate(-12 34 48)" fill="#FFF9F0" stroke="#E8C47A" strokeWidth="1.5" />
        <circle cx="52" cy="58" r="4.5" fill="#C62838" />
      </g>
      {/* Flag */}
      <rect x="94" y="40" width="4" height="24" rx="2" fill="#E8C47A" />
      <rect x="94" y="38" width="16" height="10" rx="2" fill="#E8C47A" />
    </svg>
  );
}

/**
 * Stack of 3D gifts & golden-trimmed Christmas Wish List scroll.
 */
export function WishListGiftStack3D({ className = "h-28 w-28" }: IllustrationProps) {
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden="true" className={`select-none ${className}`}>
      <ellipse cx="70" cy="128" rx="46" ry="7" fill="rgba(4,10,20,0.38)" />
      {/* Red Gift */}
      <rect x="22" y="76" width="48" height="44" rx="8" fill="#C62838" />
      <rect x="42" y="76" width="8" height="44" fill="#E8C47A" />
      <rect x="19" y="70" width="54" height="10" rx="4" fill="#DF3849" />
      {/* Evergreen Gift */}
      <rect x="74" y="86" width="42" height="34" rx="7" fill="#185443" />
      <rect x="92" y="86" width="7" height="34" fill="#FFF9F0" />
      <rect x="72" y="80" width="46" height="9" rx="3.5" fill="#24735D" />
      {/* Wish List Scroll */}
      <g className="xmas-float">
        <rect x="44" y="24" width="54" height="64" rx="8" fill="#FFF9F0" stroke="#E8C47A" strokeWidth="2.5" />
        <path d="M55 40 H87 M55 52 H83 M55 64 H77" stroke="#132234" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="88" cy="28" r="9" fill="#E8C47A" />
        <path d="M88 23 L89.5 26.5 L93 27 L90.3 29.5 L91 33 L88 31.2 L85 33 L85.7 29.5 L83 27 L86.5 26.5 Z" fill="#C62838" />
      </g>
    </svg>
  );
}

const SPARKLE_PARTICLES = [
  { cx: "-120px", cy: "-110px", color: "#E8C47A", size: 10, delay: "0ms" },
  { cx: "-75px", cy: "-145px", color: "#FFF9F0", size: 8, delay: "40ms" },
  { cx: "-30px", cy: "-130px", color: "#C62838", size: 9, delay: "80ms" },
  { cx: "25px", cy: "-150px", color: "#E8C47A", size: 11, delay: "30ms" },
  { cx: "80px", cy: "-125px", color: "#4ADE80", size: 8, delay: "60ms" },
  { cx: "125px", cy: "-105px", color: "#DCEFF5", size: 10, delay: "90ms" },
  { cx: "-145px", cy: "-55px", color: "#4ADE80", size: 9, delay: "70ms" },
  { cx: "145px", cy: "-60px", color: "#C62838", size: 9, delay: "50ms" },
  { cx: "-95px", cy: "-35px", color: "#E8C47A", size: 7, delay: "110ms" },
  { cx: "95px", cy: "-30px", color: "#FFF9F0", size: 8, delay: "100ms" },
  { cx: "-50px", cy: "-90px", color: "#DCEFF5", size: 8, delay: "20ms" },
  { cx: "52px", cy: "-85px", color: "#E8C47A", size: 9, delay: "45ms" },
] as const;

/**
 * Level 3 Celebration Sparkle & Golden Confetti Burst (triggered on special milestones).
 */
export function MagicalSparkleBurst({
  active = false,
  className = "",
}: {
  active?: boolean;
  className?: string;
}) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-1/2 flex justify-center overflow-visible ${className}`}
    >
      {SPARKLE_PARTICLES.map((p, idx) => (
        <span
          key={idx}
          className="confetti-particle absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            animationDelay: p.delay,
            ["--cx" as string]: p.cx,
            ["--cy" as string]: p.cy,
          }}
        />
      ))}
    </div>
  );
}

import { SPRITE_H, SPRITE_W, spriteFrames } from "./pixelSprites";

/** A still, small version of a participant's 8-bit character (used in lists). */
export function PixelAvatar({ seed, px = 2, className = "" }: { seed: string; px?: number; className?: string }) {
  const frame = spriteFrames(seed).idle;
  return (
    <svg
      width={SPRITE_W * px}
      height={SPRITE_H * px}
      viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={`block shrink-0 [image-rendering:pixelated] ${className}`}
    >
      {frame.map((p) => (
        <path key={p.color} d={p.d} fill={p.color} />
      ))}
    </svg>
  );
}

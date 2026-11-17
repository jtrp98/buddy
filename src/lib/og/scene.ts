import { r1, seededRandom } from "@/lib/prng";

/**
 * The background picture for link-preview images (1200×630): a night sky,
 * moon, snowy hill and a lit Christmas tree with gifts on the right.
 * Returned as an SVG string so next/og can draw it as an <img>.
 */

const W = 1200;
const H = 630;
const TREE_X = 900;
const BASE_Y = 548;

function tierPath(top: number, bottom: number, w: number, scallops: number, rand: () => number) {
  const h = bottom - top;
  const step = (2 * w) / scallops;
  let d = `M ${TREE_X} ${top} Q ${r1(TREE_X + w * 0.36)} ${r1(top + h * 0.6)} ${TREE_X + w} ${bottom}`;
  for (let i = 0; i < scallops; i++) {
    const x1 = TREE_X + w - step * i;
    const x2 = x1 - step;
    const y2 = i === scallops - 1 ? bottom : bottom - 3 - rand() * 3;
    d += ` Q ${r1((x1 + x2) / 2)} ${r1(bottom + 9 + rand() * 5)} ${r1(x2)} ${r1(y2)}`;
  }
  return `${d} Q ${r1(TREE_X - w * 0.36)} ${r1(top + h * 0.6)} ${TREE_X} ${top} Z`;
}

export function previewSceneSvg(): string {
  const rand = seededRandom(2412);
  const scale = 1.4;
  // Tiers (top, bottom, half-width) in the tree's own units, scaled into the picture.
  const tiers = [
    [44, 102, 42, 4],
    [72, 148, 68, 5],
    [108, 198, 94, 6],
    [150, 252, 118, 7],
    [196, 308, 140, 8],
  ].map(([t, b, w, s]) => ({
    top: BASE_Y - (330 - t) * scale,
    bottom: BASE_Y - (330 - b) * scale,
    w: w * scale,
    s,
  }));

  const stars = Array.from({ length: 70 }, () => {
    const x = r1(rand() * W);
    const y = r1(rand() * 360);
    return `<circle cx="${x}" cy="${y}" r="${r1(0.6 + rand() * 1.3)}" fill="#fff8e7" opacity="${r1(0.3 + rand() * 0.6)}"/>`;
  }).join("");

  const tierShapes = tiers
    .map((t, i) => ({ t, i, d: tierPath(t.top, t.bottom, t.w, t.s, rand) }))
    .reverse()
    .map(
      ({ d, i }) =>
        `${i < tiers.length - 1 ? `<path d="${d}" transform="translate(0 9)" fill="rgba(2,16,10,0.4)"/>` : ""}<path d="${d}" fill="url(#needles)"/><path d="${d}" fill="url(#depth)"/>`
    )
    .join("");

  const lightColors = ["#ffe7a8", "#ffc552", "#ff6f61", "#ffe7a8", "#9fd0ff", "#ffc552"];
  let li = 0;
  const lights = tiers
    .map((t) => {
      const y = t.top + (t.bottom - t.top) * 0.74;
      const half = t.w * 0.68;
      const n = Math.max(3, Math.round((half * 2) / 26));
      const parts: string[] = [];
      for (let k = 0; k < n; k++) {
        const tt = (k + 0.5) / n;
        const x = TREE_X - half + half * 2 * tt;
        const yy = y + 16 * 4 * tt * (1 - tt);
        const c = lightColors[li++ % lightColors.length];
        parts.push(
          `<circle cx="${r1(x)}" cy="${r1(yy)}" r="13" fill="${c}" opacity="0.28"/><circle cx="${r1(x)}" cy="${r1(yy)}" r="3.6" fill="${c}"/>`
        );
      }
      return `<path d="M ${r1(TREE_X - half)} ${r1(y)} Q ${TREE_X} ${r1(y + 32)} ${r1(TREE_X + half)} ${r1(y)}" fill="none" stroke="#0a1a12" stroke-width="1.2" opacity="0.7"/>${parts.join("")}`;
    })
    .join("");

  const baubleColors = [
    ["#ff8579", "#9c1d24"],
    ["#fff0b8", "#b8892d"],
    ["#ffffff", "#c9c2ae"],
  ];
  const baubles = tiers
    .flatMap((t, ti) =>
      Array.from({ length: ti + 1 }, (_, k) => {
        const f = 0.5 + rand() * 0.35;
        const half = t.w * f * 0.75;
        const x = TREE_X - half + ((k + 0.5) / (ti + 1)) * half * 2;
        const y = t.top + (t.bottom - t.top) * f;
        const [hi, lo] = baubleColors[(ti + k) % baubleColors.length];
        return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(7 + ti * 0.6)}" fill="${lo}"/><circle cx="${r1(x - 2)}" cy="${r1(y - 2)}" r="${r1(4 + ti * 0.3)}" fill="${hi}" opacity="0.85"/>`;
      })
    )
    .join("");

  // Five-point star at the top.
  const sx = TREE_X;
  const sy = tiers[0].top - 16;
  const starPts = Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 === 0 ? 26 : 11;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${r1(sx + rad * Math.cos(a))},${r1(sy + rad * Math.sin(a))}`;
  }).join(" ");

  const gift = (x: number, w: number, h: number, box: string, shade: string, ribbon: string) => {
    const y = BASE_Y - h + 6;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${box}"/><rect x="${x + w * 0.62}" y="${y}" width="${w * 0.38}" height="${h}" fill="${shade}" opacity="0.55"/><rect x="${x - 3}" y="${y - 7}" width="${w + 6}" height="11" rx="2" fill="${box}"/><rect x="${x + w / 2 - 4}" y="${y - 7}" width="8" height="${h + 7}" fill="${ribbon}"/><circle cx="${x + w / 2 - 7}" cy="${y - 10}" r="7" fill="${ribbon}"/><circle cx="${x + w / 2 + 7}" cy="${y - 10}" r="7" fill="${ribbon}"/>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060f20"/><stop offset="0.55" stop-color="#0d1f38"/><stop offset="1" stop-color="#1b3a52"/></linearGradient>
  <radialGradient id="moon" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff8e7" stop-opacity="0.45"/><stop offset="1" stop-color="#fff8e7" stop-opacity="0"/></radialGradient>
  <radialGradient id="aura" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.32"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <radialGradient id="pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffce78" stop-opacity="0.55"/><stop offset="1" stop-color="#ffce78" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d6" stop-opacity="0.9"/><stop offset="0.35" stop-color="#ffd27a" stop-opacity="0.4"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fb"/><stop offset="1" stop-color="#c3d3de"/></linearGradient>
  <linearGradient id="needles" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f8455"/><stop offset="0.38" stop-color="#1e6443"/><stop offset="0.72" stop-color="#134a33"/><stop offset="1" stop-color="#0b3324"/></linearGradient>
  <linearGradient id="depth" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#02140c" stop-opacity="0.32"/></linearGradient>
  <linearGradient id="star" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4c4"/><stop offset="0.5" stop-color="#f1c75a"/><stop offset="1" stop-color="#b8892d"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars}
<circle cx="1110" cy="96" r="120" fill="url(#moon)"/>
<circle cx="1110" cy="96" r="34" fill="#fbf1d9"/>
<path d="M0 470 C 140 440 260 460 400 438 S 680 410 820 436 S 1060 404 1200 430 L1200 630 L0 630 Z" fill="#132a42"/>
<path d="M0 586 C 300 580 560 572 760 556 C 840 548 880 545 900 545 C 980 545 1080 556 1200 562 L1200 630 L0 630 Z" fill="url(#snow)"/>
<ellipse cx="${TREE_X}" cy="320" rx="300" ry="300" fill="url(#aura)"/>
<ellipse cx="${TREE_X}" cy="${BASE_Y + 8}" rx="230" ry="26" fill="url(#pool)"/>
<rect x="${TREE_X - 16}" y="${BASE_Y - 46}" width="32" height="50" rx="4" fill="#5a3520"/>
${tierShapes}
${lights}
${baubles}
${gift(TREE_X - 170, 70, 54, "#c5343b", "#84191f", "#f1d27e")}
${gift(TREE_X - 98, 42, 34, "#fff3d9", "#d9c7a0", "#b3262e")}
${gift(TREE_X + 44, 64, 48, "#1f6a4a", "#0f3b2a", "#f1d27e")}
${gift(TREE_X + 112, 42, 30, "#e9c46a", "#a9873a", "#b3262e")}
<circle cx="${sx}" cy="${sy}" r="70" fill="url(#halo)"/>
<polygon points="${starPts}" fill="url(#star)"/>
</svg>`;
}

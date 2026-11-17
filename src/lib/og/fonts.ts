/**
 * Loads a Google Font as TTF for next/og (Satori cannot read woff2), subset to
 * just the characters an image needs. Same approach as Vercel's og examples.
 * Results are kept in memory per server instance; returns null if the font
 * cannot be fetched, so callers can fall back.
 */
const cache = new Map<string, Promise<ArrayBuffer | null>>();

async function fetchFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  const key = `${family}|${weight}|${text}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = fetchFont(family, weight, text).then((font) => {
      if (!font) cache.delete(key); // retry next time instead of caching a failure
      return font;
    });
    cache.set(key, hit);
  }
  return hit;
}

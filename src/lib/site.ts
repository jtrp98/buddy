/** Shared copy and URLs for link previews (Discord, LINE, Facebook, X …). */

export const SITE_NAME = "Secret Buddy";
export const SITE_TITLE = "Secret Buddy — แลกของขวัญแบบลับ ๆ คริสต์มาสนี้";
export const SITE_DESCRIPTION =
  "สร้างปาร์ตี้แลกของขวัญแบบลับ ๆ ได้ในนาทีเดียว เพื่อน ครอบครัว ห้องเรียน หรือที่ทำงานก็เล่นได้ แชร์ลิงก์ให้ทุกคนเขียน Wish List แล้วลุ้นเปิดกล่องไปพร้อมกัน ไม่ต้องสมัครบัญชี";

/** Path of the generated site-wide preview image (app/opengraph-image.tsx). */
export const SITE_OG_IMAGE = "/opengraph-image";

/** Absolute base for link previews: the production domain on Vercel, else APP_URL, else localhost. */
export function siteUrl(): URL {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return new URL(prod.startsWith("http") ? prod : `https://${prod}`);
  const configured = process.env.APP_URL?.trim();
  if (configured) return new URL(configured);
  return new URL("http://localhost:3000");
}

const PREVIEW_IMAGES = [{ url: SITE_OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }];

/** Preview card fields that keep the site image (child openGraph objects replace the parent's). */
export function previewCard(title: string, description: string) {
  return {
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      locale: "th_TH",
      title,
      description,
      images: PREVIEW_IMAGES,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
  };
}

/**
 * Metadata for personal links (Buddy result, profile, email verification).
 * A neutral card that says nothing about who the link belongs to or the match,
 * in case someone pastes their link into a chat by mistake.
 */
export function privateLinkMetadata() {
  const title = "Secret Buddy — ลิงก์ส่วนตัว";
  const description = "ลิงก์นี้เป็นลิงก์ส่วนตัวของผู้เข้าร่วม Secret Buddy เปิดได้เฉพาะเจ้าของ โปรดอย่าส่งต่อให้คนอื่น";
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    ...previewCard(title, description),
  };
}

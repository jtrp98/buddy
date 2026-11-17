import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og/fonts";
import { previewSceneSvg } from "@/lib/og/scene";

export const alt = "Secret Buddy — แลกของขวัญแบบลับ ๆ คริสต์มาสนี้";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image renderer can't stack a tone mark above an upper vowel (e.g. ที่, เพื่อน, นี้),
// so the Thai here deliberately avoids those combinations.
const KICKER = "ส่งความลับดี ๆ ให้กันในวันคริสต์มาส";
const SUBTITLE = "แลกของขวัญแบบลับ ๆ";
const GROUPS = ["คนสนิท", "ครอบครัว", "ห้องเรียน", "ออฟฟิศ"];
const BRAND = "Secret Buddy";

/** Site-wide link preview: the night scene with the lit tree, plus the title. */
export default async function OpengraphImage() {
  const thaiText = [KICKER, SUBTITLE, ...GROUPS, "·"].join("");
  const [thai, thaiBold, display] = await Promise.all([
    loadGoogleFont("IBM Plex Sans Thai", 500, thaiText),
    loadGoogleFont("IBM Plex Sans Thai", 700, thaiText),
    loadGoogleFont("Fraunces", 600, BRAND),
  ]);
  const hasThai = Boolean(thai && thaiBold);

  const fonts = [
    thai && { name: "Plex Thai", data: thai, weight: 500 as const, style: "normal" as const },
    thaiBold && { name: "Plex Thai", data: thaiBold, weight: 700 as const, style: "normal" as const },
    display && { name: "Fraunces", data: display, weight: 600 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: "normal" }[];

  const background = `data:image/svg+xml;base64,${Buffer.from(previewSceneSvg()).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Plex Thai" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={background} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 40px 80px",
            width: 640,
            height: "100%",
          }}
        >
          {hasThai && <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: "#dcb75e" }}>{KICKER}</div>}
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontFamily: display ? "Fraunces" : undefined,
              fontSize: 104,
              fontWeight: 600,
              lineHeight: 1.05,
              color: "#fff8e7",
              letterSpacing: -1,
            }}
          >
            {BRAND}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 52, fontWeight: 700, color: "#ebcb7f" }}>
            {hasThai ? SUBTITLE : "Secret gift exchange"}
          </div>
          <div style={{ display: "flex", marginTop: 34, gap: 12 }}>
            {(hasThai ? GROUPS : ["Friends", "Family", "Class", "Work"]).map((g) => (
              <div
                key={g}
                style={{
                  display: "flex",
                  padding: "6px 18px",
                  borderRadius: 999,
                  border: "1.5px solid rgba(255,248,231,0.28)",
                  background: "rgba(8,18,36,0.55)",
                  fontSize: 24,
                  fontWeight: 500,
                  color: "#d8e3da",
                }}
              >
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

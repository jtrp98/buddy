import { NextResponse } from "next/server";

export function jsonNoStore(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
    },
  });
}

export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token.length > 0) return token;
  }
  const headerToken = req.headers.get("x-member-token")?.trim();
  return headerToken && headerToken.length > 0 ? headerToken : null;
}

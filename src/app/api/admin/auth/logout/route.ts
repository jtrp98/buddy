import { buildClearAdminCookieOptions } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";

export async function POST() {
  const res = jsonNoStore({ ok: true });
  res.cookies.set(buildClearAdminCookieOptions());
  return res;
}

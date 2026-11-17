import { jsonNoStore } from "@/lib/api-response";
import { processDueGroupDraws } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return jsonNoStore({ error: "Unauthorized" }, 401);
    }
  } else if (process.env.NODE_ENV === "production") {
    return jsonNoStore({ error: "CRON_SECRET not configured" }, 500);
  }

  const summary = await processDueGroupDraws(getAppBaseUrl(req));
  return jsonNoStore({ ok: true, ...summary });
}

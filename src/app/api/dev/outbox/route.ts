import { jsonNoStore } from "@/lib/api-response";
import { clearDevOutbox, readDevOutbox } from "@/lib/email/mailer";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return jsonNoStore({ error: "Not found" }, 404);
  }
  const items = await readDevOutbox();
  return jsonNoStore({ items });
}

export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return jsonNoStore({ error: "Not found" }, 404);
  }
  await clearDevOutbox();
  return jsonNoStore({ ok: true });
}

import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }
  return jsonNoStore({ admin: session });
}

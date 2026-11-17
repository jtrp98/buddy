import { redirect } from "next/navigation";

/** The list of groups lives on the admin dashboard. */
export default function AdminGroupsIndexPage() {
  redirect("/admin");
}

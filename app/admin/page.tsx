import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/admin-app";
import { isAdmin } from "@/lib/require-admin";
import { getContentFresh, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminApp initial={await getContentFresh()} storage={storageMode()} />;
}

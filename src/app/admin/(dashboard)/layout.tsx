import { requireAdminSession } from "@/lib/auth";

/**
 * The gate. Everything in this group is behind a valid session; /admin/login
 * sits outside it, which is why the group exists at all.
 *
 * Pages in here should still call `requireAdminSession` for the identity they
 * need — a layout does not re-run on every navigation within its own tree, so
 * it is the outer fence rather than the only check.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return <>{children}</>;
}

import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdminSession } from "@/lib/auth";

/** A placeholder. The menu editor lands here next. */
export default async function AdminDashboard() {
  const admin = await requireAdminSession();

  return (
    <main className="mx-auto min-h-svh w-full max-w-[60rem] px-6 py-16 md:px-10 md:py-24">
      <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-foreground/15 pb-8">
        <div>
          <p className="tracked-label text-[0.6rem] tracking-[0.24em] uppercase opacity-40">
            piatto
          </p>
          <h1 className="display-tight mt-4 text-[2rem] leading-[1.2]">
            Admin
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[0.78rem] text-foreground/50">
            {admin.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      <p className="mt-12 max-w-[34rem] text-[0.86rem] leading-[1.9] text-foreground/55">
        The menu editor goes here. For now this page only proves the way in is
        shut: everything under /admin needs a session, and /admin/login is the
        only way to get one.
      </p>
    </main>
  );
}

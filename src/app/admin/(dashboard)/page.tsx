import { LogoutButton } from "@/components/admin/logout-button";
import { MenuEditor } from "@/components/admin/menu-editor";
import { readEditorMenu } from "@/lib/admin/menu";
import { DOMAINS } from "@/lib/admin/menu-types";
import { requireAdminSession } from "@/lib/auth";

/**
 * The menu editor.
 *
 * Both menus are read here, on the server, and handed down as plain objects —
 * the browser never sees Prisma or the connection string. The read is not
 * cached: the public pages are the ones that want a static menu, and this page
 * wants the row as it stands.
 *
 * The layout above already requires a session; asking again is deliberate,
 * since a layout does not re-run on every navigation into its tree.
 */
export default async function AdminDashboard() {
  const admin = await requireAdminSession();

  const menus = await Promise.all(DOMAINS.map(readEditorMenu));

  return (
    <main className="mx-auto min-h-svh w-full max-w-[64rem] px-5 py-12 sm:px-8 md:px-10 md:py-16">
      <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-foreground/15 pb-8">
        <div>
          <p className="tracked-label text-[0.6rem] tracking-[0.24em] uppercase opacity-40">
            piatto
          </p>
          <h1 className="display-tight mt-3 text-[1.75rem] leading-[1.2] sm:text-[2rem]">
            Menu
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="text-[0.78rem] text-foreground/50">
            {admin.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      <p className="mt-6 max-w-[38rem] text-[0.82rem] leading-[1.8] text-foreground/50">
        Changes go live on the public menu as soon as they are saved.
      </p>

      <div className="mt-10">
        <MenuEditor menus={menus} />
      </div>
    </main>
  );
}

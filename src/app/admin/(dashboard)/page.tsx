import { AdminLanguageToggle } from "@/components/admin/language";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminWorkspace } from "@/components/admin/workspace";
import { readEditorGallery } from "@/lib/admin/gallery";
import { adminStrings } from "@/lib/admin/i18n";
import { readAdminLocale } from "@/lib/admin/locale";
import { readEditorMenu } from "@/lib/admin/menu";
import { DOMAINS } from "@/lib/admin/menu-types";
import { requireAdminSession } from "@/lib/auth";

/**
 * The dashboard: the menu editor and the gallery manager, behind one sign-in.
 *
 * Both menus and every photograph are read here, on the server, and handed down
 * as plain objects — the browser never sees Prisma, the connection string or the
 * blob token. Neither read is cached: the public pages are the ones that want
 * something static, and this page wants the rows as they stand.
 *
 * The layout above already requires a session; asking again is deliberate,
 * since a layout does not re-run on every navigation into its tree.
 */
export default async function AdminDashboard() {
  const admin = await requireAdminSession();
  const strings = adminStrings(await readAdminLocale());

  const [menus, photos] = await Promise.all([
    Promise.all(DOMAINS.map(readEditorMenu)),
    readEditorGallery(),
  ]);

  return (
    <main className="mx-auto min-h-svh w-full max-w-[64rem] px-5 py-12 sm:px-8 md:px-10 md:py-16">
      <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-foreground/15 pb-8">
        <div>
          <p
            lang="en"
            dir="ltr"
            className="tracked-label font-latin-serif text-[0.6rem] tracking-[0.24em] uppercase opacity-40"
          >
            piatto
          </p>
          <h1 className="display-tight mt-3 text-[1.75rem] leading-[1.2] sm:text-[2rem]">
            {strings.adminTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span dir="ltr" className="text-[0.78rem] text-foreground/50">
            {admin.email}
          </span>
          <AdminLanguageToggle />
          <LogoutButton />
        </div>
      </header>

      <div className="mt-10">
        <AdminWorkspace menus={menus} photos={photos} />
      </div>
    </main>
  );
}

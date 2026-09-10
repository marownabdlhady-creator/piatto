import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { adminStrings } from "@/lib/admin/i18n";
import { readAdminLocale } from "@/lib/admin/locale";
import { getAdminSession } from "@/lib/auth";

/** The one page under /admin that a stranger is allowed to see. */
export default async function AdminLogin() {
  // Someone already signed in has no business on a sign-in form.
  if (await getAdminSession()) redirect("/admin");

  // The interface language outlives the session, so the login page is already
  // in whichever one the dashboard was left in.
  const strings = adminStrings(await readAdminLocale());

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-[24rem]">
        <header className="text-center">
          <p
            lang="en"
            dir="ltr"
            className="tracked-label font-latin-serif text-[0.6rem] tracking-[0.24em] uppercase opacity-40"
          >
            piatto
          </p>
          <h1 className="display-tight mt-5 text-[2rem] leading-[1.2]">
            {strings.adminTitle}
          </h1>
        </header>

        <div className="mt-14">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

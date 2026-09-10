import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

/** The one page under /admin that a stranger is allowed to see. */
export default async function AdminLogin() {
  // Someone already signed in has no business on a sign-in form.
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-[24rem]">
        <header className="text-center">
          <p className="tracked-label text-[0.6rem] tracking-[0.24em] uppercase opacity-40">
            piatto
          </p>
          <h1 className="display-tight mt-5 text-[2rem] leading-[1.2]">
            Admin
          </h1>
        </header>

        <div className="mt-14">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

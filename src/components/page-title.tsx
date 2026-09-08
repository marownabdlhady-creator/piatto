import type { ReactNode } from "react";

/**
 * Shared shell for the placeholder routes: title only, until each of those
 * pages is actually built.
 */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <h1 className="text-center text-[1.6rem] tracking-[0.16em] md:text-[2rem]">
        {children}
      </h1>
    </main>
  );
}

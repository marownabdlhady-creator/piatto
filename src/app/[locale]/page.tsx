import { setRequestLocale } from "next-intl/server";

import { About } from "@/components/about";
import { Hero } from "@/components/hero";
import { SiteNav } from "@/components/site-nav";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <About />
      </main>
    </>
  );
}

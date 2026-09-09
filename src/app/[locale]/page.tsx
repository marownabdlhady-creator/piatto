import { setRequestLocale } from "next-intl/server";

import { About } from "@/components/about";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Interlude } from "@/components/interlude";
import { Reserve } from "@/components/reserve";
import { SiteNav } from "@/components/site-nav";
import { Spaces } from "@/components/spaces";

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
        <Spaces />
        <Interlude />
        <Features />
        <Reserve />
      </main>
    </>
  );
}

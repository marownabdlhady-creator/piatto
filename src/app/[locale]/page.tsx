import { getTranslations, setRequestLocale } from "next-intl/server";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("common");

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="text-4xl tracking-tight">{t("siteName")}</h1>
    </main>
  );
}

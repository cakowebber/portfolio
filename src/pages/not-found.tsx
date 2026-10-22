import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="container flex min-h-screen flex-col justify-center py-24">
      <p className="eyebrow">404 · dead letter</p>
      <h1 className="mt-6 max-w-3xl font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em] text-balance">{t("notFound.title")}</h1>
      <p className="mt-6 max-w-md text-[17px] text-muted-foreground">{t("notFound.description")}</p>
      <a
        href="/"
        className="group mt-10 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-medium text-background hover:bg-primary hover:text-primary-foreground">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {t("notFound.back")}
      </a>
    </main>
  );
}

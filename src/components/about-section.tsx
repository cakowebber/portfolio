import { Trans, useTranslation } from "react-i18next";
import SectionHeading from "@/components/section-heading";
import ClaudeBuddy from "@/components/claude-buddy";
import { Reveal } from "@/components/reveal";
import { useLocale } from "@/hooks/use-locale";
import { recognitions, stack } from "@/lib/content";

const nowRows = ["work", "study", "thesis", "play"] as const;

export default function AboutSection() {
  const { t } = useTranslation();
  const { pick } = useLocale();

  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container">
        <SectionHeading eyebrow={t("about.eyebrow")} title={<Trans i18nKey="about.title" components={[<em />]} />} />

        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <Reveal className="space-y-5 text-[17px] leading-[1.7] text-foreground/85 text-pretty">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <p className="eyebrow mb-4">{t("about.nowTitle")}</p>
              <dl className="divide-y divide-border">
                {nowRows.map((row) => (
                  <div key={row} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3 text-[15px]">
                    <dt className="text-muted-foreground">{t(`about.now.${row}`)}</dt>
                    <dd>{t(`about.now.${row}Value`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16 border-t border-border pt-12">
          <Reveal>
            <h3 className="eyebrow mb-6">{t("about.stackTitle")}</h3>
            <dl className="space-y-4">
              {stack.map((group) => (
                <div key={group.label.en} className="grid gap-2 sm:grid-cols-[7.5rem_1fr] sm:gap-4 sm:items-baseline">
                  <dt className="font-serif text-[22px] leading-none">{pick(group.label)}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="chip text-foreground/80 transition-colors hover:border-primary hover:text-primary">
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
              <div className="grid gap-2 sm:grid-cols-[7.5rem_1fr] sm:gap-4 sm:items-end">
                <dt className="font-serif text-[22px] leading-none">{t("about.sidekick")}</dt>
                <dd className="flex items-end gap-3">
                  <span className="chip text-foreground/80">Claude Code</span>
                  <ClaudeBuddy />
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="space-y-10">
            <div>
              <h3 className="eyebrow mb-5">{t("about.recognitionsTitle")}</h3>
              <ul className="space-y-2.5 text-[15px]">
                {recognitions.map((item) => (
                  <li key={item.en} className="flex gap-3">
                    <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    {pick(item)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow mb-3">{t("about.languagesTitle")}</h3>
              <p className="text-[15px]">{t("about.languages")}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import SectionHeading from "@/components/section-heading";
import { ease } from "@/components/reveal";
import { useLocale } from "@/hooks/use-locale";
import { experience, profile, type Experience, type Metric } from "@/lib/content";
import { cn } from "@/lib/utils";

function formatPeriod(item: Experience, intl: string, present: string) {
  const format = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    const name = new Intl.DateTimeFormat(intl, { month: "short" }).format(new Date(year, month - 1)).replace(".", "");
    return `${name} ${year}`;
  };
  return `${format(item.start)} — ${item.end ? format(item.end) : present}`;
}

// Número que conta de zero até o valor quando aparece na tela, e conta de novo ao passar o mouse.
function MetricTile({ metric, index }: { metric: Metric; index: number }) {
  const { t } = useTranslation();
  const { pick, intl } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [display, setDisplay] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, metric.value, { duration: 1.4, delay: run === 0 ? 0.15 + index * 0.1 : 0, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, run, metric.value, index]);

  const format = new Intl.NumberFormat(intl, metric.compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 0 });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setRun((n) => n + 1)}
      className={cn(
        "group/metric relative overflow-hidden rounded-xl border bg-card/60 p-4 transition-colors hover:border-primary/50 md:p-5",
        metric.draft ? "border-dashed border-signal-warn/50" : "border-border",
      )}>
      <p className="font-serif text-[clamp(2.2rem,4vw,3rem)] leading-none tabular-nums">
        {metric.prefix}
        {format.format(metric.value < 10 ? Math.round(display) : display)}
        {metric.suffix}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{pick(metric.label)}</p>
      {metric.draft && <span className="absolute right-2.5 top-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-signal-warn">{t("experience.draft")}</span>}
      <motion.span
        className="absolute bottom-0 left-0 h-[2px] bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: inView ? "100%" : "0%" }}
        transition={{ duration: 1.4, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export default function ExperienceSection() {
  const { t } = useTranslation();
  const { pick, intl } = useLocale();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="experience" className="py-24 md:py-32">
      <div className="container">
        <SectionHeading
          eyebrow={t("experience.eyebrow")}
          title={<Trans i18nKey="experience.title" components={[<em />]} />}
          aside={
            <a
              href={profile.cv}
              download="Carlos-Miguel-CV.pdf"
              className="group inline-flex h-11 w-fit items-center gap-2 rounded-full border border-border px-5 text-[14px] font-medium transition-colors hover:border-foreground/40 hover:bg-accent">
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              {t("experience.cv")}
            </a>
          }
        />

        <ol className="border-t border-border">
          {experience.map((item, index) => {
            const isOpen = open === index;
            // Números de exemplo (draft) só aparecem em desenvolvimento.
            const metrics = (item.metrics ?? []).filter((metric) => import.meta.env.DEV || !metric.draft);

            return (
              <motion.li
                key={`${item.company}-${item.start}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.7, ease, delay: index * 0.04 }}
                className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-label={`${pick(item.role)}, ${item.company}. ${isOpen ? t("experience.collapse") : t("experience.expand")}`}
                  className="group grid w-full grid-cols-[1fr_auto] items-start gap-x-6 gap-y-1 py-6 text-left md:grid-cols-[11rem_1fr_auto] md:items-baseline md:py-7"
                  data-testid={`experience-${index}`}>
                  <span className="order-2 col-span-2 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground md:order-none md:col-span-1">
                    {formatPeriod(item, intl, t("experience.present"))}
                  </span>
                  <span className="order-1 md:order-none">
                    <span className="block font-serif text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.05] transition-colors group-hover:text-primary">{pick(item.role)}</span>
                    <span className="mt-1 block text-[15px] text-muted-foreground">
                      {item.company} · {pick(item.mode)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "order-1 mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-all duration-300 md:order-none group-hover:border-foreground/40",
                      isOpen && "rotate-45 bg-foreground text-background border-foreground",
                    )}
                    aria-hidden>
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                      className="overflow-hidden">
                      <div className="grid gap-5 pb-8 md:grid-cols-[11rem_1fr_auto] md:gap-x-6">
                        <div className="hidden md:block" />
                        <div className="max-w-3xl">
                          <p className="text-[17px] leading-relaxed text-foreground/90 text-pretty">{pick(item.summary)}</p>
                          {metrics.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                              {metrics.map((metric, i) => (
                                <MetricTile key={metric.label.en} metric={metric} index={i} />
                              ))}
                            </div>
                          )}
                          {item.highlights.length > 0 && (
                            <ul className="mt-5 space-y-3">
                              {item.highlights.map((highlight) => (
                                <li key={highlight.en} className="grid grid-cols-[1rem_1fr] text-[15px] leading-relaxed text-muted-foreground">
                                  <span className="mt-[0.7em] h-px w-2.5 bg-primary" aria-hidden />
                                  {pick(highlight)}
                                </li>
                              ))}
                            </ul>
                          )}
                          {item.stack.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-1.5">
                              {item.stack.map((tech) => (
                                <span key={tech} className="chip">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="hidden w-9 md:block" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

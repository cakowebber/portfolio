import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, MousePointerClick } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import PipelineToy from "@/components/pipeline-toy";
import { ease } from "@/components/reveal";
import { useLocale } from "@/hooks/use-locale";
import { useLocalTime } from "@/hooks/use-local-time";
import { profile, socials } from "@/lib/content";
import profileImage from "@/assets/Perfil.jpg";

const rise = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 1, ease } },
};

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

// Máscara da animação de subida. O respiro extra embaixo (compensado pela margem negativa) evita
// cortar descendentes como o "g" do itálico.
const mask = "inline-block overflow-hidden pb-[0.22em] -mb-[0.22em] pr-[0.06em] -mr-[0.06em] align-bottom";

export default function HeroSection() {
  const { t } = useTranslation();
  const { intl } = useLocale();
  const time = useLocalTime(intl);

  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-20 md:pb-28">
      <motion.div className="container" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}>
        <motion.div variants={fade} className="eyebrow flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-ok animate-pulse-dot" aria-hidden />
            {t("hero.role")}
          </span>
          <span className="tabular-nums">
            {t("hero.location")} · {time}
          </span>
        </motion.div>

        <h1 className="mt-8 md:mt-10 font-serif text-[clamp(3.4rem,12vw,9rem)] leading-[0.9] tracking-[-0.02em]" data-testid="hero-title">
          <span className={mask}>
            <motion.span variants={rise} className="inline-block">
              Carlos
            </motion.span>
          </span>{" "}
          <motion.span
            variants={{ hidden: { scale: 0.4, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { duration: 0.9, ease } } }}
            whileHover={{ rotate: -4, scale: 1.06 }}
            className="relative -top-[0.04em] mx-[0.04em] inline-block h-[0.74em] w-[1.32em] overflow-hidden rounded-full align-middle bg-muted ring-1 ring-border">
            <img src={profileImage} alt={t("hero.photoAlt")} className="h-full w-full object-cover object-[50%_30%]" data-testid="profile-image" />
          </motion.span>{" "}
          <span className={mask}>
            <motion.span variants={rise} className="inline-block italic">
              Miguel
            </motion.span>
          </span>
        </h1>

        <div className="mt-10 md:mt-14 grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:items-start">
          <motion.p variants={fade} className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] tracking-[-0.01em] text-balance [&_em]:italic [&_em]:text-primary">
            <Trans i18nKey="hero.statement" components={[<em />]} />
          </motion.p>

          <motion.div variants={fade}>
            <p className="text-[16.5px] leading-relaxed text-muted-foreground text-pretty" data-testid="hero-description">
              {t("hero.intro")}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                data-testid="view-projects-btn">
                {t("hero.ctaProjects")}
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href={profile.cv}
                download="Carlos-Miguel-CV.pdf"
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[14px] font-medium transition-colors hover:border-foreground/40 hover:bg-accent"
                data-testid="download-cv-btn">
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                {t("hero.ctaCv")}
              </a>
              <span className="flex items-center gap-4 pl-1">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-0.5 font-mono text-[12px] text-muted-foreground hover:text-foreground">
                    {social.label}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div variants={fade} className="mt-16 md:mt-24">
          <PipelineToy />
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:gap-10 text-[13.5px] leading-relaxed text-muted-foreground">
            <p className="max-w-2xl text-pretty">{t("pipeline.caption")}</p>
            <p className="flex items-center gap-2 font-mono text-[12px] text-foreground/80 md:justify-end">
              <MousePointerClick className="h-4 w-4 text-primary" />
              {t("pipeline.hint")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

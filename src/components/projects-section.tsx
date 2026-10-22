import { ArrowUpRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Trans, useTranslation } from "react-i18next";
import SectionHeading from "@/components/section-heading";
import { Reveal, ease } from "@/components/reveal";
import { CalendarVisual, EnergyVisual, RecommendationsVisual } from "@/components/project-visuals";
import { useLocale } from "@/hooks/use-locale";
import { archive, projects, type Project } from "@/lib/content";
import { cn } from "@/lib/utils";

function ProjectVisual({ project }: { project: Project }) {
  const { visual } = project;
  if (visual.kind === "energy") return <EnergyVisual />;
  if (visual.kind === "calendar") return <CalendarVisual />;
  if (visual.kind === "recommendations") return <RecommendationsVisual />;

  return (
    <img
      src={visual.src}
      alt={project.title}
      loading="lazy"
      decoding="async"
      className={cn("absolute inset-0 h-full w-full transition-transform duration-1000 ease-out group-hover:scale-[1.035]", visual.fit === "contain" ? "object-contain p-2 md:p-4" : "object-cover")}
    />
  );
}

function ProjectLinks({ project }: { project: Project }) {
  const { t } = useTranslation();
  const { pick } = useLocale();

  if (project.links.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        {t("projects.private")}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {project.links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1 text-[14px] font-medium text-foreground hover:text-primary"
          data-testid={`project-link-${project.slug}`}>
          <span className="link-underline">{pick(link.label)}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { pick } = useLocale();
  const isFull = project.span === "full";
  const tone = project.visual.kind === "image" ? project.visual.tone : undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease, delay: isFull ? 0 : (index % 2) * 0.08 }}
      className={cn("group", isFull && "md:col-span-2 md:grid md:grid-cols-[1.55fr_1fr] md:items-end md:gap-12")}
      data-testid={`project-${project.slug}`}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[20px] border border-border",
          isFull ? "aspect-[16/10] md:aspect-[16/9]" : "aspect-[16/10]",
          tone === "light" ? "bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#ece8de_70%)] dark:bg-[radial-gradient(circle_at_50%_40%,#2a2822_0%,#1b1a16_70%)]" : "bg-muted",
        )}>
        <ProjectVisual project={project} />
      </div>

      <div className={cn("mt-6", isFull && "md:mt-0 md:pb-2")}>
        <p className="eyebrow">
          {pick(project.kind)} · {project.year}
        </p>
        <h3 className={cn("mt-3 font-serif leading-[0.95] tracking-[-0.01em]", isFull ? "text-[clamp(2.75rem,5vw,4.5rem)]" : "text-[clamp(2.1rem,3.4vw,2.75rem)]")}>{project.title}</h3>
        <p className="mt-2 font-serif text-[21px] italic leading-snug text-primary">{pick(project.tagline)}</p>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-muted-foreground text-pretty">{pick(project.description)}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.metrics.map((metric) => (
            <li key={metric.en} className="chip gap-1.5 text-foreground/85">
              <span className="h-1 w-1 rounded-full bg-primary" aria-hidden />
              {pick(metric)}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <p className="font-mono text-[11.5px] text-muted-foreground">{project.stack.join(" · ")}</p>
          <ProjectLinks project={project} />
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsSection() {
  const { t } = useTranslation();
  const { pick } = useLocale();

  return (
    <section id="projects" className="py-24 md:py-32">
      <div className="container">
        <SectionHeading eyebrow={t("projects.eyebrow")} title={<Trans i18nKey="projects.title" components={[<em />]} />} subtitle={t("projects.subtitle")} />

        <div className="grid gap-x-10 gap-y-20 md:grid-cols-2 md:gap-y-24">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        <div className="mt-28 md:mt-36">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none">{t("projects.archiveTitle")}</h3>
            <p className="max-w-sm text-[14px] text-muted-foreground">{t("projects.archiveHint")}</p>
          </Reveal>

          <ul className="border-t border-border">
            {archive.map((item, index) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.04 }}
                className="border-b border-border">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 transition-colors md:grid-cols-[4rem_15rem_1fr_13rem_auto] md:px-3 md:-mx-3 md:rounded-lg hover:bg-accent/60">
                  <span className="hidden font-mono text-[12px] text-muted-foreground md:block">{item.year}</span>
                  <span className="font-serif text-[24px] leading-tight transition-colors group-hover:text-primary">{item.title}</span>
                  <span className="col-span-2 row-start-2 text-[14.5px] text-muted-foreground md:col-span-1 md:row-start-auto">{pick(item.description)}</span>
                  <span className="hidden font-mono text-[11.5px] text-muted-foreground md:block">{item.stack}</span>
                  <ArrowUpRight className="col-start-2 row-start-1 h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary md:col-start-auto md:row-start-auto" />
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

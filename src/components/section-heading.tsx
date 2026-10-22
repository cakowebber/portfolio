import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
};

export default function SectionHeading({ eyebrow, title, subtitle, aside }: SectionHeadingProps) {
  return (
    <Reveal className="mb-12 md:mb-16 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="eyebrow mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-line" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="font-serif text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.01em] text-balance max-w-4xl [&_em]:italic [&_em]:text-primary">{title}</h2>
        {subtitle && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground text-pretty">{subtitle}</p>}
      </div>
      {aside}
    </Reveal>
  );
}

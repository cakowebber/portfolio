import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/use-locale";
import { useLocalTime } from "@/hooks/use-local-time";
import { profile, socials } from "@/lib/content";

export default function Footer() {
  const { t } = useTranslation();
  const { intl } = useLocale();
  const time = useLocalTime(intl);

  return (
    <footer className="border-t border-border">
      <div className="container py-14 md:py-20">
        <p className="font-serif text-[clamp(3.5rem,14vw,11rem)] leading-[0.85] tracking-[-0.03em] text-foreground/90" aria-hidden>
          Carlos <span className="italic text-primary">Miguel</span>
        </p>

        <div className="mt-12 grid gap-6 font-mono text-[12px] text-muted-foreground md:grid-cols-3 md:items-end">
          <p>
            © {new Date().getFullYear()} {profile.name}
            <br />
            {t("footer.madeIn")} · {t("footer.localTime")} <span className="tabular-nums text-foreground">{time}</span>
            <br />
            {/* Responde com um cartão em texto, ver netlify/edge-functions/terminal.ts */}
            <span className="select-all">$ curl -L {new URL(profile.site).host}</span>
          </p>
          <p className="flex gap-5 md:justify-center">
            {socials.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-foreground">
                {social.label}
              </a>
            ))}
            <a href={`mailto:${profile.email}`} className="link-underline hover:text-foreground">
              E-mail
            </a>
          </p>
          <a href="#top" className="group inline-flex items-center gap-1.5 hover:text-foreground md:justify-self-end">
            {t("footer.backToTop")}
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

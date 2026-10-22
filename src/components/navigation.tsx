import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { shortcutLabel } from "@/components/command-menu";
import { useLocale } from "@/hooks/use-locale";
import { ease } from "@/components/reveal";
import { cn } from "@/lib/utils";

const sections = ["about", "experience", "projects", "contact"] as const;

function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { lang, toggle } = useLocale();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("nav.language")}
      className={cn("inline-flex h-9 items-center gap-1 rounded-full px-3 font-mono text-[11px] tracking-[0.12em] transition-colors hover:bg-accent", className)}
      data-testid="language-toggle">
      <span className={lang === "pt" ? "text-foreground" : "text-muted-foreground"}>PT</span>
      <span className="text-line">/</span>
      <span className={lang === "en" ? "text-foreground" : "text-muted-foreground"}>EN</span>
    </button>
  );
}

function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("nav.theme")}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent", className)}
      data-testid="theme-toggle">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
          transition={{ duration: 0.25, ease }}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Navigation({ onCommand }: { onCommand: () => void }) {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      setIsScrolled(window.scrollY > 12);

      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 border-b",
        isScrolled || isOpen ? "bg-background/80 backdrop-blur-md border-border/80" : "bg-transparent border-transparent",
      )}>
      <nav className="container flex h-16 items-center justify-between">
        <a href="#top" aria-label={t("nav.home")} className="font-serif text-[28px] leading-none tracking-tight" onClick={() => setIsOpen(false)}>
          cm<span className="text-primary">.</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {sections.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn("relative rounded-full px-3.5 py-2 text-[14px] transition-colors hover:text-foreground", active === id ? "text-foreground" : "text-muted-foreground")}
              data-testid={`nav-${id}`}>
              {t(`nav.${id}`)}
              {active === id && <motion.span layoutId="nav-active" className="absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" transition={{ duration: 0.4, ease }} />}
            </a>
          ))}
          <span className="mx-2 h-4 w-px bg-border" aria-hidden />
          <button
            type="button"
            onClick={onCommand}
            aria-label={t("command.open")}
            aria-keyshortcuts="Meta+K Control+K"
            className="inline-flex h-9 items-center rounded-full px-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            data-testid="command-toggle">
            {shortcutLabel}
          </button>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? t("nav.close") : t("nav.menu")}
            aria-expanded={isOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
            data-testid="mobile-menu-toggle">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="md:hidden h-[calc(100dvh-4rem)] border-t border-border bg-background"
            data-testid="mobile-menu">
            <div className="container flex h-full flex-col justify-between py-8">
              <ul className="space-y-1">
                {sections.map((id, index) => (
                  <motion.li key={id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease, delay: 0.05 * index }}>
                    <a href={`#${id}`} onClick={() => setIsOpen(false)} className="flex items-baseline gap-4 py-2 font-serif text-5xl">
                      <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                      {t(`nav.${id}`)}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <LanguageToggle className="self-start -ml-3 text-[13px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

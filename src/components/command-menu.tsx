import { useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { emitCommand } from "@/hooks/use-command-event";
import { useLocale } from "@/hooks/use-locale";
import { useToast } from "@/hooks/use-toast";
import { profile, projects, socials } from "@/lib/content";

export const shortcutLabel = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K";

const sections = ["about", "experience", "projects", "github", "contact"] as const;

// Comandos que não aparecem na lista: só respondem a quem digita exatamente um deles.
const secrets = [
  { id: "incident", triggers: ["rm -rf /", "sudo rm -rf /"] },
  { id: "hire", triggers: ["sudo hire", "sudo contratar"] },
  { id: "quit", triggers: [":q", ":q!", ":wq", "exit"] },
] as const;

type ItemProps = ComponentPropsWithoutRef<typeof Command.Item> & { hint?: ReactNode; external?: boolean };

function Item({ children, hint, external, ...props }: ItemProps) {
  return (
    <Command.Item {...props} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-[14.5px] outline-none data-[selected=true]:bg-accent">
      <span className="truncate">{children}</span>
      {(hint || external) && (
        <span className="flex shrink-0 items-center gap-1 font-mono text-[11.5px] text-muted-foreground">
          {hint}
          {external && <ArrowUpRight className="h-3.5 w-3.5" />}
        </span>
      )}
    </Command.Item>
  );
}

export default function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { pick, toggle: toggleLanguage } = useLocale();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const query = search.trim().toLowerCase();
  const secret = secrets.find((item) => item.triggers.some((trigger) => trigger === query));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Copiar, baixar e abrir aba precisam acontecer ainda dentro do clique (o Safari exige);
  // rolar a página e mexer em outros componentes fica para depois que o diálogo sai.
  const now = (action: () => void) => () => {
    action();
    onOpenChange(false);
  };
  const afterClose = (action: () => void) => () => {
    onOpenChange(false);
    window.setTimeout(action, 80);
  };

  const scrollTo = (selector: string, block: ScrollLogicalPosition = "start") => document.querySelector(selector)?.scrollIntoView({ block });
  const openTab = (href: string) => window.open(href, "_blank", "noopener,noreferrer");

  const copyEmail = () =>
    navigator.clipboard.writeText(profile.email).then(
      () => toast({ title: t("command.copied"), description: profile.email }),
      () => {},
    );

  const downloadCv = () => {
    const link = document.createElement("a");
    link.href = profile.cv;
    link.download = "Carlos-Miguel-CV.pdf";
    link.click();
  };

  const runSecret = (id: (typeof secrets)[number]["id"]) => {
    if (id === "incident") return afterClose(() => emitCommand("incident"));
    if (id === "hire") return now(() => (window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(t("command.hireSubject"))}`));
    return () => onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/15 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className="fixed left-1/2 top-[14vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]"
          data-testid="command-menu">
          <DialogPrimitive.Title className="sr-only">{t("command.title")}</DialogPrimitive.Title>

          <Command
            loop
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center gap-3 border-b border-border px-5">
              <span className="font-mono text-[14px] text-primary" aria-hidden>
                $
              </span>
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={t("command.placeholder")}
                className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden font-mono text-[10.5px] text-muted-foreground sm:block">esc</kbd>
            </div>

            <Command.List className="max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="px-3 py-8 text-center text-[14px] text-muted-foreground">{t("command.empty")}</Command.Empty>

              {secret && (
                <Command.Group>
                  <Item value={query} hint={t(`command.${secret.id}`)} onSelect={runSecret(secret.id)}>
                    <span className="font-mono text-[13.5px]">{query}</span>
                  </Item>
                </Command.Group>
              )}

              <Command.Group heading={t("command.go")}>
                {sections.map((id) => {
                  const label = id === "github" ? "GitHub" : t(`nav.${id}`);
                  return (
                    <Item key={id} value={label} keywords={[id]} hint={`#${id}`} onSelect={afterClose(() => scrollTo(`#${id}`))}>
                      {label}
                    </Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading={t("command.projects")}>
                {projects.map((project) => {
                  const link = project.links[0];
                  return (
                    <Item
                      key={project.slug}
                      value={project.title}
                      keywords={[project.kind.pt, project.kind.en, ...project.stack]}
                      hint={link ? pick(link.label) : pick(project.kind)}
                      external={Boolean(link)}
                      onSelect={link ? now(() => openTab(link.href)) : afterClose(() => scrollTo(`[data-testid="project-${project.slug}"]`, "center"))}>
                      {project.title}
                    </Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading={t("command.actions")}>
                <Item value={t("command.copyEmail")} keywords={["email", "e-mail", "contato", "contact"]} hint={profile.email} onSelect={now(copyEmail)}>
                  {t("command.copyEmail")}
                </Item>
                <Item value={t("command.cv")} keywords={["cv", "currículo", "resume", "pdf"]} hint="PDF" onSelect={now(downloadCv)}>
                  {t("command.cv")}
                </Item>
                <Item
                  value={isDark ? t("command.light") : t("command.dark")}
                  keywords={["tema", "theme", "escuro", "claro", "dark", "light"]}
                  onSelect={now(() => setTheme(isDark ? "light" : "dark"))}>
                  {isDark ? t("command.light") : t("command.dark")}
                </Item>
                <Item value={t("command.language")} keywords={["idioma", "language", "english", "português"]} onSelect={now(toggleLanguage)}>
                  {t("command.language")}
                </Item>
                <Item value={t("command.snake")} keywords={["snake", "jogo", "game"]} onSelect={afterClose(() => emitCommand("snake"))}>
                  {t("command.snake")}
                </Item>
                {socials.map((social) => (
                  <Item key={social.label} value={`${social.label} @${social.handle}`} hint={`@${social.handle}`} external onSelect={now(() => openTab(social.href))}>
                    {social.label}
                  </Item>
                ))}
              </Command.Group>
            </Command.List>

            <p className="hidden border-t border-border px-5 py-2.5 font-mono text-[10.5px] text-muted-foreground sm:block">{t("command.hints")}</p>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

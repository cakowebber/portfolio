import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Download, Loader2, Send } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import emailjs from "@emailjs/browser";
import SectionHeading from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { useToast } from "@/hooks/use-toast";
import { profile, socials } from "@/lib/content";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emptyForm: ContactForm = { name: "", email: "", subject: "", message: "" };

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="group block border-b border-border pb-2 transition-colors focus-within:border-foreground">
      <span className="eyebrow block transition-colors group-focus-within:text-primary">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "mt-2 w-full bg-transparent text-[16px] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none";

export default function ContactSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<ContactForm>(emptyForm);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const update = (field: keyof ContactForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (Object.values(form).some((value) => !value.trim())) {
      toast({ title: t("contact.requiredTitle"), description: t("contact.requiredDescription"), variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          to_name: "Carlos Miguel",
          time: new Date().toISOString(),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      toast({ title: t("contact.successTitle"), description: t("contact.successDescription") });
      setForm(emptyForm);
    } catch (error) {
      console.error("Contact form error:", error);
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDescription"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container">
        <SectionHeading eyebrow={t("contact.eyebrow")} title={<Trans i18nKey="contact.title" components={[<em />]} />} subtitle={t("contact.subtitle")} />

        <div className="grid gap-16 md:grid-cols-[1fr_1fr] md:gap-20">
          <Reveal>
            <ul className="border-t border-border">
              {socials.map((social) => (
                <li key={social.label} className="border-b border-border">
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-5">
                    <span className="font-serif text-[30px] leading-none transition-colors group-hover:text-primary">{social.label}</span>
                    <span className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
                      @{social.handle}
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </span>
                  </a>
                </li>
              ))}
              <li className="flex items-center justify-between border-b border-border">
                <a href={`mailto:${profile.email}`} className="py-5 font-serif text-[30px] leading-none transition-colors hover:text-primary" data-testid="contact-email">
                  {t("contact.email")}
                </a>
                <button type="button" onClick={copyEmail} className="inline-flex items-center gap-2 py-5 font-mono text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                  {copied ? t("contact.copied") : t("contact.emailAction")}
                  {copied ? <Check className="h-4 w-4 text-signal-ok" /> : <Copy className="h-4 w-4" />}
                </button>
              </li>
              <li className="border-b border-border">
                <a href={profile.cv} download="Carlos-Miguel-CV.pdf" className="group flex items-center justify-between py-5" data-testid="contact-cv">
                  <span className="font-serif text-[30px] leading-none transition-colors group-hover:text-primary">{t("contact.cv")}</span>
                  <span className="flex items-center gap-2 font-mono text-[12px] text-muted-foreground">
                    {t("contact.cvAction")}
                    <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
                  </span>
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-7" noValidate>
              <p className="font-serif text-[26px] leading-none">{t("contact.formTitle")}</p>
              <div className="grid gap-7 sm:grid-cols-2">
                <Field id="contact-name" label={t("contact.name")}>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={update("name")}
                    placeholder={t("contact.namePlaceholder")}
                    className={inputClass}
                    data-testid="input-name"
                  />
                </Field>
                <Field id="contact-email-input" label={t("contact.email")}>
                  <input
                    id="contact-email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder={t("contact.emailPlaceholder")}
                    className={inputClass}
                    data-testid="input-email"
                  />
                </Field>
              </div>
              <Field id="contact-subject" label={t("contact.subject")}>
                <input
                  id="contact-subject"
                  name="subject"
                  value={form.subject}
                  onChange={update("subject")}
                  placeholder={t("contact.subjectPlaceholder")}
                  className={inputClass}
                  data-testid="input-subject"
                />
              </Field>
              <Field id="contact-message" label={t("contact.message")}>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={update("message")}
                  placeholder={t("contact.messagePlaceholder")}
                  className={`${inputClass} resize-none`}
                  data-testid="input-message"
                />
              </Field>
              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-[14px] font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                data-testid="submit-btn">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                {isLoading ? t("contact.sending") : t("contact.send")}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

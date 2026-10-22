import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useLocale } from "@/hooks/use-locale";
import { ease } from "@/components/reveal";
import { cn } from "@/lib/utils";
import type { Localized } from "@/lib/content";

// Ilustrações feitas em código para os projetos que não têm uma tela pública para mostrar.

const SAMPLES = 48;

function nextReading(previous: number) {
  if (Math.random() < 0.05) return 3.5 + Math.random() * 0.6;
  const drift = (Math.random() - 0.5) * 0.45;
  const pull = (1.2 - previous) * 0.12;
  return Math.min(3.2, Math.max(0.35, previous + drift + pull));
}

export function EnergyVisual() {
  const { intl, lang } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const [readings, setReadings] = useState(() => {
    const values = [1.1];
    for (let i = 1; i < SAMPLES; i++) values.push(nextReading(values[i - 1]));
    return values;
  });
  const [todayKwh, setTodayKwh] = useState(8.62);
  const lastRef = useRef(readings[readings.length - 1]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    // Cada tique vale um minuto de consumo, para o total do dia andar de forma visível.
    const interval = window.setInterval(() => {
      const next = nextReading(lastRef.current);
      lastRef.current = next;
      setReadings((values) => [...values.slice(1), next]);
      setTodayKwh((kwh) => kwh + next / 60);
    }, 900);
    return () => window.clearInterval(interval);
  }, [inView, reduceMotion]);

  const current = readings[readings.length - 1];
  const spike = current >= 3.5;
  const number = (value: number, digits: number) => new Intl.NumberFormat(intl, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

  const { line, area } = useMemo(() => {
    const max = 4.2;
    const points = readings.map((value, i) => [(i / (SAMPLES - 1)) * 300, 96 - (value / max) * 88] as const);
    const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return { line: d, area: `${d} L300 100 L0 100 Z` };
  }, [readings]);

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-between bg-[#14161f] p-5 text-[#e8e9f0] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6fcf97] animate-pulse-dot" aria-hidden />
            ESP32 · {lang === "en" ? "living room" : "sala"}
          </p>
          <p className="mt-3 font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-none tabular-nums">
            {number(current, 2)}
            <span className="ml-1.5 font-sans text-base text-white/50">kW</span>
          </p>
        </div>
        <div className="text-right font-mono text-[11px] leading-5 text-white/55">
          <p>{lang === "en" ? "today" : "hoje"}</p>
          <p className="text-[15px] text-white tabular-nums">{number(todayKwh, 2)} kWh</p>
          <p className="tabular-nums">R$ {number(todayKwh * 0.75, 2)}</p>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {spike && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 -top-8 rounded-full border border-[#f07a4f]/40 bg-[#f07a4f]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f6a183]">
              POWER_SPIKE · {number(current, 1)} kW
            </motion.span>
          )}
        </AnimatePresence>
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-24 w-full md:h-28" aria-hidden>
          <defs>
            <linearGradient id="energy-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8d9cff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8d9cff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" x2="300" y1={96 - (3.5 / 4.2) * 88} y2={96 - (3.5 / 4.2) * 88} stroke="#f07a4f" strokeOpacity="0.35" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          <path d={area} fill="url(#energy-fill)" />
          <path d={line} fill="none" stroke="#8d9cff" strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

const DAYS = 14;
const ROWS = ["101", "102", "201", "202", "301"];
const BOOKINGS = [
  { row: 0, start: 0, length: 4 },
  { row: 0, start: 5, length: 6 },
  { row: 1, start: 2, length: 5 },
  { row: 1, start: 9, length: 4 },
  { row: 2, start: 0, length: 3 },
  { row: 2, start: 6, length: 8 },
  { row: 3, start: 3, length: 6 },
  { row: 4, start: 1, length: 4 },
  { row: 4, start: 8, length: 5 },
];

// A reserva nova tenta entrar por cima de outra, toma 409 da exclusion constraint e então encaixa
// no dia do check-out da anterior, porque o intervalo é [checkIn, checkOut).
type Phase = "idle" | "request" | "conflict" | "moving" | "created";
const ATTEMPT = { row: 3, start: 6, length: 4 };
const FINAL = { row: 3, start: 9, length: 4 };
const TIMELINE: [Phase, number][] = [
  ["request", 900],
  ["conflict", 1700],
  ["moving", 800],
  ["created", 2400],
  ["idle", 900],
];

export function CalendarVisual() {
  const { lang, intl } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!inView || reduceMotion) {
      setPhase(reduceMotion ? "created" : "idle");
      return;
    }
    let step = 0;
    let timer = 0;
    const advance = () => {
      const [next, duration] = TIMELINE[step % TIMELINE.length];
      setPhase(next);
      step += 1;
      timer = window.setTimeout(advance, duration);
    };
    timer = window.setTimeout(advance, 500);
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion]);

  const month = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(new Date(2026, 9, 1));
  const slot = phase === "moving" || phase === "created" ? FINAL : ATTEMPT;
  const status: Record<Phase, string> = {
    idle: lang === "en" ? "waiting" : "aguardando",
    request: "POST /reservations",
    conflict: "409 · occupancy_no_overlap",
    moving: "POST /reservations",
    created: "201 Created",
  };

  const dayLines = `repeating-linear-gradient(90deg, transparent 0, transparent calc(100% / ${DAYS} - 1px), var(--background) calc(100% / ${DAYS} - 1px), var(--background) calc(100% / ${DAYS}))`;
  const band = (start: number, length: number) => ({ left: `${(start / DAYS) * 100}%`, width: `calc(${(length / DAYS) * 100}% - 3px)` });

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col bg-card p-4 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <p className="font-serif text-[22px] leading-none first-letter:uppercase md:text-[26px]">{month}</p>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.04em] transition-colors",
            phase === "conflict" && "border-signal-fail/40 bg-signal-fail/10 text-signal-fail",
            phase === "created" && "border-signal-ok/40 bg-signal-ok/10 text-signal-ok",
            (phase === "request" || phase === "moving") && "border-primary/40 bg-primary/10 text-primary",
            phase === "idle" && "border-border text-muted-foreground",
          )}>
          {status[phase]}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-[3.25rem_1fr] grid-rows-[auto_repeat(5,1fr)] gap-y-1.5 md:grid-cols-[4rem_1fr]">
        <span />
        <div className="grid font-mono text-[9px] text-muted-foreground md:text-[10px]" style={{ gridTemplateColumns: `repeat(${DAYS}, 1fr)` }}>
          {Array.from({ length: DAYS }, (_, i) => (
            <span key={i} className="text-center">
              {12 + i}
            </span>
          ))}
        </div>

        {ROWS.map((label, row) => (
          <div key={label} className="contents">
            <span className="self-center font-mono text-[10px] text-muted-foreground md:text-[11px]">
              {lang === "en" ? "Apt" : "Apto"} {label}
            </span>
            <div className="relative rounded-md bg-muted/50" style={{ backgroundImage: dayLines }}>
              {BOOKINGS.filter((booking) => booking.row === row).map((booking) => (
                <span key={booking.start} className="absolute inset-y-[3px] rounded-[5px] border border-primary/25 bg-primary/15" style={band(booking.start, booking.length)} />
              ))}
              {row === slot.row && phase !== "idle" && (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, x: phase === "conflict" ? [0, -5, 5, -3, 3, 0] : 0 }}
                  transition={{ duration: 0.45, ease, layout: { duration: 0.6, ease } }}
                  className={cn(
                    "absolute inset-y-[3px] z-10 rounded-[5px] border-2",
                    phase === "request" && "border-dashed border-primary bg-primary/15",
                    phase === "conflict" && "border-signal-fail bg-signal-fail/25",
                    phase === "moving" && "border-dashed border-primary bg-primary/15",
                    phase === "created" && "border-signal-ok bg-signal-ok/70",
                  )}
                  style={band(slot.start, slot.length)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Recommendation = { product: Localized; algorithm: keyof typeof ALGORITHMS; score: number };

const ALGORITHMS = {
  cooccurrence: { pt: "co-ocorrência", en: "co-occurrence" },
  restock: { pt: "reposição", en: "restock" },
  favorite: { pt: "categoria favorita", en: "favourite category" },
  list: { pt: "lista atual", en: "current list" },
  trending: { pt: "em alta", en: "trending" },
};

// Quatro carrinhos bem diferentes, para mostrar que o mesmo catálogo gera sugestões diferentes.
const SHOPPERS: { persona: Localized; pair: Localized; together: number; picks: Recommendation[] }[] = [
  {
    persona: { pt: "café da manhã caprichado toda semana", en: "a proper breakfast every week" },
    pair: { pt: "pão + manteiga", en: "bread + butter" },
    together: 14,
    picks: [
      { product: { pt: "Manteiga", en: "Butter" }, algorithm: "cooccurrence", score: 92 },
      { product: { pt: "Café em pó", en: "Ground coffee" }, algorithm: "restock", score: 81 },
      { product: { pt: "Leite", en: "Milk" }, algorithm: "favorite", score: 74 },
      { product: { pt: "Pão de forma", en: "Sliced bread" }, algorithm: "trending", score: 58 },
    ],
  },
  {
    persona: { pt: "churrasco todo sábado", en: "barbecue every Saturday" },
    pair: { pt: "carvão + picanha", en: "charcoal + picanha" },
    together: 12,
    picks: [
      { product: { pt: "Carvão", en: "Charcoal" }, algorithm: "cooccurrence", score: 95 },
      { product: { pt: "Picanha", en: "Picanha" }, algorithm: "favorite", score: 88 },
      { product: { pt: "Farofa", en: "Farofa" }, algorithm: "list", score: 71 },
      { product: { pt: "Gelo", en: "Ice" }, algorithm: "trending", score: 64 },
    ],
  },
  {
    persona: { pt: "acabou de virar vegetariano", en: "just went vegetarian" },
    pair: { pt: "grão-de-bico + tahine", en: "chickpeas + tahini" },
    together: 7,
    picks: [
      { product: { pt: "Grão-de-bico", en: "Chickpeas" }, algorithm: "favorite", score: 86 },
      { product: { pt: "Tofu", en: "Tofu" }, algorithm: "trending", score: 77 },
      { product: { pt: "Espinafre", en: "Spinach" }, algorithm: "list", score: 69 },
      { product: { pt: "Lentilha", en: "Lentils" }, algorithm: "cooccurrence", score: 61 },
    ],
  },
  {
    persona: { pt: "pais de primeira viagem", en: "first-time parents" },
    pair: { pt: "fraldas + lenço umedecido", en: "diapers + baby wipes" },
    together: 18,
    picks: [
      { product: { pt: "Fraldas", en: "Diapers" }, algorithm: "restock", score: 97 },
      { product: { pt: "Lenço umedecido", en: "Baby wipes" }, algorithm: "cooccurrence", score: 90 },
      { product: { pt: "Leite em pó", en: "Baby formula" }, algorithm: "restock", score: 84 },
      { product: { pt: "Café", en: "Coffee" }, algorithm: "trending", score: 79 },
    ],
  },
];

export function RecommendationsVisual() {
  const { lang, pick } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const [shopper, setShopper] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion || paused) return;
    const interval = window.setInterval(() => setShopper((current) => (current + 1) % SHOPPERS.length), 3200);
    return () => window.clearInterval(interval);
  }, [inView, reduceMotion, paused]);

  const current = SHOPPERS[shopper];

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col bg-card p-4 md:p-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-[22px] leading-none md:text-[26px]">{lang === "en" ? "Picked for you" : "Sugestões para você"}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={shopper}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground md:text-[11px]">
              {pick(current.persona)}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 gap-1" role="group" aria-label={lang === "en" ? "Shopper" : "Cliente"}>
          {SHOPPERS.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setShopper(index)}
              aria-pressed={shopper === index}
              className={cn(
                "h-7 w-7 rounded-full border font-mono text-[11px] transition-colors",
                shopper === index ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40",
              )}>
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <ol className="flex flex-1 flex-col justify-evenly py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {current.picks.map((item, index) => (
            <motion.li
              key={`${shopper}-${item.product.en}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease, delay: index * 0.05 }}
              className={cn(index === 3 && "hidden sm:block")}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[14px] font-medium md:text-[15px]">{pick(item.product)}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {pick(ALGORITHMS[item.algorithm])} · <span className="tabular-nums text-foreground">{item.score}</span>
                </span>
              </div>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 0.7, ease, delay: 0.1 + index * 0.05 }} />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <p className="hidden items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground sm:flex md:text-[11px]">
        <span>{lang === "en" ? "bought together most" : "mais comprados juntos"}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={shopper} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="text-foreground">
            {pick(current.pair)} <span className="text-primary">×{current.together}</span>
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
}

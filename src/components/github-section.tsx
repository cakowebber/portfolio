import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Gamepad2, RotateCcw, Square } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import SectionHeading from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { useLocale } from "@/hooks/use-locale";
import { useMediaQuery } from "@/hooks/use-media-query";
import { profile } from "@/lib/content";
import { cn } from "@/lib/utils";
import github from "@/data/github.json";

type Cell = { count: number | null; level: number; date: Date };
type Point = { c: number; r: number };
type Status = "idle" | "playing" | "over" | "cleared";

const ROWS = 7;
const MIN_CELL = 11;
const GAP = 3;
const BEST_KEY = "cm-snake-best";
const DAY = 86_400_000;

const KEY_DIRS: Record<string, Point> = {
  ArrowUp: { c: 0, r: -1 },
  ArrowDown: { c: 0, r: 1 },
  ArrowLeft: { c: -1, r: 0 },
  ArrowRight: { c: 1, r: 0 },
  w: { c: 0, r: -1 },
  s: { c: 0, r: 1 },
  a: { c: -1, r: 0 },
  d: { c: 1, r: 0 },
};

const LEVEL_BG = ["bg-[var(--contrib-0)]", "bg-[var(--contrib-1)]", "bg-[var(--contrib-2)]", "bg-[var(--contrib-3)]", "bg-[var(--contrib-4)]"];

// Calendário em colunas (semanas) de domingo a sábado, com níveis por percentil dos dias ativos.
function buildCalendar(): Cell[][] {
  const from = new Date(`${github.from}T12:00:00`);
  const offset = from.getDay();
  const firstSunday = from.getTime() - offset * DAY;

  const active = github.weeks
    .flat()
    .filter((count) => count > 0)
    .sort((a, b) => a - b);
  const quantile = (q: number) => active[Math.min(active.length - 1, Math.floor(q * active.length))] ?? 1;
  const [q1, q2, q3] = [quantile(0.5), quantile(0.8), quantile(0.95)];
  const level = (count: number) => (count === 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4);

  return github.weeks.map((week, w) =>
    Array.from({ length: ROWS }, (_, r) => {
      const count = week[r - (w === 0 ? offset : 0)];
      const date = new Date(firstSunday + (w * 7 + r) * DAY);
      return count === undefined ? { count: null, level: 0, date } : { count, level: level(count), date };
    }),
  );
}

const keyOf = ({ c, r }: Point) => `${c}:${r}`;

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function GithubSection() {
  const { t } = useTranslation();
  const { intl } = useLocale();
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const calendar = useMemo(buildCalendar, []);

  const boardRef = useRef<HTMLDivElement>(null);
  const [fitColumns, setFitColumns] = useState(calendar.length);
  const [status, setStatus] = useState<Status>("idle");
  const [frozenColumns, setFrozenColumns] = useState(calendar.length);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [, setTick] = useState(0);

  const snakeRef = useRef<Point[]>([]);
  const directionRef = useRef<Point>({ c: 1, r: 0 });
  const queueRef = useRef<Point[]>([]);
  const eatenRef = useRef(new Set<string>());
  const eatenCountRef = useRef(0);
  const scoreRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  // Quantas semanas cabem na largura atual sem os quadrados ficarem minúsculos.
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const fit = Math.floor((entry.contentRect.width + GAP) / (MIN_CELL + GAP));
      setFitColumns(Math.max(12, Math.min(calendar.length, fit)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [calendar.length]);

  const columns = status === "idle" ? fitColumns : frozenColumns;
  const visible = useMemo(() => calendar.slice(calendar.length - columns), [calendar, columns]);
  const foodTotal = useMemo(() => visible.flat().filter((cell) => cell.level > 0).length, [visible]);

  const months = useMemo(() => {
    const labels: { column: number; label: string }[] = [];
    const formatter = new Intl.DateTimeFormat(intl, { month: "short" });
    visible.forEach((week, c) => {
      const month = week[0].date.getMonth();
      const previous = c > 0 ? visible[c - 1][0].date.getMonth() : -1;
      if (month !== previous && c < visible.length - 2) labels.push({ column: c, label: formatter.format(week[0].date).replace(".", "") });
    });
    // Um mês que aparece só nas primeiras semanas não tem espaço para o rótulo.
    return labels.filter((label, i) => !labels[i + 1] || labels[i + 1].column - label.column >= 3);
  }, [visible, intl]);

  const start = useCallback(() => {
    const row = 3;
    snakeRef.current = [2, 1, 0].map((c) => ({ c, r: row }));
    directionRef.current = { c: 1, r: 0 };
    queueRef.current = [];
    eatenRef.current = new Set(snakeRef.current.map(keyOf));
    eatenCountRef.current = snakeRef.current.filter(({ c, r }) => calendar[calendar.length - fitColumns + c][r].level > 0).length;
    setFrozenColumns(fitColumns);
    scoreRef.current = 0;
    setScore(0);
    setStatus("playing");
    boardRef.current?.focus({ preventScroll: true });
  }, [calendar, fitColumns]);

  const stop = useCallback(() => {
    snakeRef.current = [];
    eatenRef.current = new Set();
    setStatus("idle");
  }, []);

  const turn = useCallback((next: Point) => {
    const queue = queueRef.current;
    const last = queue[queue.length - 1] ?? directionRef.current;
    if (queue.length >= 2 || (last.c + next.c === 0 && last.r + next.r === 0) || (last.c === next.c && last.r === next.r)) return;
    queue.push(next);
  }, []);

  // Laço do jogo: anda uma casa por tique e acelera um pouco a cada dia comido.
  useEffect(() => {
    if (status !== "playing") return;
    let timer = 0;

    const step = () => {
      const snake = snakeRef.current;
      if (queueRef.current.length) directionRef.current = queueRef.current.shift()!;
      const { c: dc, r: dr } = directionRef.current;
      const head = { c: (snake[0].c + dc + columns) % columns, r: (snake[0].r + dr + ROWS) % ROWS };
      const cell = visible[head.c][head.r];
      const eats = cell.level > 0 && !eatenRef.current.has(keyOf(head));
      const body = eats ? snake : snake.slice(0, -1);

      if (body.some((part) => part.c === head.c && part.r === head.r)) {
        setStatus("over");
        return;
      }

      snakeRef.current = [head, ...body];
      if (eats) {
        eatenRef.current.add(keyOf(head));
        eatenCountRef.current += 1;
        scoreRef.current += cell.count ?? 0;
        setScore(scoreRef.current);
        if (scoreRef.current > readBest()) {
          try {
            window.localStorage.setItem(BEST_KEY, String(scoreRef.current));
          } catch {
            /* sem storage, o recorde vale só para esta visita */
          }
          setBest((value) => Math.max(value, scoreRef.current));
        }
        if (eatenCountRef.current >= foodTotal) {
          setTick((n) => n + 1);
          setStatus("cleared");
          return;
        }
      }

      setTick((n) => n + 1);
      timer = window.setTimeout(step, Math.max(70, 150 - eatenCountRef.current * 1.5));
    };

    timer = window.setTimeout(step, 160);
    return () => window.clearTimeout(timer);
  }, [status, columns, visible, foodTotal]);

  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      const direction = KEY_DIRS[event.key] ?? KEY_DIRS[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        turn(direction);
      } else if (event.key === "Escape") {
        stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, turn, stop]);

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: TouchEvent) => {
    const from = touchRef.current;
    const touch = event.changedTouches[0];
    touchRef.current = null;
    if (!from || status !== "playing") return;
    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? { c: Math.sign(dx), r: 0 } : { c: 0, r: Math.sign(dy) });
  };

  const snakeKeys = new Map(snakeRef.current.map((part, i) => [keyOf(part), i]));
  const inGame = status !== "idle";
  const dateFormatter = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" });
  const number = new Intl.NumberFormat(intl);

  const stats = [
    [github.total, t("github.contributions")],
    [github.activeDays, t("github.activeDays")],
    [github.longestStreak, t("github.streak")],
    [github.publicRepos, t("github.repos")],
  ] as const;

  return (
    <section id="github" className="py-24 md:py-32">
      <div className="container">
        <SectionHeading eyebrow={t("github.eyebrow")} title={<Trans i18nKey="github.title" components={[<em />]} />} subtitle={t("github.subtitle")} />

        <Reveal className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-8 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label}>
              <p className="font-serif text-[clamp(2.75rem,5vw,4rem)] leading-none tabular-nums">{number.format(value)}</p>
              <p className="eyebrow mt-2">{label}</p>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {status === "idle" ? (
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground"
                  data-testid="snake-play">
                  <Gamepad2 className="h-4 w-4" />
                  {t("github.play")}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={start}
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t("github.restart")}
                  </button>
                  <button type="button" onClick={stop} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-medium hover:bg-accent">
                    <Square className="h-3 w-3" />
                    {t("github.stop")}
                  </button>
                </>
              )}
            </div>
            <p className="font-mono text-[12px] text-muted-foreground tabular-nums">
              {inGame ? (
                <>
                  <span className="text-foreground">{number.format(score)}</span> {t("github.score")} · {t("github.best")} {number.format(best)}
                </>
              ) : (
                t("github.controls")
              )}
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-card/60 p-4 md:p-6">
            <div className="mb-2 grid font-mono text-[10px] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, columnGap: GAP }} aria-hidden>
              {months.map((month) => (
                <span key={`${month.column}-${month.label}`} className="whitespace-nowrap" style={{ gridColumn: `${month.column + 1} / span 3` }}>
                  {month.label}
                </span>
              ))}
            </div>

            <div
              ref={boardRef}
              tabIndex={inGame ? 0 : -1}
              role="img"
              aria-label={t("github.gridLabel", { total: github.total, days: github.activeDays })}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onMouseLeave={() => setHovered(null)}
              className={cn("relative grid grid-flow-col outline-none", inGame && "touch-none")}
              style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: GAP }}
              data-testid="contrib-grid">
              {visible.map((week, c) =>
                week.map((cell, r) => {
                  const key = keyOf({ c, r });
                  const snakeIndex = snakeKeys.get(key);
                  const isSnake = inGame && snakeIndex !== undefined;
                  const isEaten = inGame && !isSnake && eatenRef.current.has(key);
                  return (
                    <span
                      key={key}
                      onMouseEnter={inGame ? undefined : () => setHovered(cell)}
                      className={cn(
                        "aspect-square rounded-[3px] transition-colors duration-150",
                        cell.count === null && !isSnake && "opacity-30",
                        isSnake ? "bg-foreground" : isEaten ? LEVEL_BG[0] : LEVEL_BG[cell.level],
                        isSnake && snakeIndex === 0 && "relative z-10 scale-110 ring-2 ring-primary ring-offset-1 ring-offset-card",
                      )}
                    />
                  );
                }),
              )}

              <AnimatePresence>
                {(status === "over" || status === "cleared") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/75 p-4 text-center backdrop-blur-[2px]">
                    <p className="font-serif text-[clamp(1.25rem,2.6vw,1.9rem)] leading-tight text-balance">
                      {status === "over" ? t("github.gameOver") : t("github.cleared")}
                      <span className="mt-1 block font-mono text-[12px] text-muted-foreground">
                        {number.format(score)} {t("github.score")}
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="min-h-[1rem] tabular-nums">
                {hovered && hovered.count !== null
                  ? `${dateFormatter.format(hovered.date)} · ${hovered.count} ${t("github.contributions")}`
                  : `${dateFormatter.format(visible[0][0].date)} — ${dateFormatter.format(new Date(`${github.to}T12:00:00`))}`}
              </span>
              <span className="flex items-center gap-1.5">
                {t("github.less")}
                {LEVEL_BG.map((bg) => (
                  <span key={bg} className={cn("h-2.5 w-2.5 rounded-[2px]", bg)} />
                ))}
                {t("github.more")}
              </span>
            </div>
          </div>

          {coarsePointer && status === "playing" && (
            <div className="mt-4 flex justify-center gap-2">
              {(
                [
                  [ArrowLeft, { c: -1, r: 0 }],
                  [ArrowUp, { c: 0, r: -1 }],
                  [ArrowDown, { c: 0, r: 1 }],
                  [ArrowRight, { c: 1, r: 0 }],
                ] as const
              ).map(([Icon, direction], i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => turn(direction)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card active:bg-accent"
                  aria-label={Icon.displayName}>
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}

          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="group mt-6 inline-flex items-center gap-1 text-[14px] font-medium hover:text-primary">
            <span className="link-underline">{t("github.profile")}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

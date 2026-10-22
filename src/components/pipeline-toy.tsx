import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RotateCcw, ShoppingBag, Zap } from "lucide-react";
import { useCommandEvent } from "@/hooks/use-command-event";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

// Uma miniatura de um hub de integrações. Pedidos descem dos marketplaces para o SAP; quando o SAP
// aceita, o status de faturamento volta para o marketplace e, depois, o rastreio da entrega.
// Falhou? A mensagem vai para a fila de retry com backoff exponencial. Depois de 3 retries, DLQ.

const MARKETPLACES = ["meli", "dafiti", "netshoes", "privalia"] as const;
type Marketplace = (typeof MARKETPLACES)[number];
type Target = "sap" | Marketplace;
type NodeId = "hub" | "sap" | "tracking" | "retry" | "dlq" | Marketplace;
type EdgeKey = `${Marketplace}-hub` | "hub-sap" | "hub-tracking" | "hub-retry" | "retry-hub" | "retry-dlq";
type Kind = "order" | "status" | "tracking";

type Point = { x: number; y: number };
type Box = Point & { w: number; h: number };
type Curve = [Point, Point, Point, Point];
type Layout = { width: number; height: number; nodes: Record<NodeId, Box>; edges: Record<EdgeKey, Curve> };

const MARKETPLACE_NAMES: Record<Marketplace, { full: string; short: string }> = {
  meli: { full: "Mercado Livre", short: "MeLi" },
  dafiti: { full: "Dafiti", short: "Dafiti" },
  netshoes: { full: "Netshoes", short: "Netshoes" },
  privalia: { full: "Privalia", short: "Privalia" },
};

const MAX_RETRIES = 3;
const BASE_BACKOFF = 300;
const FLAKY_RATE = 0.08;
const MAX_IN_FLIGHT = 40;

const curve = (a: Point, b: Point, axis: "h" | "v"): Curve => {
  if (axis === "h") {
    const dx = (b.x - a.x) * 0.5;
    return [a, { x: a.x + dx, y: a.y }, { x: b.x - dx, y: b.y }, b];
  }
  const dy = (b.y - a.y) * 0.5;
  return [a, { x: a.x, y: a.y + dy }, { x: b.x, y: b.y - dy }, b];
};

const pointAt = ([p0, p1, p2, p3]: Curve, t: number): Point => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
};

const toPath = ([p0, p1, p2, p3]: Curve) => `M${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const marketplaceEdges = (build: (mp: Marketplace) => Curve) => Object.fromEntries(MARKETPLACES.map((mp) => [`${mp}-hub`, build(mp)])) as Record<`${Marketplace}-hub`, Curve>;

function buildLayout(wide: boolean): Layout {
  if (wide) {
    const ys: Record<Marketplace, number> = { meli: 52, dafiti: 118, netshoes: 184, privalia: 250 };
    return {
      width: 1000,
      height: 352,
      nodes: {
        ...(Object.fromEntries(MARKETPLACES.map((mp) => [mp, { x: 140, y: ys[mp], w: 200, h: 46 }])) as Record<Marketplace, Box>),
        hub: { x: 500, y: 150, w: 180, h: 76 },
        sap: { x: 860, y: 100, w: 170, h: 56 },
        tracking: { x: 860, y: 196, w: 170, h: 56 },
        retry: { x: 500, y: 306, w: 180, h: 56 },
        dlq: { x: 860, y: 306, w: 170, h: 56 },
      },
      edges: {
        ...marketplaceEdges((mp) => curve({ x: 240, y: ys[mp] }, { x: 410, y: 150 }, "h")),
        "hub-sap": curve({ x: 590, y: 150 }, { x: 775, y: 100 }, "h"),
        "hub-tracking": curve({ x: 590, y: 150 }, { x: 775, y: 196 }, "h"),
        "hub-retry": curve({ x: 480, y: 188 }, { x: 480, y: 278 }, "v"),
        "retry-hub": curve({ x: 520, y: 278 }, { x: 520, y: 188 }, "v"),
        "retry-dlq": curve({ x: 590, y: 306 }, { x: 775, y: 306 }, "h"),
      },
    };
  }

  const xs: Record<Marketplace, number> = { meli: 45, dafiti: 135, netshoes: 225, privalia: 315 };
  return {
    width: 360,
    height: 324,
    nodes: {
      ...(Object.fromEntries(MARKETPLACES.map((mp) => [mp, { x: xs[mp], y: 30, w: 82, h: 44 }])) as Record<Marketplace, Box>),
      hub: { x: 180, y: 148, w: 116, h: 60 },
      retry: { x: 46, y: 148, w: 76, h: 50 },
      dlq: { x: 46, y: 288, w: 76, h: 46 },
      sap: { x: 190, y: 288, w: 104, h: 46 },
      tracking: { x: 310, y: 288, w: 84, h: 46 },
    },
    edges: {
      ...marketplaceEdges((mp) => curve({ x: xs[mp], y: 52 }, { x: 180, y: 118 }, "v")),
      "hub-sap": curve({ x: 180, y: 178 }, { x: 190, y: 265 }, "v"),
      "hub-tracking": curve({ x: 180, y: 178 }, { x: 310, y: 265 }, "v"),
      "hub-retry": curve({ x: 122, y: 138 }, { x: 84, y: 138 }, "h"),
      "retry-hub": curve({ x: 84, y: 158 }, { x: 122, y: 158 }, "h"),
      "retry-dlq": curve({ x: 46, y: 173 }, { x: 46, y: 265 }, "v"),
    },
  };
}

type Move = { edge: EdgeKey; reverse?: boolean; duration: number };
type Step = Move | { wait: number };
type Message = { label: string; kind: Kind; marketplace: Marketplace; target: Target };
type Packet = Message & { id: number; retries: number; tone: "ok" | "retry" | "dead"; steps: Step[]; t: number; waited: number; pos: Point };

type LogEntry = { key: number; tone: "ok" | "warn" | "fail" | "info"; text: string };
type Stats = { messages: number; delivered: number; retries: number; dlq: number };

// Arestas dos marketplaces apontam para o hub; a do SAP sai do hub. Entregar é percorrer a aresta
// do alvo no sentido "para fora do hub", e voltar após uma falha é o sentido contrário.
const deliver = (target: Target): Move => (target === "sap" ? { edge: "hub-sap", duration: 800 } : { edge: `${target}-hub`, reverse: true, duration: 800 });
const bounce = (target: Target): Move => (target === "sap" ? { edge: "hub-sap", reverse: true, duration: 500 } : { edge: `${target}-hub`, duration: 500 });
const isDelivery = (step: Move, target: Target) => step.edge === deliver(target).edge && !!step.reverse === !!deliver(target).reverse;

export default function PipelineToy() {
  const { t } = useTranslation();
  const wide = useMediaQuery("(min-width: 768px)");
  const layout = useMemo(() => buildLayout(wide), [wide]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();

  const packetsRef = useRef<Packet[]>([]);
  const elementsRef = useRef(new Map<number, SVGGElement>());
  const deadRef = useRef<Message[]>([]);
  const offlineRef = useRef(new Set<Target>());
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const nextIdRef = useRef(1);
  const nextOrderRef = useRef(48_000 + Math.floor(Math.random() * 1_500));
  const logKeyRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [offline, setOffline] = useState<Target[]>([]);
  const [stats, setStats] = useState<Stats>({ messages: 0, delivered: 0, retries: 0, dlq: 0 });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [flashes, setFlashes] = useState<Partial<Record<NodeId, { n: number; tone: "ok" | "fail" }>>>({});

  const later = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const pushLog = useCallback((tone: LogEntry["tone"], text: string) => {
    logKeyRef.current += 1;
    const entry = { key: logKeyRef.current, tone, text };
    setLog((entries) => [entry, ...entries].slice(0, 3));
  }, []);

  const flash = useCallback((node: NodeId, tone: "ok" | "fail") => {
    setFlashes((current) => ({ ...current, [node]: { n: (current[node]?.n ?? 0) + 1, tone } }));
  }, []);

  const name = useCallback((target: Target) => (target === "sap" ? "SAP" : MARKETPLACE_NAMES[target].full), []);

  const ensureLoopRef = useRef(() => {});

  const spawn = useCallback((message: Message, steps: Step[]) => {
    if (packetsRef.current.length >= MAX_IN_FLIGHT) return false;
    const first = steps[0];
    const start = first && "edge" in first ? pointAt(layoutRef.current.edges[first.edge], first.reverse ? 1 : 0) : layoutRef.current.nodes.hub;
    packetsRef.current.push({ ...message, id: nextIdRef.current++, retries: 0, tone: "ok", steps, t: 0, waited: 0, pos: start });
    setStats((s) => ({ ...s, messages: s.messages + 1 }));
    rerender();
    ensureLoopRef.current();
    return true;
  }, []);

  // O ciclo de vida de um pedido: entra no SAP, volta como status e depois como rastreio.
  const sendStatus = useCallback(
    (label: string, marketplace: Marketplace) => spawn({ label, kind: "status", marketplace, target: marketplace }, [{ edge: "hub-sap", reverse: true, duration: 800 }, deliver(marketplace)]),
    [spawn],
  );
  const sendTracking = useCallback(
    (label: string, marketplace: Marketplace) => spawn({ label, kind: "tracking", marketplace, target: marketplace }, [{ edge: "hub-tracking", reverse: true, duration: 800 }, deliver(marketplace)]),
    [spawn],
  );

  // Chamado quando um pacote termina um trecho. Só dois trechos têm consequência: chegar ao
  // destino (entrega ou falha) e chegar à DLQ.
  const arrive = useCallback(
    (packet: Packet, step: Move) => {
      if (isDelivery(step, packet.target)) {
        const failed = offlineRef.current.has(packet.target) || Math.random() < FLAKY_RATE;

        if (!failed) {
          setStats((s) => ({ ...s, delivered: s.delivered + 1 }));
          flash(packet.target, "ok");
          packet.steps = [];
          if (packet.kind === "order") {
            pushLog("ok", t("pipeline.log.order", { id: packet.label, source: name(packet.marketplace) }));
            later(() => sendStatus(packet.label, packet.marketplace), 600 + Math.random() * 900);
          } else if (packet.kind === "status") {
            pushLog("ok", t("pipeline.log.status", { id: packet.label, target: name(packet.target) }));
            later(() => sendTracking(packet.label, packet.marketplace), 800 + Math.random() * 1000);
          } else {
            pushLog("info", t("pipeline.log.tracking", { id: packet.label, target: name(packet.target) }));
          }
          return;
        }

        flash(packet.target, "fail");
        const back: Step[] = [bounce(packet.target), { edge: "hub-retry", duration: 420 }];

        if (packet.retries < MAX_RETRIES) {
          packet.retries += 1;
          const delay = BASE_BACKOFF * 2 ** (packet.retries - 1);
          packet.tone = "retry";
          packet.steps = [...back, { wait: delay }, { edge: "retry-hub", duration: 420 }, deliver(packet.target)];
          setStats((s) => ({ ...s, retries: s.retries + 1 }));
          pushLog("warn", t("pipeline.log.failed", { id: packet.label, target: name(packet.target), attempt: packet.retries, delay }));
        } else {
          packet.tone = "dead";
          packet.steps = [...back, { edge: "retry-dlq", duration: 700 }];
          pushLog("fail", t("pipeline.log.dead", { id: packet.label }));
        }
        rerender();
        return;
      }

      if (step.edge === "retry-dlq" && !step.reverse) {
        const { label, kind, marketplace, target } = packet;
        deadRef.current.push({ label, kind, marketplace, target });
        setStats((s) => ({ ...s, dlq: deadRef.current.length }));
        flash("dlq", "fail");
      }
    },
    [flash, later, name, pushLog, sendStatus, sendTracking, t],
  );
  const arriveRef = useRef(arrive);
  arriveRef.current = arrive;

  const frame = useCallback((now: number) => {
    const dt = Math.min(now - (lastRef.current || now), 50);
    lastRef.current = now;
    const { edges } = layoutRef.current;
    let removed = false;

    for (const packet of packetsRef.current) {
      const step = packet.steps[0];
      if (!step) continue;

      if ("wait" in step) {
        packet.waited += dt;
        if (packet.waited >= step.wait) {
          packet.steps.shift();
          packet.waited = 0;
        }
        continue;
      }

      packet.t += dt / step.duration;
      if (packet.t >= 1) {
        packet.t = 0;
        packet.steps.shift();
        arriveRef.current(packet, step);
        packet.pos = pointAt(edges[step.edge], step.reverse ? 0 : 1);
        if (!packet.steps.length) removed = true;
      } else {
        const progress = easeInOut(packet.t);
        packet.pos = pointAt(edges[step.edge], step.reverse ? 1 - progress : progress);
      }

      elementsRef.current.get(packet.id)?.setAttribute("transform", `translate(${packet.pos.x} ${packet.pos.y})`);
    }

    if (removed) {
      packetsRef.current = packetsRef.current.filter((packet) => packet.steps.length > 0);
      rerender();
    }

    if (packetsRef.current.length > 0) {
      rafRef.current = window.requestAnimationFrame(frame);
    } else {
      rafRef.current = 0;
      lastRef.current = 0;
    }
  }, []);

  ensureLoopRef.current = () => {
    if (!rafRef.current) {
      lastRef.current = 0;
      rafRef.current = window.requestAnimationFrame(frame);
    }
  };

  const newOrder = useCallback(() => {
    const marketplace = MARKETPLACES[Math.floor(Math.random() * MARKETPLACES.length)];
    spawn({ label: `#${nextOrderRef.current++}`, kind: "order", marketplace, target: "sap" }, [{ edge: `${marketplace}-hub`, duration: 750 }, deliver("sap")]);
  }, [spawn]);

  const burst = useCallback(() => {
    for (let i = 0; i < 12; i++) later(newOrder, i * 120);
  }, [later, newOrder]);

  const reprocess = useCallback(() => {
    const dead = deadRef.current.splice(0);
    if (!dead.length) return;
    setStats((s) => ({ ...s, dlq: 0 }));
    pushLog("info", t("pipeline.log.reprocess", { count: dead.length }));
    dead.forEach((message, i) => {
      later(() => {
        if (!spawn(message, [{ edge: "retry-dlq", reverse: true, duration: 700 }, { edge: "retry-hub", duration: 420 }, deliver(message.target)])) {
          deadRef.current.push(message);
          setStats((s) => ({ ...s, dlq: deadRef.current.length }));
        }
      }, i * 140);
    });
  }, [later, pushLog, spawn, t]);

  const toggle = useCallback(
    (target: Target) => {
      const set = offlineRef.current;
      if (set.has(target)) {
        set.delete(target);
        pushLog("ok", t("pipeline.log.up", { target: name(target) }));
      } else {
        set.add(target);
        pushLog("fail", t("pipeline.log.down", { target: name(target) }));
      }
      setOffline(Array.from(set));
    },
    [name, pushLog, t],
  );

  // "rm -rf /" na paleta de comandos: derruba o SAP e manda uma rajada, para o retry e a DLQ trabalharem.
  useCommandEvent("incident", () => {
    containerRef.current?.scrollIntoView({ block: "center" });
    later(() => {
      if (!offlineRef.current.has("sap")) toggle("sap");
      burst();
    }, 700);
  });

  // Tráfego ambiente, só quando o brinquedo está visível e a aba ativa.
  useEffect(() => {
    if (!inView || reduceMotion) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          if (document.visibilityState === "visible") newOrder();
          schedule();
        },
        1900 + Math.random() * 1300,
      );
    };
    newOrder();
    schedule();
    return () => window.clearTimeout(timer);
  }, [inView, reduceMotion, newOrder]);

  useEffect(
    () => () => {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    },
    [],
  );

  const { nodes, edges, width, height } = layout;
  const isDown = (target: Target) => offline.includes(target);

  const targetProps = (target: Target) => ({
    role: "button",
    tabIndex: 0,
    "aria-pressed": isDown(target),
    "aria-label": `${name(target)}: ${isDown(target) ? t("pipeline.offline") : t("pipeline.online")}`,
    onClick: () => toggle(target),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle(target);
      }
    },
    className: "group cursor-pointer outline-none",
  });

  return (
    <div ref={containerRef} className="rounded-[20px] border border-border bg-card/70 p-4 md:p-6 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_48px_-32px_rgba(40,32,16,0.25)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-ok animate-pulse-dot" aria-hidden />
          {t("pipeline.eyebrow")}
        </p>
        <div className="flex flex-wrap gap-2">
          <ToyButton onClick={newOrder} icon={<ShoppingBag className="h-3.5 w-3.5" />} primary data-testid="pipeline-publish">
            {t("pipeline.publish")}
          </ToyButton>
          <ToyButton onClick={burst} icon={<Zap className="h-3.5 w-3.5" />}>
            {t("pipeline.burst")}
          </ToyButton>
          <ToyButton onClick={reprocess} icon={<RotateCcw className="h-3.5 w-3.5" />} disabled={stats.dlq === 0}>
            {t("pipeline.reprocess")}
          </ToyButton>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full select-none" role="group" aria-label={t("pipeline.caption")}>
        <g fill="none" strokeWidth={1.25} strokeLinecap="round">
          {MARKETPLACES.map((mp) => (
            <path key={mp} d={toPath(edges[`${mp}-hub`])} className={cn("transition-colors", isDown(mp) ? "stroke-signal-fail/50" : "stroke-line")} strokeDasharray={isDown(mp) ? "3 5" : undefined} />
          ))}
          <path d={toPath(edges["hub-sap"])} className={cn("transition-colors", isDown("sap") ? "stroke-signal-fail/50" : "stroke-line")} strokeDasharray={isDown("sap") ? "3 5" : undefined} />
          <path d={toPath(edges["hub-tracking"])} className="stroke-line" />
          <path d={toPath(edges["hub-retry"])} className="stroke-signal-warn/60" strokeDasharray="4 5" />
          <path d={toPath(edges["retry-hub"])} className="stroke-signal-warn/60" strokeDasharray="4 5" />
          <path d={toPath(edges["retry-dlq"])} className="stroke-signal-fail/50" strokeDasharray="4 5" />
        </g>

        <PipeNode box={nodes.hub} label="HUB" sub={t("pipeline.exchange")} emphasis />
        <PipeNode box={nodes.tracking} label={t("pipeline.tracking")} sub={wide ? t("pipeline.carriers") : undefined} />
        <PipeNode box={nodes.retry} label="retry" sub={wide ? t("pipeline.retryQueue") : undefined} tone="warn" />
        <PipeNode box={nodes.dlq} label="DLQ" sub={wide ? t("pipeline.deadLetter") : undefined} tone={stats.dlq > 0 ? "fail" : undefined} badge={stats.dlq || undefined} flash={flashes.dlq} />

        <g {...targetProps("sap")}>
          <PipeNode box={nodes.sap} label="SAP" sub={wide ? t("pipeline.erp") : undefined} status={isDown("sap") ? "down" : "up"} interactive flash={flashes.sap} />
        </g>
        {MARKETPLACES.map((mp) => (
          <g key={mp} {...targetProps(mp)}>
            <PipeNode box={nodes[mp]} label={wide ? MARKETPLACE_NAMES[mp].full : MARKETPLACE_NAMES[mp].short} status={isDown(mp) ? "down" : "up"} interactive flash={flashes[mp]} />
          </g>
        ))}

        {packetsRef.current.map((packet) => (
          <g
            key={packet.id}
            ref={(el) => {
              if (el) elementsRef.current.set(packet.id, el);
              else elementsRef.current.delete(packet.id);
            }}
            transform={`translate(${packet.pos.x} ${packet.pos.y})`}
            className={cn(packet.tone === "retry" ? "text-signal-warn" : packet.tone === "dead" ? "text-signal-fail" : packet.kind === "status" ? "text-foreground" : "text-primary")}>
            <PacketDot kind={packet.kind} size={wide ? 1 : 0.9} />
          </g>
        ))}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-muted-foreground" aria-hidden>
        {(["order", "status", "tracking"] as const).map((kind) => (
          <li key={kind} className={cn("flex items-center gap-1.5", kind === "status" ? "text-foreground/80" : "")}>
            <svg width="12" height="12" viewBox="-6 -6 12 12" className={kind === "status" ? "text-foreground" : "text-primary"}>
              <PacketDot kind={kind} size={0.75} halo={false} />
            </svg>
            {t(`pipeline.legend.${kind}`)}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
        <dl className="grid grid-cols-4 gap-4 md:flex md:gap-7">
          {(
            [
              ["messages", stats.messages, "text-foreground"],
              ["delivered", stats.delivered, "text-signal-ok"],
              ["retries", stats.retries, "text-signal-warn"],
              ["dlq", stats.dlq, "text-signal-fail"],
            ] as const
          ).map(([key, value, color]) => (
            <div key={key}>
              <dt className="eyebrow !text-[10px] !tracking-[0.12em]">{t(`pipeline.${key}`)}</dt>
              <dd className={cn("mt-1 font-mono text-xl tabular-nums", color)}>{value}</dd>
            </div>
          ))}
        </dl>
        <ol className="min-h-[3.75rem] space-y-0.5 font-mono text-[11.5px] leading-5 md:text-right" aria-live="off">
          {log.length === 0 && <li className="text-muted-foreground">{t("pipeline.log.idle")}</li>}
          {log.map((entry, index) => (
            <motion.li
              key={entry.key}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: [1, 0.5, 0.3][index], y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "truncate",
                entry.tone === "ok" && "text-signal-ok",
                entry.tone === "warn" && "text-signal-warn",
                entry.tone === "fail" && "text-signal-fail",
                entry.tone === "info" && "text-primary",
              )}>
              {entry.text}
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PacketDot({ kind, size, halo = true }: { kind: Kind; size: number; halo?: boolean }) {
  return (
    <>
      {halo && <circle r={10 * size} fill="currentColor" opacity={0.14} />}
      {kind === "tracking" ? <circle r={4.2 * size} className="fill-card" stroke="currentColor" strokeWidth={2} /> : <circle r={5 * size} fill="currentColor" />}
    </>
  );
}

type PipeNodeProps = {
  box: Box;
  label: string;
  sub?: string;
  emphasis?: boolean;
  tone?: "warn" | "fail";
  status?: "up" | "down";
  badge?: number;
  interactive?: boolean;
  flash?: { n: number; tone: "ok" | "fail" };
};

function PipeNode({ box, label, sub, emphasis, tone, status, badge, interactive, flash }: PipeNodeProps) {
  const isDown = status === "down";
  const labelY = sub ? box.h / 2 - 3 : box.h / 2 + 5;

  return (
    <g transform={`translate(${box.x - box.w / 2} ${box.y - box.h / 2})`}>
      <rect
        width={box.w}
        height={box.h}
        rx={12}
        strokeWidth={emphasis ? 1.5 : 1}
        strokeDasharray={isDown ? "4 4" : undefined}
        className={cn(
          "transition-colors duration-300",
          emphasis ? "fill-background stroke-foreground" : "fill-background stroke-border",
          tone === "warn" && "stroke-signal-warn/60",
          tone === "fail" && "stroke-signal-fail",
          isDown && "stroke-signal-fail",
          interactive && !isDown && "group-hover:stroke-primary group-focus-visible:stroke-primary",
        )}
      />
      {flash && (
        <rect key={flash.n} width={box.w} height={box.h} rx={12} fill="none" strokeWidth={2} className={cn("pipeline-flash", flash.tone === "ok" ? "stroke-signal-ok" : "stroke-signal-fail")} />
      )}
      <text
        x={box.w / 2}
        y={labelY}
        textAnchor="middle"
        className={cn("font-sans", emphasis ? "font-semibold" : "font-medium", isDown ? "fill-muted-foreground" : "fill-foreground")}
        style={{ fontSize: box.w < 100 ? 12 : emphasis ? 16 : 14, textDecoration: isDown ? "line-through" : undefined }}>
        {label}
      </text>
      {sub && (
        <text x={box.w / 2} y={box.h / 2 + 14} textAnchor="middle" className="fill-muted-foreground font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: "0.12em" }}>
          {sub}
        </text>
      )}
      {status && <circle cx={box.w - 11} cy={11} r={3.5} className={isDown ? "fill-signal-fail" : "fill-signal-ok"} />}
      {badge !== undefined && (
        <g transform={`translate(${box.w - 4} 4)`}>
          <circle r={11} className="fill-signal-fail" />
          <text textAnchor="middle" y={4} className="fill-white font-mono" style={{ fontSize: 11 }}>
            {badge > 99 ? "99+" : badge}
          </text>
        </g>
      )}
    </g>
  );
}

type ToyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; primary?: boolean };

function ToyButton({ icon, primary, className, children, ...props }: ToyButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        primary ? "bg-foreground text-background hover:bg-primary hover:text-primary-foreground" : "border border-border hover:border-foreground/40 hover:bg-accent",
        className,
      )}
      {...props}>
      {icon}
      {children}
    </button>
  );
}

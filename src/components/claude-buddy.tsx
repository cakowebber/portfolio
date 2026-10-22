import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";

// Mascote do Claude Code em pixel art. Fica respirando e piscando; ao passar o mouse (ou de tempos
// em tempos, sozinho) dá um pulinho e solta uma das frases.

const BODY = ["..#########..", "..#########..", "..#########..", "#############", "#############", "..#########.."];
const EYES = [
  [4, 1],
  [8, 1],
  [4, 2],
  [8, 2],
];
const LEGS = [3, 5, 7, 9];
const ORANGE = "#d97757";

export default function ClaudeBuddy() {
  const { t } = useTranslation();
  const lines = t("about.buddy", { returnObjects: true }) as string[];
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const hop = useAnimationControls();
  const [line, setLine] = useState<number | null>(null);
  const nextLine = useRef(0);
  const hideTimer = useRef(0);

  const perform = useCallback(() => {
    hop.start({ y: [0, -7, 0], transition: { duration: 0.45, ease: "easeOut" } });
    setLine(nextLine.current % lines.length);
    nextLine.current += 1;
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setLine(null), 2200);
  }, [hop, lines.length]);

  useEffect(() => {
    if (!inView) return;
    const interval = window.setInterval(perform, 7000);
    const first = window.setTimeout(perform, 1200);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(first);
    };
  }, [inView, perform]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  return (
    <button type="button" ref={ref} onMouseEnter={perform} onClick={perform} aria-label="Claude Code" className="relative inline-flex h-10 items-end outline-none" data-testid="claude-buddy">
      <AnimatePresence>
        {line !== null && (
          <motion.span
            key={line}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-10 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-[11px] text-foreground shadow-sm after:absolute after:-bottom-[5px] after:left-4 after:h-2.5 after:w-2.5 after:rotate-45 after:border-b after:border-r after:border-border after:bg-card">
            {lines[line]}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.svg animate={hop} viewBox="0 0 13 8" width={52} height={32} shapeRendering="crispEdges" aria-hidden>
        <motion.g animate={{ y: [0, -0.35, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          {BODY.flatMap((row, y) => row.split("").map((pixel, x) => (pixel === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={ORANGE} /> : null)))}
          <motion.g style={{ transformBox: "fill-box", transformOrigin: "center" }} animate={{ scaleY: [1, 1, 0.15, 1] }} transition={{ duration: 3.6, times: [0, 0.92, 0.96, 1], repeat: Infinity }}>
            {EYES.map(([x, y]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#2b1a12" />
            ))}
          </motion.g>
        </motion.g>
        {LEGS.map((x, i) => (
          <motion.rect
            key={x}
            x={x}
            y={6}
            width={1}
            height={2}
            fill={ORANGE}
            animate={{ height: [2, 1.4, 2] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: (i % 2) * 0.45, ease: "easeInOut" }}
          />
        ))}
      </motion.svg>
    </button>
  );
}

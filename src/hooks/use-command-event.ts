import { useEffect, useRef } from "react";

// Comandos da paleta (⌘K) que mexem em outro componente viram eventos na window: a paleta emite,
// e o componente dono do estado (o pipeline do hero, o snake do GitHub) decide o que fazer.
export type CommandEvent = "incident" | "snake";

const eventName = (name: CommandEvent) => `cm:${name}`;

export function emitCommand(name: CommandEvent) {
  window.dispatchEvent(new Event(eventName(name)));
}

export function useCommandEvent(name: CommandEvent, handler: () => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = () => handlerRef.current();
    window.addEventListener(eventName(name), listener);
    return () => window.removeEventListener(eventName(name), listener);
  }, [name]);
}

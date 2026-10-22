import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

const format = (intl: string) => new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: profile.timeZone }).format(new Date());

// Hora atual em Criciúma, atualizada a cada 15 segundos.
export function useLocalTime(intl: string) {
  const [time, setTime] = useState(() => format(intl));

  useEffect(() => {
    setTime(format(intl));
    const interval = window.setInterval(() => setTime(format(intl)), 15_000);
    return () => window.clearInterval(interval);
  }, [intl]);

  return time;
}

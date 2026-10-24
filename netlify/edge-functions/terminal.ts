// Quem abre o site pelo terminal (curl, wget, HTTPie) recebe um cartão em texto no lugar do HTML.
// Qualquer outro cliente passa direto para o site.

const TERMINAL = /^(curl|wget|httpie|xh)\//i;

const paint = (code: string) => (text: string) => `\x1b[${code}m${text}\x1b[0m`;
const bold = paint("1");
const dim = paint("2");
const accent = paint("38;5;69");

const copy = {
  en: {
    role: "Backend developer · Criciúma, Brazil",
    intro: ["I build what runs behind the screens: APIs, queues and", "integrations between systems that can't stop."],
    now: "Backend at La Moda, SAP ↔ marketplaces",
    projects: ["management game, five eras", "turn-based roguelike snake", "multiplayer FPS in the browser"],
  },
  pt: {
    role: "Desenvolvedor backend · Criciúma, SC",
    intro: ["Construo o que roda por trás das telas: APIs, filas e", "integrações entre sistemas que não podem parar."],
    now: "Backend na La Moda, SAP ↔ marketplaces",
    projects: ["jogo de gerenciamento, cinco eras", "roguelike de snake em turnos", "FPS multiplayer no navegador"],
  },
};

const games = ["engenho.cakowebber.dev", "ouroboros.cakowebber.dev", "cs.cakowebber.dev"];

function card(lang: keyof typeof copy) {
  const c = copy[lang];
  const row = (label: string, value: string) => `  ${dim(label.padEnd(10))}${value}`;

  return [
    "",
    `  ${bold(accent("Carlos Miguel Webber Model"))}`,
    `  ${c.role}`,
    "",
    ...c.intro.map((line) => `  ${line}`),
    "",
    row(lang === "pt" ? "agora" : "now", c.now),
    row("stack", "NestJS · RabbitMQ · PostgreSQL · Redis · Kubernetes"),
    "",
    ...games.map((url, i) => row(i === 0 ? (lang === "pt" ? "jogos" : "games") : "", `${accent(url.padEnd(27))}${dim(c.projects[i])}`)),
    "",
    row("github", accent("github.com/cakowebber")),
    row("linkedin", accent("linkedin.com/in/cakowebber")),
    row("email", accent("contato@cakowebber.dev")),
    row("cv", "curl -LO https://cakowebber.dev/carlos-miguel-webber-cv.pdf"),
    "",
    "",
  ].join("\n");
}

export default (request: Request) => {
  if (!TERMINAL.test(request.headers.get("user-agent") ?? "")) return;

  const lang = /^pt\b/i.test(request.headers.get("accept-language") ?? "") ? "pt" : "en";

  return new Response(card(lang), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      vary: "User-Agent, Accept-Language",
    },
  });
};

export const config = { path: "/" };

import engenhoImg from "@/assets/projects/engenho.jpg";
import engenhoVideo from "@/assets/projects/engenho.mp4";
import ouroborosImg from "@/assets/projects/ouroboros.jpg";
import msappImg from "@/assets/projects/msapp.png";
import centralComprasImg from "@/assets/projects/centralcompras.jpg";

export type Localized = { pt: string; en: string };

export const profile = {
  name: "Carlos Miguel Webber Model",
  shortName: "Carlos Miguel",
  email: "kacowebber12@outlook.com",
  linkedin: "https://www.linkedin.com/in/cmiguelwm/",
  github: "https://github.com/ckzwebber",
  site: "https://cakowebber.dev/",
  cv: "/carlos-miguel-webber-cv.pdf",
  timeZone: "America/Sao_Paulo",
};

export const socials = [
  { label: "GitHub", handle: "ckzwebber", href: profile.github },
  { label: "LinkedIn", handle: "cmiguelwm", href: profile.linkedin },
];

// Métricas com draft: true são números de exemplo: aparecem só em desenvolvimento (com a etiqueta
// "exemplo") e nunca no build de produção. Troque pelo número real e remova o draft.
export type Metric = { value: number; label: Localized; prefix?: string; suffix?: string; compact?: boolean; draft?: boolean };

export type Experience = {
  role: Localized;
  company: string;
  start: string;
  end: string | null;
  mode: Localized;
  summary: Localized;
  highlights: Localized[];
  stack: string[];
  metrics?: Metric[];
};

export const experience: Experience[] = [
  {
    role: { pt: "Desenvolvedor Backend", en: "Backend Developer" },
    company: "La Moda",
    start: "2025-05",
    end: null,
    mode: { pt: "Remoto", en: "Remote" },
    summary: {
      pt: "Faço parte do HUB, a plataforma interna que conecta o ERP SAP a marketplaces como Mercado Livre, Dafiti, Netshoes e Privalia.",
      en: "I work on HUB, the internal platform that connects the SAP ERP to marketplaces like Mercado Livre, Dafiti, Netshoes and Privalia.",
    },
    highlights: [
      {
        pt: "Participo do system design e da arquitetura em AWS/EKS, com RabbitMQ (topic exchange, retry e DLQ) para mensageria e KEDA escalando pela profundidade da fila.",
        en: "Take part in system design and the AWS/EKS architecture, with RabbitMQ (topic exchange, retry and DLQ) for messaging and KEDA scaling on queue depth.",
      },
      {
        pt: "Implemento os módulos de pedido e produto em NestJS, orquestrando fluxos entre SAP e marketplaces, com PostgreSQL e Redis.",
        en: "Build the order and product modules in NestJS, orchestrating flows between SAP and marketplaces, backed by PostgreSQL and Redis.",
      },
      {
        pt: "Desenvolvi o pipeline de integração de imagens de produtos, pensado para alto volume, com processamento em lote e atenção à complexidade.",
        en: "Built the product image integration pipeline for high volume, with batch processing and close attention to complexity.",
      },
      {
        pt: "Depuro fluxos críticos de pedido e resolvo desincronizações entre SAP, bancos e marketplaces.",
        en: "Debug critical order flows and fix desyncs between SAP, databases and marketplaces.",
      },
    ],
    stack: ["NestJS", "TypeScript", "RabbitMQ", "PostgreSQL", "Redis", "Kubernetes", "AWS EKS", "KEDA"],
    metrics: [
      { value: 6, label: { pt: "marketplaces integrados", en: "marketplaces integrated" } },
      { value: 1_000, suffix: "+", compact: true, label: { pt: "pedidos por dia", en: "orders a day" } },
      { value: 50_000, suffix: "+", compact: true, label: { pt: "imagens de produto processadas", en: "product images processed" } },
      { value: 3, suffix: "×", label: { pt: "mais rápido no pipeline de imagens", en: "faster image pipeline" } },
    ],
  },
  {
    role: { pt: "Desenvolvedor Fullstack", en: "Fullstack Developer" },
    company: "La Moda",
    start: "2024-09",
    end: "2025-05",
    mode: { pt: "Híbrido", en: "Hybrid" },
    summary: {
      pt: "Construí sozinho, de ponta a ponta, a plataforma interna de avaliação de peças de roupa.",
      en: "Built, solo and end to end, the internal platform for evaluating clothing pieces.",
    },
    highlights: [
      {
        pt: "Frontend em React, backend em Node.js/Express com autenticação própria, MariaDB e upload de imagens no S3.",
        en: "React frontend, Node.js/Express backend with custom auth, MariaDB and image uploads to S3.",
      },
      {
        pt: "CRUDs, controle de acesso e fluxo completo de autenticação, em sprints quinzenais.",
        en: "CRUD services, access control and the full auth flow, in two-week sprints.",
      },
    ],
    stack: ["React", "Node.js", "Express", "MariaDB", "AWS S3", "Docker"],
    metrics: [
      { value: 1, label: { pt: "dev, do banco ao front", en: "dev, from database to frontend" } },
      { value: 1_000, suffix: "+", compact: true, label: { pt: "peças avaliadas na plataforma", en: "pieces evaluated on the platform" } },
    ],
  },
  {
    role: { pt: "Desenvolvedor de Software", en: "Software Developer" },
    company: "Useall Software",
    start: "2024-08",
    end: "2024-09",
    mode: { pt: "Presencial", en: "On-site" },
    summary: {
      pt: "Scripts em C# e Python automatizando processos administrativos internos.",
      en: "C# and Python scripts automating internal administrative processes.",
    },
    highlights: [],
    stack: ["C#", "Python"],
  },
  {
    role: { pt: "Desenvolvedor Fullstack", en: "Fullstack Developer" },
    company: "Freelancer",
    start: "2024-03",
    end: "2024-08",
    mode: { pt: "Remoto", en: "Remote" },
    summary: {
      pt: "Projetos web completos para clientes, com React, Node.js e APIs REST sobre bancos relacionais.",
      en: "End-to-end web projects for clients, with React, Node.js and REST APIs on relational databases.",
    },
    highlights: [],
    stack: ["React", "Node.js", "PostgreSQL"],
  },
  {
    role: { pt: "Técnico de TI", en: "IT Technician" },
    company: "MDS Informática",
    start: "2023-02",
    end: "2024-02",
    mode: { pt: "Presencial", en: "On-site" },
    summary: {
      pt: "Manutenção e configuração de sistemas e suporte a clientes corporativos. Onde tudo começou.",
      en: "System maintenance, configuration and corporate client support. Where it all started.",
    },
    highlights: [],
    stack: [],
  },
];

export type ProjectVisual =
  | { kind: "image"; src: string; video?: string; fit?: "cover" | "contain"; tone?: "dark" | "light" }
  | { kind: "energy" }
  | { kind: "calendar" }
  | { kind: "recommendations" };

export type Project = {
  slug: string;
  title: string;
  kind: Localized;
  year: string;
  tagline: Localized;
  description: Localized;
  metrics: Localized[];
  // Um parágrafo curto e o trecho de código que sustenta a afirmação principal do card.
  howItWorks?: { text: Localized; code: string };
  stack: string[];
  links: { label: Localized; href: string }[];
  visual: ProjectVisual;
  span: "full" | "half";
};

const play = { pt: "Jogar", en: "Play" };
const live = { pt: "Ver online", en: "Live" };
const code = { pt: "Código", en: "Code" };

export const projects: Project[] = [
  {
    slug: "engenho",
    title: "Engenho",
    kind: { pt: "Jogo de gerenciamento", en: "Management game" },
    year: "2026",
    tagline: { pt: "Do arado ao algoritmo.", en: "From plough to algorithm." },
    description: {
      pt: "Uma aldeia medieval atravessa cinco eras até a automação total, e a ilha inteira se reconstrói a cada salto. Cadeias de produção, logística, energia e poluição, sobre uma simulação determinística que um robô joga do início ao fim nos testes.",
      en: "A medieval village goes through five eras until full automation, and the whole island rebuilds itself at every leap. Production chains, logistics, power and pollution, on top of a deterministic simulation that a bot plays start to finish in the test suite.",
    },
    metrics: [
      { pt: "5 eras", en: "5 eras" },
      { pt: "~14 mil linhas de TS", en: "~14k lines of TS" },
      { pt: "0 arquivos de arte ou som", en: "0 art or sound files" },
    ],
    howItWorks: {
      text: {
        pt: "A simulação não importa nada do Three.js: é estado e regras, e roda sem navegador. Nos testes, um robô joga oito ilhas inteiras, e o CI quebra se ele não vencer em 75 minutos de jogo ou se a mesma semente jogar diferente.",
        en: "The simulation imports nothing from Three.js: it's state and rules, and it runs without a browser. In the test suite a bot plays eight whole islands, and CI fails if it doesn't win within 75 in-game minutes or if the same seed plays out differently.",
      },
      code: `const sim = new Simulation(Simulation.newState(seed));
new AutoPlayer(sim).run(90);
expect(sim.s.won).toBe(true);
expect(sim.s.time / 60).toBeLessThanOrEqual(75);`,
    },
    stack: ["Three.js", "TypeScript", "WebGL 2", "Web Audio"],
    links: [{ label: play, href: "https://engenho.cakowebber.dev" }],
    visual: { kind: "image", src: engenhoImg, video: engenhoVideo },
    span: "full",
  },
  {
    slug: "enertracker",
    title: "EnerTracker",
    kind: { pt: "TCC · IoT", en: "Thesis · IoT" },
    year: "2026",
    tagline: { pt: "Energia em tempo real, do sensor ao gráfico.", en: "Real-time energy, from sensor to chart." },
    description: {
      pt: "Um ESP32 com sensor SCT-013 mede o consumo da casa e envia para uma API NestJS, que agrega o dia e o mês de forma incremental, sem cron, e dispara alertas de pico, excesso e dispositivo offline.",
      en: "An ESP32 with an SCT-013 sensor measures household consumption and sends it to a NestJS API that aggregates days and months incrementally, with no cron, and raises spike, overuse and offline alerts.",
    },
    metrics: [
      { pt: "188 testes", en: "188 tests" },
      { pt: "ESP32 + C++", en: "ESP32 + C++" },
      { pt: "alertas sem cron", en: "cron-free alerts" },
    ],
    howItWorks: {
      text: {
        pt: "Cada leitura do ESP32 já soma no total do dia e do mês com um upsert incremental, então o dashboard nunca varre medições. Offline é o único alerta que nenhuma leitura dispara, por isso ele é checado quando alguém abre os alertas.",
        en: "Every ESP32 reading is added straight into the day and month totals with an incremental upsert, so the dashboard never scans raw measurements. Offline is the one alert no reading can trigger, so it's checked whenever someone opens the alerts.",
      },
      code: `prisma.dailyConsumption.upsert({
  where: { deviceId_date: { deviceId, date } },
  update: { totalKwh: { increment: kwh } },
  create: { deviceId, date, totalKwh: kwh },
});`,
    },
    stack: ["NestJS", "Prisma", "PostgreSQL", "ESP32", "Next.js"],
    links: [],
    visual: { kind: "energy" },
    span: "half",
  },
  {
    slug: "alugueis",
    title: "Controle de Aluguéis",
    kind: { pt: "Produto para cliente", en: "Client product" },
    year: "2026",
    tagline: { pt: "O dia em que a planilha foi pro lixo.", en: "The day the spreadsheet went in the bin." },
    description: {
      pt: "Gestão de aluguel por temporada para um locador com cerca de 20 apartamentos. Quem garante que duas reservas nunca se sobrepõem é uma exclusion constraint no Postgres, não um if na aplicação.",
      en: "Short-term rental management for a landlord with about 20 apartments. What guarantees two bookings never overlap is a Postgres exclusion constraint, not an if in the app.",
    },
    metrics: [
      { pt: "~20 apartamentos", en: "~20 apartments" },
      { pt: "dinheiro em centavos", en: "money in cents" },
      { pt: "monorepo tipado", en: "typed monorepo" },
    ],
    howItWorks: {
      text: {
        pt: "Checar se existe e depois inserir falha quando duas reservas chegam juntas, então a regra mora no banco: o Postgres recusa qualquer período que encoste em outro no mesmo imóvel. O intervalo é semiaberto, e o dia do check-out já fica livre pro próximo hóspede.",
        en: "Check-then-insert breaks when two bookings arrive together, so the rule lives in the database: Postgres rejects any period that touches another on the same property. The range is half-open, so check-out day is already free for the next guest.",
      },
      code: `EXCLUDE USING gist (
  "propertyId" WITH =,
  daterange("checkIn", "checkOut", '[)') WITH &&
) WHERE (status <> 'CANCELADA');`,
    },
    stack: ["NestJS", "Next.js", "Prisma", "PostgreSQL", "Zod"],
    links: [],
    visual: { kind: "calendar" },
    span: "half",
  },
  {
    slug: "ouroboros",
    title: "Ouroboros",
    kind: { pt: "Roguelike", en: "Roguelike" },
    year: "2026",
    tagline: { pt: "Snake em turnos, com placar à prova de trapaça.", en: "Turn-based snake with a cheat-proof leaderboard." },
    description: {
      pt: "Cada run é só semente + teclas. O servidor reexecuta o log com o mesmo motor e publica o placar que ele mesmo calculou, então pontuação inventada no cliente não existe.",
      en: "Every run is just seed + keystrokes. The server replays the log with the same engine and publishes the score it computed itself, so a forged client score simply can't exist.",
    },
    metrics: [
      { pt: "0,1 ms por passo", en: "0.1 ms per step" },
      { pt: "40 bênçãos", en: "40 blessings" },
      { pt: "replay determinístico", en: "deterministic replay" },
    ],
    howItWorks: {
      text: {
        pt: "No replay, o relógio do motor vira um relógio virtual que anda tique a tique, e todo sorteio que importa sai de um RNG semeado. Antes de reexecutar, limites baratos como versão do motor, duração e densidade de teclas já derrubam o que é obviamente falso.",
        en: "On replay, the engine's clock becomes a virtual one that advances tick by tick, and every roll that matters comes from a seeded RNG. Before replaying, cheap limits like engine version, duration and input density already reject anything obviously fake.",
      },
      code: `{ "seed": 2026, "ticks": 568,
  "events": [[3, "d", 0], [11, "d", 1], [42, "c", 2]] }`,
    },
    stack: ["Next.js", "TypeScript", "SQLite", "Turso"],
    links: [{ label: play, href: "https://ouroboros.cakowebber.dev" }],
    visual: { kind: "image", src: ouroborosImg, tone: "dark" },
    span: "half",
  },
  {
    slug: "msapp",
    title: "MSApp",
    kind: { pt: "Plataforma de turismo", en: "Tourism platform" },
    year: "2024",
    tagline: { pt: "Uma cidade inteira num só lugar.", en: "A whole town in one place." },
    description: {
      pt: "Guia digital de Morrinhos do Sul (RS): lugares, mapa, avaliações e painéis para donos de negócio e administração. API NestJS com JWT em cookie HttpOnly, papéis, rate limiting e upload no S3.",
      en: "Digital guide to Morrinhos do Sul (RS): places, map, reviews and dashboards for business owners and admins. NestJS API with HttpOnly cookie JWT, roles, rate limiting and S3 uploads.",
    },
    metrics: [
      { pt: "100+ lugares", en: "100+ places" },
      { pt: "web + API", en: "web + API" },
      { pt: "em produção", en: "in production" },
    ],
    stack: ["NestJS", "Next.js", "Prisma", "PostgreSQL", "AWS S3"],
    links: [{ label: live, href: "https://msapp.cakowebber.dev" }],
    visual: { kind: "image", src: msappImg, fit: "contain", tone: "light" },
    span: "half",
  },
  {
    slug: "central-compras",
    title: "Central de Compras",
    kind: { pt: "Plataforma B2B", en: "B2B platform" },
    year: "2025",
    tagline: { pt: "Lojas, fornecedores e campanhas no mesmo lugar.", en: "Stores, suppliers and campaigns in one place." },
    description: {
      pt: "Três perfis de acesso, catálogo, pedidos e campanhas. JWT em cookie HttpOnly e um proxy no Next.js para resolver cookie cross-site entre Vercel e Koyeb.",
      en: "Three access roles, catalog, orders and campaigns. HttpOnly cookie JWT and a Next.js proxy to solve cross-site cookies between Vercel and Koyeb.",
    },
    metrics: [
      { pt: "3 perfis", en: "3 roles" },
      { pt: "seed idempotente", en: "idempotent seed" },
    ],
    stack: ["Next.js", "Express", "PostgreSQL"],
    links: [
      { label: live, href: "https://central-compras.vercel.app" },
      { label: code, href: "https://github.com/ckzwebber/central-compras-web" },
    ],
    visual: { kind: "image", src: centralComprasImg },
    span: "half",
  },
  {
    slug: "cartwise",
    title: "Cartwise",
    kind: { pt: "Sistema de recomendação", en: "Recommendation system" },
    year: "2026",
    tagline: { pt: "Cada carrinho pede uma sugestão diferente.", en: "Every cart asks for a different suggestion." },
    description: {
      pt: "Backend NestJS de um app de lista de compras com cinco algoritmos de recomendação lado a lado: categoria favorita, co-ocorrência, lista atual, em alta e reposição. Sem banco e sem machine learning, só heurísticas de marketplace e um dashboard ao vivo que mostra tudo acontecendo.",
      en: "NestJS backend for a grocery list app with five recommendation algorithms side by side: favourite category, co-occurrence, current list, trending and restock. No database and no machine learning, just marketplace heuristics and a live dashboard that shows it all happening.",
    },
    metrics: [
      { pt: "5 algoritmos", en: "5 algorithms" },
      { pt: "matriz de co-ocorrência", en: "co-occurrence matrix" },
      { pt: "dashboard ao vivo", en: "live dashboard" },
    ],
    stack: ["NestJS", "TypeScript", "Node.js"],
    links: [{ label: code, href: "https://github.com/ckzwebber/cartwise" }],
    visual: { kind: "recommendations" },
    span: "half",
  },
];

export type ArchiveItem = { title: string; description: Localized; stack: string; year: string; href: string };

export const archive: ArchiveItem[] = [
  {
    title: "Arena",
    description: { pt: "PvP multiplayer em tempo real com game loop de 60 fps no servidor", en: "Real-time multiplayer PvP with a 60 fps server game loop" },
    stack: "NestJS · Socket.IO · Canvas",
    year: "2026",
    href: "https://github.com/ckzwebber/arena-server",
  },
  {
    title: "CS Web",
    description: { pt: "FPS multiplayer no navegador, 1v1 e 5v5 com bomba, sem nenhum asset externo", en: "Multiplayer FPS in the browser, 1v1 and 5v5 with a bomb, zero external assets" },
    stack: "Three.js · Socket.IO",
    year: "2026",
    href: "https://cs.cakowebber.dev",
  },
  {
    title: "Factorio AI Exporter",
    description: { pt: "Mod que exporta a fábrica inteira em JSON para uma IA analisar", en: "Mod that exports the whole factory as JSON for an AI to analyse" },
    stack: "Lua",
    year: "2026",
    href: "https://github.com/ckzwebber/factorio-ai-exporter",
  },
  {
    title: "VTEX Gift Generator",
    description: { pt: "CLI que encontra o cliente e cria e credita o gift card num fluxo só", en: "CLI that finds the customer, then creates and credits the gift card in one flow" },
    stack: "TypeScript · CLI",
    year: "2026",
    href: "https://github.com/ckzwebber/vtex-gift-generator",
  },
  {
    title: "VTEX Environment Migrator",
    description: { pt: "Migra componentes de catálogo entre ambientes VTEX", en: "Migrates catalog components between VTEX environments" },
    stack: "TypeScript · CLI",
    year: "2025",
    href: "https://github.com/ckzwebber/vtex-environment-migrator",
  },
  {
    title: "Day Tasks",
    description: { pt: "Cron que manda o resumo do dia às 05:00, com logs no Loki e Grafana", en: "Cron that emails the daily digest at 05:00, with logs in Loki and Grafana" },
    stack: "Node.js · PostgreSQL · Docker",
    year: "2025",
    href: "https://github.com/ckzwebber/day-tasks",
  },
  {
    title: "PDF Word Counter",
    description: { pt: "Extrai o texto de PDFs e conta as palavras mais frequentes", en: "Extracts text from PDFs and counts the most frequent words" },
    stack: "Rust · CLI",
    year: "2025",
    href: "https://github.com/ckzwebber/cli-word-pdf-counter",
  },
  {
    title: "GameTracker",
    description: { pt: "Meu catálogo de jogos, com capas direto da CDN da Steam", en: "My game catalog, with covers straight from the Steam CDN" },
    stack: "React · TypeScript",
    year: "2024",
    href: "https://webbergametracker.netlify.app/",
  },
];

export const stack: { label: Localized; items: string[] }[] = [
  { label: { pt: "Linguagens", en: "Languages" }, items: ["TypeScript", "JavaScript", "SQL", "Java", "C", "C#"] },
  { label: { pt: "Backend", en: "Backend" }, items: ["Node.js", "NestJS", "Express", "Fastify", "Prisma"] },
  { label: { pt: "Dados", en: "Data" }, items: ["PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis"] },
  { label: { pt: "Infra", en: "Infra" }, items: ["AWS", "Docker", "Kubernetes", "KEDA", "RabbitMQ", "CI/CD"] },
  { label: { pt: "Frontend", en: "Frontend" }, items: ["React", "Next.js", "React Native", "Tailwind", "Three.js"] },
];

export const recognitions: Localized[] = [
  { pt: "3× Menção Honrosa na OBMEP", en: "3× Honourable Mention at OBMEP (Brazilian Math Olympiad)" },
  { pt: "CS50, Harvard", en: "CS50, Harvard" },
  { pt: "curso.dev, Filipe Deschamps", en: "curso.dev, Filipe Deschamps" },
  { pt: ".NET Developer, DIO", en: ".NET Developer, DIO" },
  { pt: "DevTheDevs, PUCRS", en: "DevTheDevs, PUCRS" },
];

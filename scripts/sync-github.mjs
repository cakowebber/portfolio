// Gera src/data/github.json com o calendário de contribuições dos últimos 12 meses.
// Usa o GitHub CLI autenticado (inclui contribuições privadas). Rode com: npm run sync:github
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LOGIN = "ckzwebber";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/github.json");

const query = `query($login: String!) {
  user(login: $login) {
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

const raw = execFileSync("gh", ["api", "graphql", "-f", `query=${query}`, "-f", `login=${LOGIN}`], { encoding: "utf8" });
const user = JSON.parse(raw).data.user;
const calendar = user.contributionsCollection.contributionCalendar;

const days = calendar.weeks.flatMap((week) => week.contributionDays);
const activeDays = days.filter((day) => day.contributionCount > 0).length;

let longestStreak = 0;
let streak = 0;
for (const day of days) {
  streak = day.contributionCount > 0 ? streak + 1 : 0;
  longestStreak = Math.max(longestStreak, streak);
}

const data = {
  login: LOGIN,
  generatedAt: new Date().toISOString().slice(0, 10),
  from: days[0].date,
  to: days[days.length - 1].date,
  total: calendar.totalContributions,
  activeDays,
  longestStreak,
  bestDay: Math.max(...days.map((day) => day.contributionCount)),
  publicRepos: user.repositories.totalCount,
  // Uma semana por linha, de domingo a sábado. A primeira semana pode vir incompleta.
  weeks: calendar.weeks.map((week) => week.contributionDays.map((day) => day.contributionCount)),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data) + "\n");
console.log(`github.json: ${data.total} contribuições em ${data.activeDays} dias (${data.from} → ${data.to})`);

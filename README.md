# cakowebber.dev

[![Netlify Status](https://api.netlify.com/api/v1/badges/e26b54e8-aa4c-4f8d-9817-0c9de91a327d/deploy-status)](https://app.netlify.com/projects/webberportfolio/deploys)

Personal portfolio, live at [cakowebber.dev](https://cakowebber.dev/)

---

## Stack

- React + TypeScript
- Tailwind CSS
- Framer Motion
- i18next (PT-BR / EN)

---

## Content

- A tiny, interactive version of my day job: orders flowing from SAP to marketplaces, with retry and DLQ
- Experience, tools and selected projects
- My GitHub contributions from the last 12 months, which you can also play snake on

All copy lives in `src/locales/*.json` and `src/lib/content.ts`.

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run check        # type check
npm run sync:github  # refresh src/data/github.json (needs an authenticated gh CLI)
```

The contact form uses EmailJS and reads `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_SERVICE_ID` and `VITE_EMAILJS_TEMPLATE_ID`.

---

## Contact

[linkedin.com/in/cmiguelwm](https://www.linkedin.com/in/cmiguelwm/) · [github.com/ckzwebber](https://github.com/ckzwebber)

---

MIT License

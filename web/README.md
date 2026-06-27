# REREVI web app

The Astro front end for REREVI — a GCSE Eduqas Religious Studies revision site.
Talks to the self-hosted Supabase backend.

## Stack
- **Astro 5** (SSR, Node standalone adapter) · **Tailwind 4** · **TypeScript**
- **Supabase** via `@supabase/ssr` (cookie sessions) + `@supabase/supabase-js`

## Local dev
```bash
cp .env.example .env     # fill in the Supabase URL + keys (see infra)
npm install
npm run dev              # http://localhost:4321
```
The app points at the live Supabase (`https://rerevi.zafirshirazi.com`) by default,
so local dev uses real auth/data.

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build (`dist/`, Node server)
- `npm start` — run the built server (`node ./dist/server/entry.mjs`)

## Layout
```
src/
  layouts/Base.astro          shell: head, fonts, theme init, nav, footer
  components/                  TopNav, Footer, ThemeControls, Countdown,
                               PaperView, ComingSoon, AdminNav
  lib/
    spec.ts                    Eduqas structure (components, topics, A/B/C/D)
    nav.ts                     top-bar nav
    qid.ts                     QID parser  (E/T/M . locator . C . T . NNN . type)
    generator.ts               eligibility + Full-Paper/Custom assembly
    aiPrompt.ts                copy-paste AI-marking prompt builder
    supabase.ts                server client (cookies) + admin client (service role)
    types.ts
  middleware.ts                loads session → Astro.locals.{user,profile,isAdmin}
  pages/
    index, how-to-revise, ai-marking, question-lookup, generator,
    topic-summaries, mega-database, privacy, sign-in, register, account
    admin/{index,questions,keywords}
    api/auth/{login,register,logout,google,callback}
    api/account/{export,delete}
    api/attempts
    api/admin/{user-status,site-config,question,question-import,keyword}
```

## Design
Teal-on-neutral palette (deliberately not the reference site's gold/purple).
Display font **Bitcount Single**; readable body **Inter**. Two independent axes:
colour theme (`light`/`dark`/`auto`) and **Bitcount Everything** typography — both
persisted in `localStorage`, applied flash-free before paint.

## Deployment
See [`../infra/DEPLOY.md`](../infra/DEPLOY.md) — Docker build + Caddy origin proxy,
behind the Cloudflare tunnel.

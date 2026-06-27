# AGENTS.md — RE Eduqas Revision Site

> **This is the source of truth for anyone (human or AI) working on this project.**
> `CLAUDE.md` and other agent files defer to this document.

## Status

🟢 **BUILD PHASE — Astro app authorized (owner said "start building", 2026-06-27).**
Infra is **live**: Proxmox VM (Ubuntu 24.04, `192.168.0.127`) running the full
self-hosted Supabase stack behind a Cloudflare Tunnel at
`https://rerevi.zafirshirazi.com`; schema `supabase/migrations/0001_init.sql`
applied; admin account created. See `infra/SETUP-LOG.md`. The Astro app lives in
[`web/`](./web/) and talks to the public Supabase URL. Build is now in scope.

## What this project is

A revision website for **GCSE Religious Studies (Eduqas board)**, made for the
owner's year group. It is inspired by the *aura* (look and feel) of
`re.ibzz.uk` — an elegant dark, editorial-style revision site — but is an
independent project with:

- **A lot more content** than the reference site.
- **A clear in-site guide** on how to use the site to revise effectively.

> ⚠️ **Not a clone.** We deliberately use a different palette, type pairing, and
> structure so this reads as its own site. The reference is inspiration only.
> Do not copy its code, text, or assets.

## Plans

All planning documents live in [`plans/`](./plans/):

- [`plans/requirements.md`](./plans/requirements.md) — decisions & open questions. **Read first.**
- [`plans/features.md`](./plans/features.md) — full feature catalogue + licensing/copyright notes.
- [`plans/content-model.md`](./plans/content-model.md) — data shapes + the quote-reference scheme.
- [`plans/spec-map.md`](./plans/spec-map.md) — the full Eduqas spec broken into spec-point IDs (content backbone).
- [`plans/question-ids.md`](./plans/question-ids.md) — the Question-ID (QID) scheme for the Question Bank / generators.
- [`plans/paper-generator.md`](./plans/paper-generator.md) — how the past-paper / question generator assembles exam-shaped papers.
- [`plans/ai-marking-prompt.md`](./plans/ai-marking-prompt.md) — the copy-paste AI prompt that returns an approximate mark.
- [`plans/hosting.md`](./plans/hosting.md) — self-hosted Proxmox VM spec, Cloudflare Tunnel, Docker runtime layout.
- [`plans/accounts-and-admin.md`](./plans/accounts-and-admin.md) — sign-in, approval, invite, admin dashboard, GDPR, deployment.
- [`plans/design.md`](./plans/design.md) — aura: fonts (Bitcount Single), palette direction, themes, brand.
- [`plans/data-schema.md`](./plans/data-schema.md) — Supabase tables, RLS, import templates, folder layout.
- [`infra/SERVER-SETUP.md`](./infra/SERVER-SETUP.md) — runbook to stand up the Proxmox VM + Supabase + Cloudflare Tunnel.
- [`infra/proxmox-vm-config.md`](./infra/proxmox-vm-config.md) — exact Proxmox Create-VM wizard values.
- [`infra/SETUP-LOG.md`](./infra/SETUP-LOG.md) — chronological log of how the server was actually configured.
- [`infra/DEPLOY.md`](./infra/DEPLOY.md) — deploying the Astro app (Docker + Caddy proxy) behind the tunnel.

## The app (`web/`)

Built and runs. See [`web/README.md`](./web/README.md) for stack, layout and dev.
Astro 5 SSR + Supabase. Schema migration in `supabase/migrations/0001_init.sql`;
example questions in `supabase/seed/example-questions.sql`. Pages cover the full
top-bar nav + auth, account (GDPR export/delete), generator (Full Paper + Custom),
question lookup, AI-marking, and an admin dashboard (accounts approval, questions +
CSV import, keywords, site config). **Content is seeded with example questions** the
owner replaces via the admin dashboard.

Read these before proposing any technical work.

## Working conventions

- **Tech stack:** Astro (SSR/hybrid) front end + **Supabase** (auth + Postgres).
- **Content is DB-backed:** the live source of truth is **Supabase**, edited via
  the **admin dashboard** (must handle *any and all* edits). Markdown/CSV templates
  may seed it. *(Supersedes the old "content collections = sole source of truth".)*
- **Accounts:** email+password & Google, **approval-gated** (admin approves every
  sign-up); scores saved server-side. Top-bar **Invite** = client-side share only.
- **No SMTP / no automated email:** email auto-confirm ON, no magic links;
  password resets are admin-assisted (or use Google); owner sends invites manually.
- **Admin dashboard:** content + accounts + site config (editable contact email,
  exam date) + easy deploy. Owner-only.
- **Scope:** ❌ **no quotes** (ibzz covers them); ✅ keywords, questions+mark schemes,
  generator, AI-marking, exam countdown, PDF export; 🕓 notes/Topic Summaries +
  MEGA RE DATABASE are "Coming Soon".
- **Spec:** Eduqas GCSE RS — Component 1 themes + Christianity + Islam. AOs
  de-emphasised (keep tariffs 2/5/8/15).
- **Question IDs:** every question uses the QID scheme in `question-ids.md`
  (Misc Document IDs = freeform owner-typed slugs).
- **Hosting/domain:** `rerevi.zafirshirazi.com` (+ `rerevi.zsh.name` redirect);
  **Proxmox KVM VM (4/4/240)** behind **Cloudflare Tunnel** (NAT), Supabase + Astro
  via Docker Compose (no LXC). DNS on Cloudflare.
- **Design:** distinct from ibzz (no gold/purple); **Bitcount Single** display font
  + readable body; light/dark/auto; brand **REREVI** (provisional). See `design.md`.
- **Open source:** public GitHub repo from day 1. **MIT + CC-BY**, attribution
  **Zafir Shirazi**.
- ⚠️ **Copyright:** never host Eduqas/WJEC past papers, mark schemes, or the full
  spec — link to official sources. Paraphrase Eduqas-sourced questions.
- ⚠️ **GDPR:** minimise personal data; consent + privacy page + self-serve delete;
  owner flagged data-controller concern (see `accounts-and-admin.md`).

## Reference site design notes (inspiration only — do not copy)

- Dark editorial palette: near-black navy background, soft rounded cards, soft shadows.
- Gold accent + purple secondary.
- Serif display headings (Playfair Display) + clean sans body (DM Sans).
- Pill "eyebrow" labels, fade-up scroll animations, emoji-led cards, generous spacing.

We will pick our **own** palette and fonts that evoke a similar mood without matching.

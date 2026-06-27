# Requirements & Decisions

> Living document. Anything marked **TBD / OPEN** is unresolved. Updated after the
> big requirements round (see "Where we left off").

## 1. Goal

A **comprehensive** GCSE Religious Studies (Eduqas) revision site for the owner's
year group. A built-in guide on how to revise, plus study/exam tools. Similar
*aura* to `re.ibzz.uk` but clearly its own site and independent. Public on GitHub.

## 2. Audience & scope

- Audience: the owner's **year group** (peers revising for GCSE RS).
- Spec: **Eduqas GCSE Religious Studies** — Component 1 (themes) + **Christianity**
  (C2) + **Islam** (C3).
- Exam: **summer 2027**. Owner **~5/8 through the spec** in class — content entry
  starts with covered topics; build whole-spec structure regardless.

## 3. Tech stack & architecture

- **Front end:** **Astro** (SSR/hybrid), reusable layouts/components.
- **Backend:** **Supabase** (Postgres + auth), self-hosted via Docker (see §6).
- **Content lives in the database** (Postgres), edited through the **admin
  dashboard** — because the admin dashboard must support **any and all edits**
  (owner's requirement) and content must be changeable without a code deploy.
  - *(This supersedes the earlier "Astro content collections = sole source of
    truth" idea. Collections/Markdown may still seed the DB via import; the live
    source of truth is Supabase.)*
- **Bulk seed/import:** owner can fill **Markdown/CSV templates** that import into
  the DB (convenience for initial bulk entry); day-to-day edits via the dashboard.
- **Deployment:** updates must be **easy to push to the server** — a simple deploy
  flow (e.g. `git pull` + `docker compose up -d --build`, or a deploy script /
  webhook). Detailed in [`accounts-and-admin.md`](./accounts-and-admin.md).
- Owner's coding comfort: **Some experience** — explain commands/concepts as we go.

## 4. Content types

- **Keywords / definitions** — terminology decks per topic. **In scope.** Count at
  AI's discretion (sensible decks seeded from the spec-map concepts).
- **Question Bank + mark schemes** — our own questions, QID-tagged. **In scope.**
- **Topic notes / Topic Summaries** — **deferred → "Coming Soon"**, surfaced under
  the database. Will be authored in **Markdown**. (Layered-sources idea parked.)
- ❌ **Quotes / quote bank — NOT included.** `re.ibzz.uk` already covers quotes; we
  don't duplicate. The quote-ID scheme + Bible-abbreviation work are **parked**.
- Source of raw content: owner writes notes (Markdown) over the summer; **awaiting**.

## 5. Features (v1 vs later)

### v1 — confirmed
- **Keyword decks** per topic.
- **Question Bank with mark schemes** (band descriptors for all parts A–D).
- **AI-marking prompts** — copy-paste, **provider-agnostic** (no default model
  pushed), approximate mark. See [`ai-marking-prompt.md`](./ai-marking-prompt.md).
- **Past Paper / Question generator** — two sub-tabs (**Full Paper** + **Custom**),
  AI or self-entry scoring → saved Attempt, Show-Mark-Scheme reveal, SPaG modes,
  **PDF/print export with an exam-style title page** (marks + guidance modelled on
  a real paper). See [`paper-generator.md`](./paper-generator.md).
- **Question Lookup** — find a question by its QID.
- **Accounts + saved scores** (approval-gated — see below).
- **Admin dashboard** — content edits + account management + site config + deploy.
- **Exam countdown** — "X days to go" to summer 2027.
- **How-to-revise guide** (dedicated page + inline tips) and **on-site README**.
- **Public GitHub repo** from day 1.

### Coming Soon (stubbed pages in v1)
- **Topic Summaries / per-topic notes** (under the database).
- **MEGA RE DATABASE** — ultimately **all the owner's files**, likely a large
  **downloadable ZIP bundle** when released (plus any browsable views).

### Later (post-v1)
- Spaced repetition · global search · spec-coverage RAG tracker · PWA/offline.

## 5a. Accounts, approval & admin

- **Sign-in:** **email + password** and **Google**.
- **No SMTP / no automated email** (school IT won't provide it): email auto-confirm
  is ON (no verification mail), no magic links; **password resets are
  admin-assisted** or via Google; the **owner sends invites manually**. The admin
  approval gate is the trust step. See [`accounts-and-admin.md`](./accounts-and-admin.md).
- **Approval-gated:** **every sign-up must be approved by the admin (owner)** before
  the account becomes active.
- **Invite button** in the top bar — usable **without an account and with no server
  storage** (client-side share: copy link / share sheet / mailto). Just spreads the
  link; real access still needs admin approval.
- **Admin role (owner):** an **admin dashboard** that must be **sufficient for any
  and all edits**, covering at minimum:
  - **Content:** create/edit/delete keywords, questions + mark schemes, documents
    index, notes (when added).
  - **Accounts:** approve/reject sign-ups, view/manage/delete users.
  - **Site config:** editable settings incl. **contact email** and exam date.
  - **Deploy:** push updates to the server easily.
- ⚠️ **GDPR (owner not comfortable being data controller).** Mitigation plan
  (risk-reduction, **not legal advice**): **data minimisation** (store only login
  email + optional display name/handle + scores; no real names/DOB required),
  explicit **consent + privacy notice** at sign-up, **self-serve data export +
  account deletion** (right to erasure), admin delete, data stays on the owner's
  server. **Owner to confirm** this is acceptable, or we reconsider accounts.

## 6. Hosting & domain

- Domain **`rerevi.zafirshirazi.com`** (+ redirect from **`rerevi.zsh.name`**).
- **DNS on Cloudflare** (owner manages records).
- Box is **behind NAT/CGNAT** → exposed via **Cloudflare Tunnel** (no port-forward,
  no public static IP needed).
- **Self-hosted: one Proxmox KVM VM**, Supabase + Astro via **Docker Compose**.
- **Provisioned VM: 4 vCPU / 8 GB RAM / 240 GB disk** (owner bumped RAM to 8 GB —
  runs the full Supabase stack untouched with headroom for the Astro build).
- TLS via Let's Encrypt, account email **Zafirshirazi@gmail.com**.
- Full spec + runtime layout: [`hosting.md`](./hosting.md).

## 7. Licensing & openness — decided

- **Public GitHub repo from day 1.** **MIT (code) + CC-BY (content).**
- **Attribution name: Zafir Shirazi.**
- **Contact email: Zshirazi163@robertclack.co.uk** — must be **editable later**
  (stored in site config, not hard-coded).
- ⚠️ **Copyright:** official Eduqas/WJEC papers, mark schemes, spec text are
  copyrighted — **link**, don't host; **paraphrase** any Eduqas-sourced question.

## 7a. Top-bar navigation

1. **Home**
2. **Topic Summaries** — *(Coming Soon)*
3. **Past Paper / Question Generators & Mark Schemes**
4. **Question Lookup**
5. **GitHub**
6. **MEGA RE DATABASE** — *(Coming Soon)*
7. **Invite** (client-side share, no account/server)
8. **Sign in / Account** (+ admin entry for the owner)

## 8. Design / aura — see [`design.md`](./design.md)

- **Distinct from `re.ibzz.uk`** — avoid its gold + purple.
- **Display/brand font: Bitcount Single** (decorative pixel font — paired with a
  **readable, swappable body font** for normal reading).
- **"Bitcount Everything" mode** — an opt-in toggle that renders the **entire UI** in
  Bitcount Single (full pixel look), separate from the colour theme. Novelty/fun.
- **Themes: light + dark + auto** (system-following).
- **Brand name: REREVI** (provisional). Logo/wordmark TBD.

## Open questions log
- ~~Domain~~ → `rerevi.zafirshirazi.com` (+ `rerevi.zsh.name` redirect).
- ~~Exam date~~ → summer 2027; owner ~5/8 through the spec.
- ~~Licensing~~ → MIT + CC-BY; attribution **Zafir Shirazi**; contact email config.
- ~~Accounts~~ → yes, **approval-gated**, email+password & Google; admin role.
- ~~Backend~~ → Supabase. ~~Host~~ → Proxmox KVM VM, Cloudflare Tunnel, 4/4/240.
- ~~QID scheme~~ → standardised; **Misc Document IDs = freeform** owner-typed slugs.
- ~~Generator~~ → 2 sub-tabs, AI/self scoring, reveal button, SPaG modes, **PDF v1**.
- ~~Quotes~~ → **dropped** (ibzz covers them). ~~Notes~~ → **Coming Soon**.
- ~~Design inputs~~ → distinct palette, Bitcount Single (+ "Bitcount Everything"
  mode; body font swappable), light/dark/auto, REREVI.
- ~~AOs~~ → keep tariffs (2/5/8/15); **de-emphasise AO labels**.
- ~~GDPR / data-controller comfort~~ → owner **confirmed**: proceed with the
  minimisation plan **and keep server-side scores**.
- ~~VM RAM~~ → owner **bumped to 8 GB** (full stack, no analytics trimming needed).
- Source notes (Markdown) — **awaiting** owner over the summer.
- Confirm **A/B/C/D tariffs** against a real Eduqas paper (working: 2/5/8/15).

## Where we left off (resume here)

**Big requirements round done.** Scope refined: **quotes dropped**, **notes/Topic
Summaries → Coming Soon**, content is now **DB-backed and admin-edited**, **accounts
are approval-gated** with a top-bar **Invite**, a substantial **admin dashboard**
(content + accounts + config + deploy), **PDF export with exam-style title page** in
v1, **exam countdown** in v1, host = **Proxmox VM behind Cloudflare Tunnel**
(4/4/240). New docs: [`accounts-and-admin.md`](./accounts-and-admin.md),
[`design.md`](./design.md).

GDPR minimisation plan **confirmed** (with server-side scores kept). VM RAM bumped
to **8 GB**. **No SMTP** — no automated email; admin approval is the trust step.

**Now in progress:** **data schema** ([`data-schema.md`](./data-schema.md)) and
**server setup** ([`../infra/SERVER-SETUP.md`](../infra/SERVER-SETUP.md)) — owner is
configuring the Proxmox VM + Supabase + Cloudflare Tunnel. The **Astro app
(`web/`)** is still **not** authorized until "start building".

Open: confirm A/B/C/D tariffs vs a real paper; awaited Markdown notes (summer).

**Earlier note — data schema** — Supabase tables (users + approval state, Attempt/scores,
keywords, questions + mark schemes, documents index, site config) + the import
templates. Then IA/sitemap → design build-out → build roadmap. Confirm A/B/C/D
tariffs against an official paper along the way.

Still **no code until "start building".**

# Features Catalogue

Status key: ✅ v1 · 🕓 Coming Soon (stub in v1) · 🔭 later (post-v1) · ❌ out of scope

## A. Content & study

| Feature | Status | Notes |
|---------|--------|-------|
| Quote bank | ❌ | **Dropped** — `re.ibzz.uk` already covers quotes; we don't duplicate. |
| Keyword decks | ✅ | Per topic; term + definition; flashcard + list views. Count at AI's discretion (seeded from spec-map concepts). |
| Per-topic revision notes / Topic Summaries | 🕓 | Authored in Markdown; surfaced under the database. Stubbed "Coming Soon" page in v1. |
| MEGA RE DATABASE | 🕓 | Ultimately **all the owner's files** — likely a large downloadable **ZIP bundle** when released, plus any browsable views. Stub in v1. |
| Spaced repetition | 🔭 | Pairs with saved-progress accounts. |
| Global search | 🔭 | Search keywords, questions, notes in one box. |
| Spec-coverage / RAG tracker | 🔭 | Rate each spec point red/amber/green. Saved to the account. |

## B. Exam practice

| Feature | Status | Notes |
|---------|--------|-------|
| Question Bank + mark schemes | ✅ | Our own questions, each with a **QID** (`question-ids.md`) and tagged by component/topic/type (A/B/C/D = 2/5/8/15-mark). Band descriptors for all parts. |
| AI-marking prompt generator | ✅ | Copy-paste prompt bundling question + mark scheme + spec + student answer for an **approximate** Eduqas-rubric mark. Provider-agnostic. See `ai-marking-prompt.md`. |
| Past Paper / Question generator | ✅ | Two sub-tabs — **Full Paper** (exam-shaped) + **Custom** (free-form drills). Score via AI or self-entry → saved Attempt. Show-Mark-Scheme reveal; SPaG modes. **PDF export with exam-style title page** (v1). See `paper-generator.md`. |
| Past papers (official) | ✅ | **Link** to official Eduqas/WJEC papers — do **not** host (copyright). |
| Question sourcing | ✅ | Owner sources questions from peers and from Eduqas papers, and **tags each question with theme / spec point / tariff** to feed the generator. ⚠️ See copyright note below — questions/mark schemes taken from Eduqas must be **paraphrased into our own wording** before publishing in a public CC-BY repo. |

## C. Guidance & meta

| Feature | Status | Notes |
|---------|--------|-------|
| How-to-revise guide page | ✅ | Dedicated page: the method + how to use each tool. |
| Inline contextual tips | ✅ | Short tips on each feature. |
| README on the website | ✅ | A visible README/about section on the live site, plus repo README. |
| Exam countdown | ✅ | "X days to go" to summer 2027 (exam date editable in admin config). |
| Light/dark/auto + "Bitcount Everything" mode | ✅ | Colour theme (light/dark/auto) plus an opt-in toggle rendering the whole UI in Bitcount Single. See `design.md`. |
| Invite button (top bar) | ✅ | Client-side share (copy link / share sheet / mailto); no account, no server write. See `accounts-and-admin.md`. |

## D. Platform / infra

| Feature | Status | Notes |
|---------|--------|-------|
| Accounts + saved scores | ✅ | **Supabase** auth (email+password / Google) + Postgres. **Approval-gated** (admin approves every sign-up). Scores follow the user across devices. |
| Admin dashboard | ✅ | Owner-only: content CRUD + bulk import, account approval/management, site config (incl. editable contact email), deploy. See `accounts-and-admin.md`. |
| GDPR / privacy | ✅ | Data minimisation + consent + privacy page + self-serve export/delete. **Owner confirmed; server-side scores kept.** (Risk-reduction, not legal advice.) |
| PDF / print export | ✅ | Generated papers export cleanly with a title page (v1). |
| PWA / offline | 🔭 | Install to phone, revise offline. |
| Public GitHub repo | ✅ | Open source from day 1. |

## Licensing — ✅ decided: MIT (code) + CC-BY (content)

Open to all, attribution required. **Attribution name: Zafir Shirazi.** Contact
email (editable in admin config): `Zshirazi163@robertclack.co.uk`. (Considered &
rejected: CC0/public-domain with no attribution; all-rights-reserved.)

⚠️ The licence applies only to **our** content. Eduqas/WJEC exam papers,
mark schemes, and the specification text are **their** copyright — we link, we
don't relicense.

## Copyright guardrails (apply throughout)
- Scripture/teaching quotes: fine to quote with reference.
- Official past papers / mark schemes: **link only**, never host.
- Specification: summarise/reference; don't paste it wholesale and relicense.
- Owner's own notes + AI edits of them: owner's to license.

# RE Eduqas Revision Site

A revision website for **GCSE Religious Studies (Eduqas board)**, built for my
year group. The goal: lots of high-quality revision content plus a clear guide
on how to use the site to actually revise well — wrapped in a polished, calm,
editorial look.

> **Status:** 🟡 Planning. See [`AGENTS.md`](./AGENTS.md) and the
> [`plans/`](./plans/) folder.

## Repository layout

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Source of truth for contributors and AI agents. Read this first. |
| `CLAUDE.md` | Pointer to `AGENTS.md`. |
| `plans/` | Planning docs: requirements, features, content-model, spec-map, question-ids, paper-generator, ai-marking-prompt, accounts-and-admin, hosting, design, data-schema. |
| `infra/` | Server setup runbook + env checklist (Proxmox VM, Supabase, Cloudflare Tunnel). |
| `README.md` | This file. |

> **Site:** `rerevi.zafirshirazi.com` (redirect from `rerevi.zsh.name`). Astro +
> Supabase, self-hosted (Proxmox VM behind Cloudflare Tunnel). Accounts with saved
> scores + admin dashboard. MIT (code) + CC-BY (content) — © Zafir Shirazi.

## Vision

- **A ton of content** — broad and deep coverage of the Eduqas RS spec.
- **A built-in "how to revise" guide** — not just material, but a method.
- **A distinct, polished aura** — calm, premium, easy on the eyes.

_Details are being worked out in [`plans/requirements.md`](./plans/requirements.md)._

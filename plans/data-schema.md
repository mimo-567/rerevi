# Data Schema (draft)

> The **Supabase (Postgres)** schema is the live source of truth, edited via the
> admin dashboard. This is **draft DDL** for planning — it will become the first
> migration when we build. SQL here is schema design, not app code.

## Overview

| Table | Purpose | Who writes |
|-------|---------|-----------|
| `profiles` | App data for each auth user + **approval state** + role | self (limited) / admin |
| `site_config` | Editable settings (contact email, exam date, flags) | admin |
| `spec_points` | The 33 spec-point IDs from `spec-map.md` (reference/FK) | admin/seed |
| `keywords` | Keyword decks | admin |
| `questions` | Question Bank (PK = QID) + mark schemes | admin |
| `documents` | Misc-source index (freeform doc slugs) | admin |
| `notes` | Per-topic notes (🕓 Coming Soon, schema ready) | admin |
| `attempts` | A scored paper/drill attempt | owner |
| `attempt_items` | Per-question marks within an attempt | owner |

Supabase's built-in `auth.users` holds the **email + login**; we never duplicate it.

## Enums / shared types
```sql
create type user_role    as enum ('user','admin');
create type user_status  as enum ('pending','approved','suspended');
create type qid_source   as enum ('E','T','M');           -- exam / textbook / misc
create type question_type as enum ('A','B','C','D');       -- 2/5/8/15 marks
create type attempt_source as enum ('FULL_PAPER','CUSTOM');
create type mark_method   as enum ('AI','SELF');
-- component = smallint 1..3 ; topic = smallint (1..4 C1; 1..2 C2/C3)
```

## Tables (draft DDL)

```sql
-- 1. profiles: extends auth.users with role + approval
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,                       -- optional handle; no real name required
  role         user_role   not null default 'user',
  status       user_status not null default 'pending',
  created_at   timestamptz not null default now()
);
-- trigger: on new auth.users row, insert profiles(status='pending')

-- 2. site_config: single editable settings row
create table site_config (
  id            boolean primary key default true check (id),   -- enforces one row
  contact_email text not null default 'Zshirazi163@robertclack.co.uk',
  exam_date     date not null default '2027-06-01',
  brand_name    text not null default 'REREVI',
  flags         jsonb not null default '{}'::jsonb              -- e.g. coming-soon toggles
);

-- 3. spec_points: reference list (seed from spec-map.md)
create table spec_points (
  id        text primary key,              -- 'RLP-1', 'CB-3', 'IP-1', …
  component smallint not null,
  theme     text not null,                 -- tag: RLP/LD/GE/HR/CB/CP/IB/IP
  title     text not null
);

-- 4. keywords
create table keywords (
  id         bigint generated always as identity primary key,
  term       text not null,
  definition text not null,
  component  smallint not null,
  theme      text not null,
  spec_point text references spec_points(id),
  updated_at timestamptz not null default now()
);

-- 5. questions: PK is the QID string
create table questions (
  qid           text primary key,          -- e.g. 'E.2024.1.2.A'
  source        qid_source not null,
  component     smallint not null,
  topic         smallint not null,
  question_type question_type not null,
  tariff        smallint not null,         -- 2/5/8/15 (mirrors type)
  locator       text,                      -- year (E) / page (T) / doc slug (M)
  seq           smallint,                  -- NNN for T/M
  spec_point    text references spec_points(id),
  question_text text not null,
  mark_scheme   text not null,             -- band descriptors (all parts A–D)
  indicative    text,                      -- indicative content
  spag          boolean not null default false,
  ao            text,                      -- optional, de-emphasised
  doc_id        text references documents(doc_id),  -- when source='M'
  created_at    timestamptz not null default now()
);

-- 6. documents: Misc-source index (freeform slugs)
create table documents (
  doc_id     text primary key,             -- freeform owner-typed slug
  title      text not null,
  source     text,
  components  smallint[] default '{}',
  topics      smallint[] default '{}',
  notes      text
);

-- 7. notes (Coming Soon — schema ready)
create table notes (
  id         bigint generated always as identity primary key,
  spec_point text references spec_points(id),
  component  smallint, theme text, title text,
  body_md    text,                          -- Markdown
  published  boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 8. attempts
create table attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  source     attempt_source not null,
  config     jsonb,                          -- blueprint id / custom request
  method     mark_method not null,
  total      int, max_total int,
  percent    numeric(5,2),
  created_at timestamptz not null default now()
);

-- 9. attempt_items
create table attempt_items (
  id           bigint generated always as identity primary key,
  attempt_id   uuid not null references attempts(id) on delete cascade,
  qid          text references questions(qid),
  mark_awarded int,
  tariff       smallint,
  band         text
);
```

## Row-Level Security (RLS) — policy intent

| Table | Read | Write |
|-------|------|-------|
| `profiles` | own row; admin all | own (limited fields); admin all |
| `site_config` | public (contact email etc.) | admin only |
| `spec_points`, `keywords`, `questions`, `documents`, `notes(published)` | **public read** | **admin only** |
| `attempts`, `attempt_items` | owner; admin | owner; admin |

- **Approval gate:** app queries that save scores require `profiles.status =
  'approved'`; `pending` users are blocked by policy, not just UI.
- **Admin** = `profiles.role = 'admin'` (helper `is_admin()` in policies).
- `notes` public-read only where `published = true`.

## Seed data
- `spec_points` ← the 33 IDs from [`spec-map.md`](./spec-map.md).
- `site_config` ← one row (defaults above; editable in admin).
- First **admin** account: created by hand, then `role='admin'`, `status='approved'`.

## Bulk import templates (CSV → DB)
For initial bulk entry; day-to-day edits via the dashboard.

- `keywords.csv`: `term,definition,component,theme,spec_point`
- `questions.csv`: `qid,question_text,mark_scheme,indicative,spag` — `source`,
  `component`, `topic`, `question_type`, `tariff`, `locator`, `seq` are **parsed
  from the QID** on import (per `question-ids.md`).
- `documents.csv`: `doc_id,title,source,components,topics,notes`

## Repo / folder layout (planned)
```
re-eduqas-revision/
  AGENTS.md  CLAUDE.md  README.md
  plans/                     # these planning docs
  infra/                     # server: compose env, Caddy, cloudflared, runbook
  supabase/
    migrations/              # this schema as SQL migrations
    seed/                    # spec_points, site_config, CSV import templates
  web/                       # the Astro app (added in the build phase)
```

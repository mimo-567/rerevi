-- REREVI — initial schema (migration 0001)
-- Source of truth for design: plans/data-schema.md
-- Applied to the live self-hosted Supabase DB during infra setup.
-- Idempotent-friendly: guards so re-running is safe.

begin;

-- ---------------------------------------------------------------------------
-- Enums / shared types
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role      as enum ('user','admin');                  exception when duplicate_object then null; end $$;
do $$ begin
  create type user_status    as enum ('pending','approved','suspended'); exception when duplicate_object then null; end $$;
do $$ begin
  create type qid_source     as enum ('E','T','M');                     exception when duplicate_object then null; end $$;
do $$ begin
  create type question_type  as enum ('A','B','C','D');                 exception when duplicate_object then null; end $$;
do $$ begin
  create type attempt_source as enum ('FULL_PAPER','CUSTOM');           exception when duplicate_object then null; end $$;
do $$ begin
  create type mark_method    as enum ('AI','SELF');                     exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables (dependency order)
-- ---------------------------------------------------------------------------

-- 1. profiles: extends auth.users with role + approval
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role         user_role   not null default 'user',
  status       user_status not null default 'pending',
  created_at   timestamptz not null default now()
);

-- 2. site_config: single editable settings row
create table if not exists site_config (
  id            boolean primary key default true check (id),
  contact_email text not null default 'Zshirazi163@robertclack.co.uk',
  exam_date     date not null default '2027-06-01',
  brand_name    text not null default 'REREVI',
  flags         jsonb not null default '{}'::jsonb
);

-- 3. spec_points: reference list (seed from spec-map.md)
create table if not exists spec_points (
  id        text primary key,
  component smallint not null,
  theme     text not null,
  title     text not null
);

-- 4. documents: Misc-source index (freeform slugs) — before questions (FK target)
create table if not exists documents (
  doc_id     text primary key,
  title      text not null,
  source     text,
  components smallint[] default '{}',
  topics     smallint[] default '{}',
  notes      text
);

-- 5. keywords
create table if not exists keywords (
  id         bigint generated always as identity primary key,
  term       text not null,
  definition text not null,
  component  smallint not null,
  theme      text not null,
  spec_point text references spec_points(id),
  updated_at timestamptz not null default now()
);

-- 6. questions: PK is the QID string
create table if not exists questions (
  qid           text primary key,
  source        qid_source not null,
  component     smallint not null,
  topic         smallint not null,
  question_type question_type not null,
  tariff        smallint not null,
  locator       text,
  seq           smallint,
  spec_point    text references spec_points(id),
  question_text text not null,
  mark_scheme   text not null,
  indicative    text,
  spag          boolean not null default false,
  ao            text,
  doc_id        text references documents(doc_id),
  created_at    timestamptz not null default now()
);

-- 7. notes (Coming Soon — schema ready)
create table if not exists notes (
  id         bigint generated always as identity primary key,
  spec_point text references spec_points(id),
  component  smallint, theme text, title text,
  body_md    text,
  published  boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 8. attempts
create table if not exists attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  source     attempt_source not null,
  config     jsonb,
  method     mark_method not null,
  total      int, max_total int,
  percent    numeric(5,2),
  created_at timestamptz not null default now()
);

-- 9. attempt_items
create table if not exists attempt_items (
  id           bigint generated always as identity primary key,
  attempt_id   uuid not null references attempts(id) on delete cascade,
  qid          text references questions(qid),
  mark_awarded int,
  tariff       smallint,
  band         text
);

-- ---------------------------------------------------------------------------
-- Helper: is_admin() — SECURITY DEFINER avoids RLS recursion on profiles
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- Trigger: new auth.users -> profiles row (status='pending')
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table profiles      enable row level security;
alter table site_config   enable row level security;
alter table spec_points   enable row level security;
alter table documents     enable row level security;
alter table keywords      enable row level security;
alter table questions     enable row level security;
alter table notes         enable row level security;
alter table attempts      enable row level security;
alter table attempt_items enable row level security;

-- profiles: own row, admin all
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- site_config: public read, admin write
drop policy if exists site_config_read on site_config;
create policy site_config_read on site_config for select using (true);
drop policy if exists site_config_admin on site_config;
create policy site_config_admin on site_config for all
  using (public.is_admin()) with check (public.is_admin());

-- content tables: public read, admin write
do $$
declare t text;
begin
  foreach t in array array['spec_points','documents','keywords','questions'] loop
    execute format('drop policy if exists %1$s_read on %1$s', t);
    execute format('create policy %1$s_read on %1$s for select using (true)', t);
    execute format('drop policy if exists %1$s_admin on %1$s', t);
    execute format('create policy %1$s_admin on %1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- notes: public read only when published; admin full
drop policy if exists notes_read on notes;
create policy notes_read on notes for select using (published or public.is_admin());
drop policy if exists notes_admin on notes;
create policy notes_admin on notes for all
  using (public.is_admin()) with check (public.is_admin());

-- attempts: owner (approved) + admin
drop policy if exists attempts_select on attempts;
create policy attempts_select on attempts for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists attempts_insert on attempts;
create policy attempts_insert on attempts for insert
  with check (user_id = auth.uid() and public.is_approved());
drop policy if exists attempts_modify on attempts;
create policy attempts_modify on attempts for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists attempts_delete on attempts;
create policy attempts_delete on attempts for delete
  using (user_id = auth.uid() or public.is_admin());

-- attempt_items: via parent attempt ownership
drop policy if exists attempt_items_select on attempt_items;
create policy attempt_items_select on attempt_items for select
  using (exists (select 1 from attempts a where a.id = attempt_id
                 and (a.user_id = auth.uid() or public.is_admin())));
drop policy if exists attempt_items_write on attempt_items;
create policy attempt_items_write on attempt_items for all
  using (exists (select 1 from attempts a where a.id = attempt_id
                 and (a.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from attempts a where a.id = attempt_id
                 and (a.user_id = auth.uid() or public.is_admin())));

-- ---------------------------------------------------------------------------
-- Seed: site_config (one row) + spec_points (from spec-map.md)
-- ---------------------------------------------------------------------------
insert into site_config (id) values (true) on conflict (id) do nothing;

insert into spec_points (id, component, theme, title) values
  ('RLP-1', 1, 'RLP', 'Relationships'),
  ('RLP-2', 1, 'RLP', 'Sexual relationships'),
  ('RLP-3', 1, 'RLP', 'Issues of equality: gender prejudice & discrimination'),
  ('LD-1',  1, 'LD',  'Origins & value of the universe / environment'),
  ('LD-2',  1, 'LD',  'The origin and value of human life'),
  ('LD-3',  1, 'LD',  'Beliefs about death and the afterlife'),
  ('GE-1',  1, 'GE',  'Crime and Punishment'),
  ('GE-2',  1, 'GE',  'Forgiveness'),
  ('GE-3',  1, 'GE',  'Good, Evil and Suffering'),
  ('HR-1',  1, 'HR',  'Human Rights and Social Justice'),
  ('HR-2',  1, 'HR',  'Prejudice and discrimination'),
  ('HR-3',  1, 'HR',  'Issues of wealth and poverty'),
  ('CB-1',  2, 'CB',  'The nature of God'),
  ('CB-2',  2, 'CB',  'Creation'),
  ('CB-3',  2, 'CB',  'Jesus Christ'),
  ('CB-4',  2, 'CB',  'Salvation'),
  ('CB-5',  2, 'CB',  'The afterlife'),
  ('CP-1',  2, 'CP',  'Forms of worship'),
  ('CP-2',  2, 'CP',  'Sacraments'),
  ('CP-3',  2, 'CP',  'Pilgrimage and celebrations'),
  ('CP-4',  2, 'CP',  'Christianity in Britain & local community'),
  ('CP-5',  2, 'CP',  'The worldwide Church'),
  ('IB-1',  3, 'IB',  'The Nature of Allah'),
  ('IB-2',  3, 'IB',  'Prophethood (Risalah)'),
  ('IB-3',  3, 'IB',  'Angels (Malaikah)'),
  ('IB-4',  3, 'IB',  'Akhirah (Afterlife)'),
  ('IB-5',  3, 'IB',  'Foundations of faith'),
  ('IP-1',  3, 'IP',  'The Five Pillars (Sunni)'),
  ('IP-2',  3, 'IP',  'The Ten Obligatory Acts (Shi''a)'),
  ('IP-3',  3, 'IP',  'Jihad'),
  ('IP-4',  3, 'IP',  'Festivals & commemorations')
on conflict (id) do nothing;

commit;

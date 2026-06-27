# Server Setup Log

> Chronological record of how the REREVI server was actually configured, written as
> it happened. Companion to [`SERVER-SETUP.md`](./SERVER-SETUP.md) (the plan).
> Passwords/secrets are redacted here.

## Environment as built
- **VM:** Proxmox KVM, hostname `rerevi`.
- **OS:** Ubuntu **24.04.4 LTS** (note: Ubuntu, not Debian — runbook steps still apply).
- **Resources:** 4 vCPU · 7.8 GiB RAM · 240 GB disk.
- **LAN IP:** `192.168.0.127` · **user:** `zafir`.
- Access from the Mac: key-based SSH (`~/.ssh/id_rsa`), pushed via `ssh-copy-id`.

## Step 1 — SSH access (Mac → VM)
- Installed `sshpass` on the Mac (Homebrew tap) to push the key once.
- `ssh-copy-id -i ~/.ssh/id_rsa.pub zafir@192.168.0.127` → key installed.
- Verified passwordless: `ssh zafir@192.168.0.127` works.
- **Owner decision: KEEP password login** (do **not** disable SSH password auth,
  do **not** change the password). Key auth is added for automation convenience;
  password login stays enabled alongside it. (Public exposure is tunnel-only + UFW.)

## Step 2 — Reclaim full disk (LVM was capped at 100 GB)
The Ubuntu installer left 138 GB unallocated in the volume group (root LV = 100 GB).
```bash
sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv
```
Result: root filesystem now **234 GB** (was 98 GB).

## Step 3 — System update + base packages  (in progress)
```bash
DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a \
  apt-get update && apt-get upgrade -y \
  && apt-get install -y qemu-guest-agent curl git ufw ca-certificates \
  && systemctl enable --now qemu-guest-agent
```

Result: base packages installed, `qemu-guest-agent` enabled. (exit 0)

## Step 4 — Docker
```bash
curl -fsSL https://get.docker.com | sh      # via /tmp/get-docker.sh + sudo
sudo usermod -aG docker zafir
sudo systemctl enable --now docker
```
Result: **Docker 29.6.1**, **Compose v5.2.0**; `docker` usable by `zafir` without
sudo in new sessions. (exit 0)

## Step 5 — Supabase self-hosted
```bash
mkdir -p ~/rerevi && cd ~/rerevi
git clone --depth 1 https://github.com/supabase/supabase
cp -r supabase/docker/* .
cp supabase/docker/.env.example .env      # template lives under supabase/docker/, not repo root
```
Result: stack files in `~/rerevi`; env template copied to `~/rerevi/.env`.

## Step 6 — Secrets + signed JWTs (`gen_secrets.py`)
Ran a one-shot Python generator (`/tmp/gen_secrets.py`, since removed) that:
- generated hex `POSTGRES_PASSWORD` (24B), `JWT_SECRET` (32B), `SECRET_KEY_BASE`,
  `VAULT_ENC_KEY` (32 chars), `POOLER_TENANT_ID`, and a `DASHBOARD_PASSWORD`;
- **signed `ANON_KEY` + `SERVICE_ROLE_KEY` as HS256 JWTs from `JWT_SECRET`**
  (iss `supabase`, 10-year exp) — the keys must match the secret or auth fails;
- set `DASHBOARD_USERNAME=zafir`, public URLs → `https://rerevi.zafirshirazi.com`,
  `ADDITIONAL_REDIRECT_URLS` incl. `https://rerevi.zsh.name`,
  `ENABLE_EMAIL_AUTOCONFIRM=true` (no SMTP), `DISABLE_SIGNUP=false`;
- wrote `.env` (chmod 600) and a private `~/rerevi/.secrets-summary.txt` (chmod 600,
  **VM-only, never committed**) holding all secrets + the admin login.

## Step 7 — Bring up the stack
```bash
cd ~/rerevi && docker compose pull && docker compose up -d
```
Result: **all 11 containers healthy** (db, auth, rest, realtime, storage, imgproxy,
kong, meta, studio, pooler, edge-functions). `curl localhost:8000/` → 401 (auth gate,
expected).

## Step 8 — Schema + seed (migration 0001)
Authored [`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql)
from [`../plans/data-schema.md`](../plans/data-schema.md) — fixed the draft's forward
reference (created `documents` before `questions`), added `is_admin()`/`is_approved()`
SECURITY DEFINER helpers, an `auth.users → profiles` trigger, full RLS policies, and
seed. Applied:
```bash
docker compose cp 0001_init.sql db:/tmp/ && \
docker compose exec -T db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/0001_init.sql
```
Result: 9 tables, RLS enabled on all, **31 `spec_points`** seeded (12 C1 + 10 C2 +
9 C3 — the planned "33" was approximate), 1 `site_config` row
(`contact_email=Zshirazi163@robertclack.co.uk`, `exam_date=2027-06-01`).

## Step 9 — First admin user
Created via GoTrue admin API (service_role key) and promoted in SQL:
- email **`Zafirshirazi@gmail.com`**, `email_confirm=true`, `role=admin`,
  `status=approved`. Password stored in `.secrets-summary.txt`.
- Verified end-to-end: `POST /auth/v1/token?grant_type=password` → `bearer` token OK.

## Step 10 — Hardening
- **UFW**: `ufw allow OpenSSH` + `ufw --force enable`. Default deny incoming; only
  22/tcp open. **Password login kept** (owner decision) — UFW is firewall-only.
- **Docker bypasses UFW** for published ports, so additionally rebound Kong
  (8000/8443) and the pooler (5432/6543) to **`127.0.0.1`** in `docker-compose.yml`
  (backup: `docker-compose.yml.bak`). Now LAN-invisible; the tunnel reaches them via
  host-network `localhost`. Honors "never expose 5432/8000 beyond the tunnel".

## Step 11 — Cloudflare Tunnel
Owner created a token-managed tunnel `rerevi` in Zero Trust and supplied the token.
Ran the connector as Docker (host networking to reach `localhost:8000`):
```bash
docker run -d --name cloudflared --restart unless-stopped --network host \
  cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <TOKEN>
```
Result: **tunnel connected** — 4 QUIC connections registered to the London edge
(lhr). ICMP/ping warnings are benign (ping-proxy disabled; unused). Because the
tunnel is **token-managed**, ingress (public hostname → service) is configured in
the Cloudflare dashboard, not in a local config file.

**Dashboard step (owner):** Public Hostname `rerevi.zafirshirazi.com` → `HTTP` →
`localhost:8000` — **added & VERIFIED**. End-to-end checks from off-box:
- `GET /auth/v1/health` (+apikey) → 200; `GET /` → 401 (Kong gate, expected).
- `GET /rest/v1/spec_points` (anon) → returns seeded rows (RLS public-read OK).
- `POST /auth/v1/token?grant_type=password` (admin) → access token issued.
- Headers show `server: cloudflare`, `cf-ray ...-LHR` — routing via the edge.

Still to do: Redirect Rule `rerevi.zsh.name → rerevi.zafirshirazi.com`.

## Step 12 — App deployed (Astro + Caddy)
Owner authorized the build ("start building") and going live. Synced the repo to
`~/rerevi-app` (rsync, no node_modules/.env), created `~/rerevi-app/web/.env` on the
VM from `~/rerevi/.env` (chmod 600), and ran `infra/deploy/deploy.sh`:
- built `rerevi-app:latest` (multi-stage node:22-alpine), running on `127.0.0.1:4321`;
- started `rerevi-caddy` (host network, `:8080`) splitting traffic:
  `/auth /rest /realtime /storage /functions /graphql` → Kong `:8000`, else → app `:4321`.

Verified on the VM: `:8080/` → app (200), `:8080/auth/v1/health` → 200,
`:8080/rest/v1/spec_points` → 200.

**Remaining (owner, dashboard):** repoint the tunnel public hostname
`rerevi.zafirshirazi.com` service from `http://localhost:8000` → `http://localhost:8080`.
After that the public URL serves the app; Supabase stays reachable via the proxied
paths. Rollback = repoint to `:8000`. Update flow: `cd ~/rerevi-app && git pull &&
infra/deploy/deploy.sh`.

## Pending
- Enable **Google** auth provider in Studio (OAuth client id/secret).
- Proxmox: schedule VM backups; cron `pg_dump` off-box.
- Build phase (not yet authorized): the Astro `web/` app.

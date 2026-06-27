# Server Setup Runbook

> Goal for today: a Proxmox VM running **Docker + the self-hosted Supabase stack**,
> reachable at `rerevi.zafirshirazi.com` via a **Cloudflare Tunnel**, with an admin
> login working. The **Astro app** comes later (build phase) — this stands up the
> backend/infra only.
>
> Commands marked `# VM` run inside the VM over SSH. Versions move fast — where this
> differs from the official docs, trust the official docs
> ([Supabase self-hosting](https://supabase.com/docs/guides/self-hosting/docker),
> [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)).

## Prerequisites
- Proxmox host with a **Debian 12** ISO uploaded.
- A **Cloudflare account** with `zafirshirazi.com` (and `zsh.name`) using Cloudflare
  DNS (nameservers pointed at Cloudflare).
- Cloudflare **Zero Trust** enabled (free tier is fine) for Tunnels.

## Phase 1 — Create the VM (Proxmox UI)
Use the exact wizard values in [`proxmox-vm-config.md`](./proxmox-vm-config.md).
Summary: `q35` · **SeaBIOS** · VirtIO SCSI single · QEMU Agent ✔ · **240 GB** SCSI
(Discard + SSD emulation) · **4** cores type `host` · **8192 MiB** (ballooning off)
· VirtIO NIC on `vmbr0`. Install Debian 12 (minimal + **SSH server**), then:
```bash
# VM
sudo apt update && sudo apt -y upgrade
sudo apt -y install qemu-guest-agent curl git ufw
sudo systemctl enable --now qemu-guest-agent
```

## Phase 2 — Docker
```bash
# VM
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER     # log out/in after this
docker --version && docker compose version
```

## Phase 3 — Cloudflare Tunnel (box is behind NAT — no port-forwarding)
1. Cloudflare **Zero Trust → Networks → Tunnels → Create a tunnel** (type
   `cloudflared`). Name it `rerevi`. Copy the **tunnel token** it shows.
2. Run the connector in the VM (host networking so it can reach local ports):
```bash
# VM
docker run -d --name cloudflared --restart unless-stopped --network host \
  cloudflare/cloudflared:latest tunnel --no-autoupdate run --token <TUNNEL_TOKEN>
```
3. Back in the dashboard, add **Public Hostnames** to the tunnel:
   - `rerevi.zafirshirazi.com` → service `http://localhost:8000` *(Supabase Kong /
     Studio for now; repoint to the Astro app once it exists)*.
   - For `rerevi.zsh.name` → use a **Cloudflare Redirect Rule** (or a Bulk Redirect)
     to `https://rerevi.zafirshirazi.com`.
- Cloudflare terminates public TLS; the tunnel is encrypted, so the origin can stay
  plain HTTP. (A Caddy origin proxy is optional and can be added later.)

## Phase 4 — Supabase self-hosted
```bash
# VM
mkdir -p ~/rerevi && cd ~/rerevi
git clone --depth 1 https://github.com/supabase/supabase
cp -r supabase/docker/* .
cp .env.example .env          # this is Supabase's .env
```
Edit `.env` and set strong values (see [`.env.example`](./.env.example) in this repo
for the **checklist of vars that MUST change**). Generate secrets:
```bash
# VM — examples
openssl rand -hex 32          # POSTGRES_PASSWORD, JWT_SECRET (needs 40+ chars)
# ANON_KEY / SERVICE_ROLE_KEY: generate from JWT_SECRET per Supabase docs
```
Bring it up:
```bash
# VM
docker compose pull
docker compose up -d
docker compose ps            # all services healthy?
```
- Studio/API gateway is on **port 8000** (Kong). Through the tunnel you reach it at
  `https://rerevi.zafirshirazi.com`; log in with `DASHBOARD_USERNAME` /
  `DASHBOARD_PASSWORD` from `.env`.

## Phase 5 — First admin user + schema (after Supabase is up)
- In Studio → Authentication, create your account (or sign up via the app later).
- Run the schema from [`../plans/data-schema.md`](../plans/data-schema.md) in the
  Studio SQL editor (it becomes `supabase/migrations/` when we build).
- Set your profile `role='admin'`, `status='approved'`.
- Enable the **Google** auth provider in Studio → Authentication → Providers (add
  OAuth client ID/secret); email+password is on by default.
- **No SMTP:** set `ENABLE_EMAIL_AUTOCONFIRM=true` (no verification email) and leave
  all `SMTP_*` blank. The **admin approval gate** is the trust step; password resets
  are done by the admin in Studio (or users sign in with Google). Invites are sent
  by you manually — the system sends no email.

## Hardening (today or soon)
```bash
# VM — only SSH inbound; everything public goes through the tunnel
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw enable
```
- Do **not** expose Postgres (5432) or Kong (8000) to the LAN/Internet — the tunnel
  is the only public path.
- Optional: put **Cloudflare Access** in front of `rerevi.zafirshirazi.com` while
  it's just Studio, so only you can reach it pre-launch.

## Backups
- Proxmox: schedule VM snapshots/backups.
- DB: `docker compose exec db pg_dump ... > backup.sql` on a cron (store off-box).

## Where this stops today
Backend is live and reachable. **Next (build phase):** the Astro `web/` app, then
repoint the tunnel's public hostname from `:8000` to the app and keep Supabase
behind it.

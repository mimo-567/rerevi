# Hosting & deployment

> Self-hosted on the owner's **Proxmox** server. Planning doc — no code/infra built yet.

## Decision
- **One KVM VM** runs the whole stack. ("No containers" meant **no Proxmox LXC** —
  a full VM is used instead. **Docker containers *inside* the VM are fine.**)
- Inside the VM: **Docker Compose** runs the **Supabase** self-hosted stack
  (Postgres + auth/GoTrue + PostgREST + Realtime + Storage + Kong + Studio +
  analytics) **plus** the **Astro SSR app** container, behind **Caddy** for TLS.
- Backend decision unchanged: **Supabase** (accounts + saved scores).

## VM specification — provisioned

| Resource | Value |
|----------|-------|
| vCPU | **4** (CPU type `host`) |
| RAM | **8 GB** |
| Disk | **240 GB** VirtIO-SCSI, SSD/NVMe, discard on |
| Swap | 2 GB |

**8 GB runs the full Supabase stack untouched** with headroom for the Astro build
(no need to trim the Logflare analytics containers — though disabling them is still
an easy way to free memory if wanted). The generous **240 GB** disk suits the
future **MEGA RE DATABASE** ZIP bundles and backups.

**Scale assumption:** one school year group — tens of concurrent users at exam
crunch, light SSR + a small text database. The Astro build is the heaviest single
moment (can build on the VM or build elsewhere and copy the output).

## Proxmox / VM settings
- **OS:** Debian 12 minimal → Docker Engine + Compose plugin.
- **CPU:** type `host`. No nested virtualization needed (Docker doesn't require it).
- **Disk:** VirtIO-SCSI, SSD emulation + Discard, thin-provisioned. Optionally a
  second virtual disk for the Postgres/Docker volumes (easier snapshot/backup).
- **NIC:** VirtIO, bridged to `vmbr0`. **Ballooning off** (predictable Postgres RAM).
- Enable **`qemu-guest-agent`** and **start-on-boot**.

## Networking — Cloudflare Tunnel (box is behind NAT/CGNAT)
- **DNS on Cloudflare**; owner manages records for `rerevi.zafirshirazi.com` and
  `rerevi.zsh.name`.
- No public static IP / no port-forwarding — a **`cloudflared` Tunnel** (running in
  the VM) exposes the site outbound-only. Cloudflare also handles the redirect from
  `rerevi.zsh.name` → primary (page/redirect rule) and edge TLS.
- Let's Encrypt account email: **Zafirshirazi@gmail.com** (Caddy origin certs;
  Cloudflare provides the public edge cert).

## Runtime layout (inside the VM)
```
Cloudflare edge ──(Tunnel: cloudflared)──► VM
   rerevi.zafirshirazi.com                   │
   rerevi.zsh.name → redirect                ▼
                                    Caddy (container, origin TLS)
                                        ├──► Astro SSR app (container, Node)
                                        └──► Supabase Kong gateway
                                                 ├─ GoTrue / PostgREST / Realtime / Storage
                                                 └─ PostgreSQL (Docker volume)
```

## Backups
- Proxmox VM snapshots, **plus** a periodic `pg_dump` of the Postgres volume.
- Treat the Docker volumes (Postgres data) as the thing that must survive.

## Still to decide later
- Confirm Eduqas part tariffs against an official paper (tracked in `paper-generator.md`).
- Whether to run Cloudflare Access in front of the **admin dashboard** for an extra
  auth layer (optional hardening).

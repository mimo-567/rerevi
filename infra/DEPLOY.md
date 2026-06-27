# Deploying the REREVI app to the VM

The Astro app talks to Supabase over the **same public hostname**
(`rerevi.zafirshirazi.com`). A small **Caddy** origin proxy splits traffic:

```
Cloudflare (TLS) ──tunnel──▶ Caddy :8080
                               ├─ /auth /rest /realtime /storage /functions /graphql ▶ Kong :8000 (Supabase)
                               └─ everything else                                     ▶ Astro app :4321
```

So the only Cloudflare change is repointing the tunnel from `:8000` → `:8080`.

## First-time deploy

1. **Get the code on the VM** (separate dir from `~/rerevi` which holds Supabase):
   ```bash
   # on the VM
   git clone <repo-url> ~/rerevi-app        # or rsync the repo up
   cd ~/rerevi-app
   ```
2. **Create `web/.env`** on the VM with the real keys (same values as local):
   `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `PUBLIC_SITE_URL` — all `https://rerevi.zafirshirazi.com`.
3. **Build & start:**
   ```bash
   cd ~/rerevi-app/infra/deploy
   chmod +x deploy.sh && ./deploy.sh
   ```
   This builds `rerevi-app:latest`, starts the app on `127.0.0.1:4321`, and starts
   Caddy on `:8080`.
4. **Repoint the Cloudflare tunnel:** in Zero Trust → tunnel `rerevi` → Public
   Hostname, change `rerevi.zafirshirazi.com` service from `http://localhost:8000`
   to **`http://localhost:8080`**. (Supabase is now reached *through* Caddy.)
5. Visit `https://rerevi.zafirshirazi.com` — the app loads; sign-in/data still work
   because `/auth` and `/rest` are proxied to Kong.

## Updating after code changes

```bash
cd ~/rerevi-app && git pull
cd infra/deploy && ./deploy.sh        # rebuilds + restarts the app
```

## Notes
- Keep Supabase (`~/rerevi`) and the app (`~/rerevi-app`) as separate compose
  projects; they share nothing but the localhost ports.
- `web/.env` is **gitignored** — create it on the VM by hand (or scp it up) so the
  service-role key never lands in git.
- Rollback: `docker compose -f docker-compose.app.yml down` and repoint the tunnel
  back to `:8000` (raw Supabase Studio).

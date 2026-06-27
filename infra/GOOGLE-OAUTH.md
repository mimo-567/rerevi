# Enabling Google sign-in (self-hosted Supabase)

Email+password works already. Google is optional. The Supabase side is **pre-wired**
— the only thing missing is a Google **Client ID + Secret**.

## How the flow works
```
app /api/auth/google  →  Supabase /auth/v1/authorize?provider=google
   →  Google consent  →  Supabase /auth/v1/callback   (the URI you register in Google)
   →  app /api/auth/callback?code=…  →  session cookie set
```
So in Google you register **Supabase's** callback, not the app's.

## 1. Create the Google credentials (owner, ~5 min)
1. Go to <https://console.cloud.google.com/> → create/select a project.
2. **APIs & Services → OAuth consent screen**:
   - User type **External**; app name e.g. "REREVI"; your support email.
   - Scopes: the defaults (`email`, `profile`, `openid`) are enough.
   - Add yourself under **Test users** (or **Publish** the app to allow anyone).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type **Web application**.
   - **Authorized JavaScript origins:**
     - `https://rerevi.zafirshirazi.com`
   - **Authorized redirect URIs:**
     - `https://rerevi.zafirshirazi.com/auth/v1/callback`
   - Create → copy the **Client ID** and **Client secret**.

## 2. Enable it on the server (already pre-wired)
The compose auth service already references `GOOGLE_ENABLED/_CLIENT_ID/_SECRET`
(uncommented), and `~/rerevi/.env` has placeholders. Fill them in **on the VM** so
the secret never leaves the box:
```bash
# on the VM, edit ~/rerevi/.env
GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=<your client id>
GOOGLE_SECRET=<your client secret>
```
Then restart auth:
```bash
cd ~/rerevi && docker compose up -d auth
```

`ADDITIONAL_REDIRECT_URLS` already allows `rerevi.zafirshirazi.com/**` and
`admin.rerevi.zafirshirazi.com/**`, so the app's `/api/auth/callback` is accepted.

## 3. Test
- Visit `https://rerevi.zafirshirazi.com/sign-in` → **Continue with Google**.
- First Google sign-in creates a `pending` profile (the approval gate still applies
  — approve it in the admin dashboard).

## Notes
- Approval gating is unchanged: Google users are `pending` until you approve them.
- To disable again: set `GOOGLE_ENABLED=false` and `docker compose up -d auth`.

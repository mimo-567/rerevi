# Accounts, Admin & Deployment

> How sign-in, approval, the admin dashboard, GDPR, and pushing updates work.
> Planning doc — no code yet. Backend = Supabase (see [`hosting.md`](./hosting.md)).

## 1. Sign-in
- Methods: **email + password** and **Google** (Supabase auth / GoTrue).
- Account states: `pending` → `approved` → (`suspended`/`deleted`).

### No transactional email (no SMTP available)
School IT won't provide SMTP, so the site sends **no automated email**:
- **Email auto-confirm is ON** — no verification email. Trust comes from the
  **admin approval gate** instead (admin approves every sign-up anyway).
- **No magic links** (they require email).
- **Password reset is admin-assisted:** the admin resets/regenerates a password
  from the dashboard, or the user signs in with **Google** (recommended default —
  no password to lose). A "contact the admin to reset" note replaces self-serve
  reset.
- **Invites are sent manually by the owner** (own email / messaging). The top-bar
  **Invite** button just produces the link/`mailto` client-side (§3) — the system
  never sends mail.
- Account-deletion/export requests (GDPR) are handled in-app + admin, no email.

## 2. Approval-gated registration
- Anyone can **request** an account, but it starts **`pending`**.
- **The admin (owner) must approve** before the account can log in / save scores.
- Pending users see a "waiting for approval" screen; no app access until approved.

## 3. Invite button (top bar)
- A top-bar **Invite** button, usable **without an account** and writing **nothing
  to the server**.
- Pure client-side share: **copy invite link**, native **share sheet**, or
  **mailto** with a pre-filled message + the site URL.
- It only spreads the link; recipients still go through approval (§2).

## 4. Admin dashboard (owner only)
Must be **sufficient for any and all edits** — the owner shouldn't need to touch
code or the DB directly. Sections:

| Area | Capabilities |
|------|--------------|
| **Content** | CRUD for keywords, questions + mark schemes, documents index, and notes (when added). Bulk **import** from Markdown/CSV templates. |
| **Accounts** | List users; **approve/reject** pending sign-ups; suspend/**delete** users; see basic activity (e.g. scores). |
| **Site config** | Editable settings: **contact email** (default `Zshirazi163@robertclack.co.uk`, changeable), **exam date** (for the countdown), brand text, feature toggles ("Coming Soon" flags). |
| **Deploy** | Trigger/guide an update push to the server (§6). |

- Admin is a **role flag** on the owner's account (e.g. `is_admin`), gated by RLS.

## 5. GDPR / data protection
> ⚠️ Risk-reduction guidance, **not legal advice.** Owner flagged discomfort being
> data controller; this design keeps obligations proportionate for a peer-group site.

- **Data minimisation:** store only what's needed — **login email**, an **optional
  display name/handle** (no real name required), and **scores/attempts**. No DOB,
  no addresses, no analytics on individuals.
- **Consent + privacy notice** shown at sign-up; a **Privacy page** explaining what's
  stored, why, and how to delete it.
- **Self-serve rights:** users can **export their data** and **delete their account**
  (right to erasure) from their account page; admin can also delete.
- **Security:** data stays on the owner's server (Cloudflare Tunnel in front);
  Postgres access via RLS; backups secured.
- ✅ **Owner confirmed** this plan is acceptable and **server-side scores are kept**
  (cross-device sync retained). The local-only fallback was considered and rejected.

## 6. Deployment ("easy push to server")
- Source on GitHub (public). Server holds the repo + `docker-compose.yml`.
- Update flow (target): `git pull` → `docker compose up -d --build`, wrapped in a
  one-line **deploy script** (or a webhook the admin dashboard can call).
- Content edits do **not** require a deploy (they live in the DB); only code/site
  changes do.
- Cloudflare Tunnel means no inbound ports; the tunnel daemon runs in the VM.

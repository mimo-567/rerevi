// Server-side Supabase clients for Astro SSR.
//  - `createServerClient({ cookies, headers })` is request-scoped and respects the
//    logged-in user's session via cookies (RLS applies as that user).
//  - `adminClient()` uses the service role key — bypasses RLS. SERVER ONLY.
//    Never import this into anything that ships to the browser.
import { createServerClient as createSSRClient, type CookieMethodsServer } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  return header.split(';').map((pair) => {
    const idx = pair.indexOf('=');
    const name = pair.slice(0, idx).trim();
    const value = decodeURIComponent(pair.slice(idx + 1).trim());
    return { name, value };
  }).filter((c) => c.name);
}

// Apex of the public site — sharing the cookie across this domain lets a single
// sign-in cover both rerevi.* and admin.rerevi.* . Host-only on localhost.
const COOKIE_DOMAIN = '.rerevi.zafirshirazi.com';

function cookieDomainFor(headers: Headers): string | undefined {
  const host = (headers.get('host') || '').split(':')[0];
  return host.endsWith('rerevi.zafirshirazi.com') ? COOKIE_DOMAIN : undefined;
}

export function createServerClient(cookies: AstroCookies, headers: Headers) {
  const domain = cookieDomainFor(headers);
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return parseCookieHeader(headers.get('cookie'));
    },
    setAll(toSet) {
      for (const { name, value, options } of toSet) {
        cookies.set(name, value, { ...options, path: '/', ...(domain ? { domain } : {}) });
      }
    },
  };
  return createSSRClient(URL, ANON, { cookies: cookieMethods });
}

/** Service-role client. Bypasses RLS. SERVER ONLY — used for admin operations. */
export function adminClient() {
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

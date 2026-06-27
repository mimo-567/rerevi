import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

// Initiates Google OAuth. Requires the Google provider to be enabled in Supabase
// (Studio → Authentication → Providers). Until then this returns a clear error.
export const GET: APIRoute = async ({ request, cookies, redirect, url }) => {
  const supabase = createServerClient(cookies, request.headers);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${url.origin}/api/auth/callback` },
  });
  if (error || !data?.url) {
    return redirect('/sign-in?error=' + encodeURIComponent('Google sign-in is not available yet.'));
  }
  return redirect(data.url);
};

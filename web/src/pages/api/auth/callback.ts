import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

// OAuth/PKCE callback — exchanges the `code` for a session (sets cookies).
export const GET: APIRoute = async ({ request, cookies, redirect, url }) => {
  const code = url.searchParams.get('code');
  if (!code) return redirect('/sign-in?error=' + encodeURIComponent('Sign-in was cancelled.'));

  const supabase = createServerClient(cookies, request.headers);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirect('/sign-in?error=' + encodeURIComponent(error.message));
  return redirect('/account');
};

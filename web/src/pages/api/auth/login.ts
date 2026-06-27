import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const returnTo = String(form.get('returnTo') || '/account');

  if (!email || !password) {
    return redirect('/sign-in?error=' + encodeURIComponent('Enter your email and password.'));
  }

  const supabase = createServerClient(cookies, request.headers);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return redirect('/sign-in?error=' + encodeURIComponent(error.message));
  }
  return redirect(returnTo);
};

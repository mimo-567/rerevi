import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const displayName = String(form.get('display_name') || '').trim();
  const consent = form.get('consent');

  if (!email || !password) {
    return redirect('/register?error=' + encodeURIComponent('Email and password are required.'));
  }
  if (password.length < 8) {
    return redirect('/register?error=' + encodeURIComponent('Password must be at least 8 characters.'));
  }
  if (!consent) {
    return redirect('/register?error=' + encodeURIComponent('Please accept the privacy notice to continue.'));
  }

  const supabase = createServerClient(cookies, request.headers);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || null } },
  });
  if (error) {
    return redirect('/register?error=' + encodeURIComponent(error.message));
  }
  // Email auto-confirm is ON, so a session is created — but the profile is
  // `pending` until the admin approves. Land on the account page which shows that.
  return redirect('/account?registered=1');
};

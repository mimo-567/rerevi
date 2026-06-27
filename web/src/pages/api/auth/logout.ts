import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(cookies, request.headers);
  await supabase.auth.signOut();
  return redirect('/');
};

import type { APIRoute } from 'astro';
import { createServerClient, adminClient } from '@/lib/supabase';

// Self-serve account deletion (GDPR right to erasure). Deletes the auth user;
// the `on delete cascade` on profiles/attempts removes all associated data.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/sign-in');

  const admin = adminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return redirect('/account?error=' + encodeURIComponent('Could not delete account: ' + error.message));
  }
  await supabase.auth.signOut();
  return redirect('/?deleted=1');
};

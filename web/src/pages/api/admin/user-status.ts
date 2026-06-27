import type { APIRoute } from 'astro';
import { adminClient } from '@/lib/supabase';

// Approve/suspend/role/delete a user. Admin-only (gated via locals.isAdmin set in
// middleware). Uses the service-role client.
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  if (!locals.isAdmin) return new Response('Forbidden', { status: 403 });

  const form = await request.formData();
  const userId = String(form.get('user_id') || '');
  const action = String(form.get('action') || '');
  if (!userId) return redirect('/admin?error=' + encodeURIComponent('Missing user id'));

  // never let an admin delete/suspend themselves by accident
  if (userId === locals.user?.id && (action === 'delete' || action === 'suspend')) {
    return redirect('/admin?error=' + encodeURIComponent("You can't suspend or delete your own account here."));
  }

  const admin = adminClient();

  if (action === 'delete') {
    const { error } = await admin.auth.admin.deleteUser(userId);
    return redirect('/admin?msg=' + encodeURIComponent(error ? 'Delete failed: ' + error.message : 'User deleted'));
  }

  const patch: Record<string, string> = {};
  if (action === 'approve') patch.status = 'approved';
  else if (action === 'suspend') patch.status = 'suspended';
  else if (action === 'pending') patch.status = 'pending';
  else if (action === 'make-admin') patch.role = 'admin';
  else if (action === 'make-user') patch.role = 'user';
  else return redirect('/admin?error=' + encodeURIComponent('Unknown action'));

  const { error } = await admin.from('profiles').update(patch).eq('id', userId);
  return redirect('/admin?msg=' + encodeURIComponent(error ? 'Update failed: ' + error.message : 'User updated'));
};

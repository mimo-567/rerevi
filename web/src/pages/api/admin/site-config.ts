import type { APIRoute } from 'astro';
import { adminClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  if (!locals.isAdmin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const patch = {
    contact_email: String(form.get('contact_email') || '').trim(),
    exam_date: String(form.get('exam_date') || '').trim(),
    brand_name: String(form.get('brand_name') || '').trim(),
  };
  if (!patch.contact_email || !patch.exam_date || !patch.brand_name) {
    return redirect('/admin?error=' + encodeURIComponent('All site config fields are required.'));
  }
  const admin = adminClient();
  const { error } = await admin.from('site_config').update(patch).eq('id', true);
  return redirect('/admin?msg=' + encodeURIComponent(error ? 'Save failed: ' + error.message : 'Site config saved'));
};

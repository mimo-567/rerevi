import type { APIRoute } from 'astro';
import { adminClient } from '@/lib/supabase';
import { topicOf } from '@/lib/spec';

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  if (!locals.isAdmin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const action = String(form.get('action') || 'create');
  const admin = adminClient();

  if (action === 'delete') {
    const id = String(form.get('id') || '');
    const { error } = await admin.from('keywords').delete().eq('id', id);
    return redirect('/admin/keywords?msg=' + encodeURIComponent(error ? 'Delete failed' : 'Keyword deleted'));
  }

  const term = String(form.get('term') || '').trim();
  const definition = String(form.get('definition') || '').trim();
  const tt = String(form.get('topic') || ''); // "component-topic"
  const [c, t] = tt.split('-').map(Number);
  const topic = topicOf(c, t);
  if (!term || !definition || !topic) {
    return redirect('/admin/keywords?error=' + encodeURIComponent('Term, definition and topic are required.'));
  }
  const { error } = await admin.from('keywords').insert({
    term, definition, component: topic.component, theme: topic.tag,
    spec_point: String(form.get('spec_point') || '').trim() || null,
  });
  return redirect('/admin/keywords?msg=' + encodeURIComponent(error ? 'Save failed: ' + error.message : `Added "${term}"`));
};

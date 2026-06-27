import type { APIRoute } from 'astro';
import { adminClient } from '@/lib/supabase';
import { parseQid } from '@/lib/qid';

// Create/update (upsert) or delete a question. Fields not in the QID
// (text, mark scheme, etc.) come from the form. Admin-only.
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  if (!locals.isAdmin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const action = String(form.get('action') || 'upsert');
  const admin = adminClient();

  if (action === 'delete') {
    const qid = String(form.get('qid') || '');
    const { error } = await admin.from('questions').delete().eq('qid', qid);
    return redirect('/admin/questions?msg=' + encodeURIComponent(error ? 'Delete failed: ' + error.message : `Deleted ${qid}`));
  }

  try {
    const qid = String(form.get('qid') || '');
    const p = parseQid(qid);
    const question_text = String(form.get('question_text') || '').trim();
    const mark_scheme = String(form.get('mark_scheme') || '').trim();
    if (!question_text || !mark_scheme) throw new Error('Question text and mark scheme are required.');

    const row = {
      qid: p.qid, source: p.source, component: p.component, topic: p.topic,
      question_type: p.question_type, tariff: p.tariff, locator: p.locator, seq: p.seq,
      spec_point: String(form.get('spec_point') || '').trim() || null,
      question_text, mark_scheme,
      indicative: String(form.get('indicative') || '').trim() || null,
      spag: form.get('spag') === 'on' || form.get('spag') === '1',
      doc_id: p.source === 'M' ? p.locator : null,
    };

    // ensure a documents row exists for M-sourced questions (FK)
    if (p.source === 'M') {
      await admin.from('documents').upsert({ doc_id: p.locator, title: p.locator }, { onConflict: 'doc_id', ignoreDuplicates: true });
    }

    const { error } = await admin.from('questions').upsert(row, { onConflict: 'qid' });
    if (error) throw new Error(error.message);
    return redirect('/admin/questions?msg=' + encodeURIComponent(`Saved ${p.qid}`));
  } catch (e: any) {
    return redirect('/admin/questions?error=' + encodeURIComponent(e.message));
  }
};

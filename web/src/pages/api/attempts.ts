import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

// Saves a scored attempt + its per-question items. RLS enforces that only an
// approved owner can insert (policy `attempts_insert`).
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/sign-in?returnTo=/generator');

  const form = await request.formData();
  const source = String(form.get('source') || 'CUSTOM') === 'FULL_PAPER' ? 'FULL_PAPER' : 'CUSTOM';
  const method = String(form.get('method') || 'SELF') === 'AI' ? 'AI' : 'SELF';

  // collect mark__<qid> entries
  const marks: { qid: string; mark: number }[] = [];
  for (const [k, v] of form.entries()) {
    if (k.startsWith('mark__') && String(v).trim() !== '') {
      marks.push({ qid: k.slice(6), mark: Number(v) });
    }
  }
  if (marks.length === 0) return redirect('/generator?error=' + encodeURIComponent('Enter at least one mark before saving.'));

  // fetch tariffs (and validate qids exist)
  const { data: qs } = await supabase
    .from('questions').select('qid, tariff').in('qid', marks.map((m) => m.qid));
  const tariffOf = new Map((qs ?? []).map((q: any) => [q.qid, q.tariff]));

  let total = 0, maxTotal = 0;
  const items = marks.filter((m) => tariffOf.has(m.qid)).map((m) => {
    const tariff = tariffOf.get(m.qid)!;
    const awarded = Math.max(0, Math.min(tariff, Math.round(m.mark)));
    total += awarded; maxTotal += tariff;
    return { qid: m.qid, mark_awarded: awarded, tariff };
  });
  if (items.length === 0) return redirect('/generator?error=' + encodeURIComponent('Could not match any questions to save.'));

  const percent = maxTotal > 0 ? Math.round((total / maxTotal) * 10000) / 100 : 0;

  const { data: attempt, error } = await supabase
    .from('attempts')
    .insert({ user_id: user.id, source, method, total, max_total: maxTotal, percent })
    .select('id').single();

  if (error || !attempt) {
    return redirect('/generator?error=' + encodeURIComponent('Save failed (are you approved?): ' + (error?.message ?? '')));
  }

  await supabase.from('attempt_items').insert(items.map((it) => ({ ...it, attempt_id: attempt.id })));
  return redirect('/account?saved=1');
};

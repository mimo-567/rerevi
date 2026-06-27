import type { APIRoute } from 'astro';
import { adminClient } from '@/lib/supabase';
import { parseQid } from '@/lib/qid';

// Bulk import questions from CSV. Header (any order):
//   qid,question_text,mark_scheme,indicative,spag
// source/component/topic/type/tariff/locator/seq are parsed from the QID.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f.trim() !== '')) rows.push(row); }
  return rows;
}

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  if (!locals.isAdmin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const csv = String(form.get('csv') || '').trim();
  if (!csv) return redirect('/admin/questions?error=' + encodeURIComponent('Paste some CSV first.'));

  const rows = parseCSV(csv);
  if (rows.length < 2) return redirect('/admin/questions?error=' + encodeURIComponent('Need a header row plus at least one data row.'));

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const iQid = idx('qid'), iText = idx('question_text'), iMs = idx('mark_scheme'), iInd = idx('indicative'), iSpag = idx('spag');
  if (iQid < 0 || iText < 0 || iMs < 0) {
    return redirect('/admin/questions?error=' + encodeURIComponent('CSV needs at least qid, question_text, mark_scheme columns.'));
  }

  const admin = adminClient();
  const docSlugs = new Set<string>();
  const toUpsert: any[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    try {
      const p = parseQid(cells[iQid] ?? '');
      const text = (cells[iText] ?? '').trim();
      const ms = (cells[iMs] ?? '').trim();
      if (!text || !ms) throw new Error('missing text/mark scheme');
      if (p.source === 'M') docSlugs.add(p.locator);
      toUpsert.push({
        qid: p.qid, source: p.source, component: p.component, topic: p.topic,
        question_type: p.question_type, tariff: p.tariff, locator: p.locator, seq: p.seq,
        question_text: text, mark_scheme: ms,
        indicative: iInd >= 0 ? (cells[iInd] ?? '').trim() || null : null,
        spag: iSpag >= 0 ? /^(1|true|yes)$/i.test((cells[iSpag] ?? '').trim()) : false,
        doc_id: p.source === 'M' ? p.locator : null,
      });
    } catch (e: any) {
      errors.push(`row ${r + 1}: ${e.message}`);
    }
  }

  if (docSlugs.size) {
    await admin.from('documents').upsert([...docSlugs].map((s) => ({ doc_id: s, title: s })), { onConflict: 'doc_id', ignoreDuplicates: true });
  }
  let imported = 0;
  if (toUpsert.length) {
    const { error, count } = await admin.from('questions').upsert(toUpsert, { onConflict: 'qid', count: 'exact' });
    if (error) return redirect('/admin/questions?error=' + encodeURIComponent('Import failed: ' + error.message));
    imported = count ?? toUpsert.length;
  }
  const msg = `Imported ${imported} question(s).` + (errors.length ? ` Skipped ${errors.length}: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '…' : ''}` : '');
  return redirect('/admin/questions?msg=' + encodeURIComponent(msg));
};

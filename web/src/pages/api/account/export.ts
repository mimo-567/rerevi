import type { APIRoute } from 'astro';
import { createServerClient } from '@/lib/supabase';

// Self-serve data export (GDPR right of access). Returns everything REREVI holds
// about the signed-in user as a JSON download.
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClient(cookies, request.headers);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  const { data: attempts } = await supabase
    .from('attempts').select('*').order('created_at', { ascending: false });
  const attemptIds = (attempts ?? []).map((a) => a.id);
  const { data: items } = attemptIds.length
    ? await supabase.from('attempt_items').select('*').in('attempt_id', attemptIds)
    : { data: [] };

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
    profile,
    attempts,
    attempt_items: items,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="rerevi-my-data.json"',
    },
  });
};

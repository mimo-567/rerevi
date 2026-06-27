// Loads the Supabase session on every request and exposes user/profile on
// Astro.locals, so pages can gate features without re-fetching.
import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@/lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient(context.cookies, context.request.headers);

  // getUser() validates the JWT with the auth server (safe for SSR auth gating).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user ?? null;
  context.locals.profile = null;
  context.locals.isAdmin = false;
  context.locals.isApproved = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, role, status')
      .eq('id', user.id)
      .single();
    if (profile) {
      context.locals.profile = profile as AppProfile;
      context.locals.isAdmin = profile.role === 'admin' && profile.status === 'approved';
      context.locals.isApproved = profile.status === 'approved';
    }
  }

  return next();
});

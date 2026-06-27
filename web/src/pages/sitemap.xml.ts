import type { APIRoute } from 'astro';
import { NAV } from '@/lib/nav';

const STATIC_ROUTES = [
  '/',
  '/how-to-revise',
  '/ai-marking',
  '/question-lookup',
  '/generator',
  '/topic-summaries',
  '/mega-database',
  '/privacy',
  '/sign-in',
  '/register',
];

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, '') ?? 'https://rerevi.zafirshirazi.com';
  const navRoutes = NAV.filter((n) => !n.external).map((n) => n.href);
  const routes = Array.from(new Set([...STATIC_ROUTES, ...navRoutes]));
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
    .map((route) => `  <url><loc>${origin}${route}</loc><lastmod>${now}</lastmod></url>`)
    .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

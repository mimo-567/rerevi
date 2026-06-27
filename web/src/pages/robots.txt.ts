import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.toString().replace(/\/$/, '') ?? 'https://rerevi.zafirshirazi.com';
  return new Response(`User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml
`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

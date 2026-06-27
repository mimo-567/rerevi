// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// SSR via the standalone Node adapter — we self-host this in Docker on the VM.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://rerevi.zafirshirazi.com',
  // We sit behind a TLS-terminating proxy (Cloudflare → Caddy → Node over http),
  // so Astro's built-in checkOrigin can't reconcile the https Origin header with
  // the http request it sees, and would 403 every form POST. We instead rely on
  // SameSite=Lax session cookies (Supabase default) to block cross-site requests.
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
  },
});

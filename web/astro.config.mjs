// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// SSR via the standalone Node adapter — we self-host this in Docker on the VM.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://rerevi.zafirshirazi.com',
  vite: {
    plugins: [tailwindcss()],
  },
});

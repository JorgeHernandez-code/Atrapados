/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Sustituye %VITE_PUBLIC_SITE_URL% en index.html (metadatos para redes) aunque la variable no exista. */
function siteUrlInHtml(siteUrl: string): Plugin {
  return {
    name: 'atrapados-site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%VITE_PUBLIC_SITE_URL%', siteUrl.replace(/\/$/, '')),
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react(), tailwindcss(), siteUrlInHtml(env.VITE_PUBLIC_SITE_URL ?? '')],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      // La simulación de 20 000 tests y los recorridos completos del test tardan más de 5 s en equipos lentos.
      testTimeout: 30000,
    },
  };
});

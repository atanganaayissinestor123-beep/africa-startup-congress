import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig(() => {
  return {
    base:'./',
    plugins: [
      react(),
      sitemap({
        hostname: 'https://africastartupcongress.org',
        dynamicRoutes: ['/', '/about', '/speakers', '/program', '/register', '/admin']
      })
    ],
  };
});
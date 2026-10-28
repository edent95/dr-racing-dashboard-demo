import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const adminApiTarget = process.env.VITE_ADMIN_API_TARGET || 'http://127.0.0.1:3501';

  return {
    // Each Vite process that can run alongside another needs its own pre-bundle cache. Two
    // servers sharing node_modules/.vite rewrite each other's deps: a long-running sandbox then
    // serves old and new chunks together, React loads twice and the app dies with "Invalid hook
    // call" (2026-10-06, sandbox on 5387 broken by an e2e run). Playwright sets its own dir.
    cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: adminApiTarget,
          changeOrigin: true,
        },
      },
      // HMR can be disabled via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }

            const normalizedId = id.split(path.sep).join('/');

            if (normalizedId.includes('/@firebase/storage') || normalizedId.includes('/firebase/storage')) {
              return 'vendor-firebase-storage';
            }

            if (normalizedId.includes('/@firebase/auth') || normalizedId.includes('/firebase/auth')) {
              return 'vendor-firebase-auth';
            }

            if (normalizedId.includes('/@firebase/firestore') || normalizedId.includes('/firebase/firestore')) {
              return 'vendor-firebase-firestore';
            }

            if (normalizedId.includes('/@firebase/') || normalizedId.includes('/firebase/')) {
              return 'vendor-firebase';
            }

            if (id.includes('/re2js/')) {
              return 'vendor-re2js';
            }

            return 'vendor';
          },
        },
      },
    },
  };
});

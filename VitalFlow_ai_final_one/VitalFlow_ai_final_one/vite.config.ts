import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          ignored: ['**/django_backend/**', '**/node_modules/**'],
        },
        middlewareMode: false,
      },
      plugins: [
        react({
          jsxImportSource: 'react',
          babel: {
            compact: true,
          }
        }),
        tailwindcss(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'esnext',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          }
        },
        rollupOptions: {
          output: {
            manualChunks: {
              'motion': ['motion/react'],
              'ui': ['lucide-react'],
              'core': ['react', 'react-dom']
            }
          }
        }
      },
      ssr: {
        noExternal: ['motion/react']
      }
    };
});

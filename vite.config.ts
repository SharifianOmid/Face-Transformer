import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // ✅ اولویت با متغیر محیطی (Netlify/CI)، اگر نبود از فایل .env
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

  return {
    base: '/', // ✅ مهم برای Netlify (رفع 404 و MIME module)
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // ✅ هر دو اسم را ست می‌کنیم تا کدهایی که API_KEY می‌خوانند هم کار کنند
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

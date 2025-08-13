import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'; // <-- Isko import karein

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'development' ? '/' : './',
    plugins: [
      react(),
      basicSsl() 
      
    ],
    server: {
      https: true, // <-- Server ko HTTPS par chalane ke liye yeh add karein
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      },
      watch: {
        usePolling: true,
        interval: 100,
      }
    }
  };
});

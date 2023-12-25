import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Spectra Steganography Suite',
        short_name: 'Spectra',
        description: 'Spectra Steganography Suite',
        theme_color: '#131127',
        icons: [
          {
            src: 'spectra-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'spectra-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#131127'
      },
    }),
  ],
  server: {
    port: 4002
  },
});

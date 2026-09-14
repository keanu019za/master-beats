import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/master-beats/',
  plugins: [react(), tailwindcss()],
  define: {
    // Ručno mapiramo ključeve da ih Vite sigurno ubaci u aplikaciju pri buildovanju/pokretanju
    __GOOGLE_DRIVE_API_KEY__: JSON.stringify("AIzaSyBV3-BTocB3a060sAHsh6GnFHHEPx5lAoA"),
    __GOOGLE_CALENDAR_API_KEY__: JSON.stringify("AIzaSyA7qdiPBhIbba43a7_gdx2Pclwy3IDQJaY"),
    __GOOGLE_API_KEY__: JSON.stringify("AIzaSyA7qdiPBhIbba43a7_gdx2Pclwy3IDQJaY"),
    __CALENDAR_ID__: JSON.stringify("871f63891476fedc59363ce104157fe61bd54489a966f52da9ff2c831579a668@group.calendar.google.com"),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
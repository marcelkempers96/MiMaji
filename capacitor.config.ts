import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mimaji.app',
  appName: 'MiMaji',
  webDir: 'out',
  server: {
    // Point to your deployed Vercel URL so API routes & SSR work
    // Update this to your actual production URL
    url: 'https://mimaji.co.ke',
    cleartext: false,
  },
};

export default config;

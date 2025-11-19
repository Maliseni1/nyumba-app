import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nyumba.app',
  appName: 'Nyumba',
  webDir: 'dist', // We keep this line, but it's less important

  // --- THIS IS THE CRITICAL ADDITION ---
  server: {
    url: 'https://nyumba-app.vercel.app', // Your live Vercel URL
    cleartext: true
  }
  // --- END OF ADDITION ---
};

export default config;
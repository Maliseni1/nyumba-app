import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.nyumba.app',
    appName: 'Nyumba',
    webDir: 'dist',

    server: {
        url: 'https://nyumba-app.vercel.app',
        cleartext: true
    },
    
    // --- CRITICAL ADDITION: GOOGLE AUTH PLUGIN CONFIG ---
    plugins: {
        GoogleAuth: {
            // This MUST be the same WEB Client ID used in strings.xml
            androidClientId: '130430606654-rnfbh5nn37089agcm1lhcq8hjpp9ucg3.apps.googleusercontent.com',
            scopes: ['profile', 'email'] // Ensure you request necessary scopes
        }
    }
    // --- END OF PLUGIN CONFIG ---
};

export default config;
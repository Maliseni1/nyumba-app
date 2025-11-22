// nyumba-frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- CRITICAL FIX: UNCOMMENTING MAP IMPORTS ---
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
// -----------------------------------------------------

import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Get the client ID safely, falling back to an empty string if undefined.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Console log for debugging
console.log("Main.jsx - Google Client ID:", googleClientId);

const Root = () => {
  const isGoogleAuthEnabled = googleClientId && googleClientId !== 'placeholder-google-client-id';

  if (!isGoogleAuthEnabled) {
    console.warn("Google OAuth is DISABLED. Please set VITE_GOOGLE_CLIENT_ID in your environment (e.g., Vercel) to enable it.");
  }

  // We define the InnerApp to avoid repeating this nesting
  const InnerApp = () => (
    <AuthContextProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthContextProvider>
  );

  return (
    <React.StrictMode>
      <BrowserRouter>
        {isGoogleAuthEnabled ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <InnerApp />
          </GoogleOAuthProvider>
        ) : (
          /* If Google ID is missing, just render the app without the provider wrapper. 
             Components using Google OAuth will crash if they are rendered. */
          <InnerApp />
        )}
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
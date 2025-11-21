import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// --- CRITICAL FIX: TEMPORARILY COMMENT OUT MAP IMPORTS ---
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-geosearch/dist/geosearch.css';
// ---------------------------------------------------------

import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContextProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Console log for debugging (check this in browser console)
console.log("Main.jsx - Google Client ID:", googleClientId);

const Root = () => {
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
        {googleClientId && googleClientId !== 'placeholder-google-client-id' ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <InnerApp />
          </GoogleOAuthProvider>
        ) : (
          /* If no Google ID, just render the app without the provider wrapper */
          <InnerApp />
        )}
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContextProvider } from './context/AuthContext.jsx';
// --- 1. IMPORT THE NEW THEME PROVIDER ---
import { ThemeProvider } from './context/ThemeContext.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("VITE_GOOGLE_CLIENT_ID is:", googleClientId);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {googleClientId && googleClientId !== 'placeholder-google-client-id' ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthContextProvider>
            {/* --- 2. WRAP APP WITH THEME PROVIDER --- */}
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </AuthContextProvider>
        </GoogleOAuthProvider>
      ) : (
        <AuthContextProvider>
          {/* --- 2. WRAP APP WITH THEME PROVIDER --- */}
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthContextProvider>
      )}
    </BrowserRouter>
  </React.StrictMode>,
);
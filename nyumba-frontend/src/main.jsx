import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContextProvider } from './context/AuthContext.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {googleClientId && googleClientId !== 'placeholder-google-client-id' ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </GoogleOAuthProvider>
      ) : (
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      )}
    </BrowserRouter>
  </React.StrictMode>,
);
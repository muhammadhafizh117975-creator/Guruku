import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept Google OAuth callback inside popup
if (window.opener && (window.location.hash.includes('access_token') || window.location.hash.includes('id_token') || window.location.search.includes('error'))) {
  const hash = window.location.hash.substring(1);
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(hash);
  
  const accessToken = hashParams.get('access_token');
  const error = searchParams.get('error') || hashParams.get('error') || searchParams.get('error_description');
  
  if (accessToken) {
    window.opener.postMessage({
      type: 'GOOGLE_OAUTH_SUCCESS',
      accessToken
    }, window.location.origin);
  } else {
    window.opener.postMessage({
      type: 'GOOGLE_OAUTH_FAILURE',
      error: error || 'Autentikasi Google gagal.'
    }, window.location.origin);
  }
  window.close();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

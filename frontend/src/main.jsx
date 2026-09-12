import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './i18n/index.js';
import i18n from './i18n/index.js';

window.addEventListener('app-lang-change', (e) => {
  i18n.changeLanguage(e.detail);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext'; // ✅ ensure this exists

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* 🔐 Wraps App for login/register access */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { CartProvider } from './context/CartContext';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeModeProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ThemeModeProvider>
  </React.StrictMode>
);
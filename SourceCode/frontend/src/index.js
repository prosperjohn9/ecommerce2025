import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { CartProvider } from './context/CartContext';
import { ThemeModeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeModeProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </ThemeModeProvider>
  </React.StrictMode>
);

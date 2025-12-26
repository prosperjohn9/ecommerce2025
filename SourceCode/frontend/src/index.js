import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { ThemeModeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

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

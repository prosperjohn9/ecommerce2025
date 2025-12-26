import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem('mode') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return ctx;
}

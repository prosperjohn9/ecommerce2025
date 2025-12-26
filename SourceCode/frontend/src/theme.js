// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1565c0',
      },
      background: {
        default: mode === 'light' ? '#f7f7fb' : '#0f1115',
        paper: mode === 'light' ? '#ffffff' : '#151a22',
      },
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 2 },
        styleOverrides: {
          root: { borderRadius: 18 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, textTransform: 'none', fontWeight: 700 },
        },
      },
    },
  });

// src/theme.js
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: mode === 'light' ? '#1f2937' : '#e5e7eb', // charcoal
      },

      secondary: {
        main: mode === 'light' ? '#8b5cf6' : '#a78bfa', // luxury accent
      },

      background: {
        default: mode === 'light' ? '#fafafa' : '#0b0e14',
        paper: mode === 'light' ? '#ffffff' : '#111827',
      },

      error: {
        main: mode === 'light' ? '#dc2626' : '#ef4444',
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
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },

    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#0b0e14',
            color: mode === 'light' ? '#111827' : '#e5e7eb',
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 1 },
        styleOverrides: {
          root: {
            borderRadius: 18,
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          containedPrimary: {
            backgroundColor: mode === 'light' ? '#111827' : '#e5e7eb',
            color: mode === 'light' ? '#ffffff' : '#111827',
            '&:hover': {
              backgroundColor: mode === 'light' ? '#000000' : '#ffffff',
            },
          },
        },
      },
    },
  });

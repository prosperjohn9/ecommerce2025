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

      divider:
        mode === 'light' ? 'rgba(17,24,39,0.10)' : 'rgba(229,231,235,0.12)',
    },

    shape: {
      borderRadius: 14,
    },

    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
      h4: { fontWeight: 800, letterSpacing: -0.6 },
      h5: { fontWeight: 750, letterSpacing: -0.4 },
      h6: { fontWeight: 700, letterSpacing: -0.2 },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#0b0e14',
            color: mode === 'light' ? '#111827' : '#e5e7eb',
            borderBottom:
              mode === 'light'
                ? '1px solid rgba(17,24,39,0.08)'
                : '1px solid rgba(229,231,235,0.08)',
            backdropFilter: 'saturate(180%) blur(8px)',
          },
        },
      },

      MuiContainer: {
        defaultProps: {
          maxWidth: 'xl',
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 1 },
        styleOverrides: {
          root: {
            borderRadius: 18,
            border:
              mode === 'light'
                ? '1px solid rgba(17,24,39,0.08)'
                : '1px solid rgba(229,231,235,0.08)',
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
          outlinedPrimary: {
            borderColor:
              mode === 'light'
                ? 'rgba(17,24,39,0.25)'
                : 'rgba(229,231,235,0.25)',
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 650,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: 'medium',
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

// Optional convenience default export
export default getTheme;

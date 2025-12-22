import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0', // clean blue (matches your navbar vibe)
    },
    background: {
      default: '#f7f7fb',
    },
  },
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Arial', 'sans-serif'].join(','),
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;

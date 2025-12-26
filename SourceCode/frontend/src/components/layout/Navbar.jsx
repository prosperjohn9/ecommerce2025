import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useThemeMode } from '../../context/ThemeContext';

function Navbar() {
  const { cartCount } = useCart();
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar position='sticky' elevation={2}>
      <Toolbar>
        <Typography
          variant='h6'
          component={RouterLink}
          to='/'
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 800,
          }}>
          ChicBags & UrbanShoes
        </Typography>

        <Stack direction='row' spacing={1} alignItems='center'>
          <Button color='inherit' component={RouterLink} to='/'>
            Home
          </Button>

          <Button
            color='inherit'
            component={RouterLink}
            to='/cart'
            startIcon={
              <Badge badgeContent={cartCount} color='error'>
                <ShoppingCartIcon />
              </Badge>
            }>
            Cart
          </Button>

          <IconButton
            color='inherit'
            onClick={toggleMode}
            aria-label='Toggle light/dark mode'
            sx={{ ml: 0.5 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { cartCount } = useCart();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();

  return (
    <AppBar position='sticky' elevation={0}>
      <Toolbar sx={{ py: 0.5 }}>
        <Typography
          variant='h6'
          component={RouterLink}
          to='/'
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 900,
            letterSpacing: -0.4,
          }}>
          ChicBags & UrbanShoes
        </Typography>

        <Stack direction='row' spacing={1} alignItems='center'>
          <Button
            color='inherit'
            component={RouterLink}
            to='/'
            sx={{
              borderRadius: 999,
              px: 2,
              '&:hover': { backgroundColor: 'action.hover' },
            }}>
            Home
          </Button>

          <Button
            color='inherit'
            component={RouterLink}
            to='/cart'
            sx={{
              borderRadius: 999,
              px: 2,
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            startIcon={
              <Badge badgeContent={cartCount} color='error'>
                <ShoppingCartIcon />
              </Badge>
            }>
            Cart
          </Button>

          {/* ✅ Auth */}
          {user ? (
            <>
              <Button
                color='inherit'
                component={RouterLink}
                to='/orders'
                sx={{
                  borderRadius: 999,
                  px: 2,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}>
                My Orders
              </Button>

              <Typography
                variant='body2'
                sx={{
                  fontWeight: 800,
                  mx: 1,
                  display: { xs: 'none', sm: 'block' },
                }}>
                Hi, {user.username}
              </Typography>

              <Button
                color='inherit'
                onClick={logout}
                sx={{
                  borderRadius: 999,
                  px: 2,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color='inherit'
                component={RouterLink}
                to='/login'
                sx={{
                  borderRadius: 999,
                  px: 2,
                  '&:hover': { backgroundColor: 'action.hover' },
                }}>
                Login
              </Button>

              <Button
                variant='contained'
                color='primary'
                component={RouterLink}
                to='/signup'
                sx={{ borderRadius: 999, px: 2 }}>
                Sign up
              </Button>
            </>
          )}

          <Box sx={{ width: 6 }} />

          <Tooltip
            title={
              mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }>
            <IconButton
              color='inherit'
              onClick={toggleMode}
              aria-label='Toggle light/dark mode'
              sx={{
                borderRadius: 999,
                '&:hover': { backgroundColor: 'action.hover' },
              }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

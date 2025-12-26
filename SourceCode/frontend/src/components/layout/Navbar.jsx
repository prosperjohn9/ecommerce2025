import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';

import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import { useCart } from '../../context/CartContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const go = (path) => {
    closeDrawer();
    navigate(path);
  };

  const handleLogout = () => {
    closeDrawer();
    logout();
    navigate('/');
  };

  const cartLabel = useMemo(() => {
    if (!cartCount) return 'Cart';
    return `Cart (${cartCount})`;
  }, [cartCount]);

  return (
    <>
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

          {/* -------- Desktop actions -------- */}
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{ display: { xs: 'none', md: 'flex' } }}>
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

            {user && (
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
            )}

            {user ? (
              <>
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
                mode === 'light'
                  ? 'Switch to dark mode'
                  : 'Switch to light mode'
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

          {/* -------- Mobile actions -------- */}
          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            sx={{ display: { xs: 'flex', md: 'none' } }}>
            <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton
                color='inherit'
                onClick={toggleMode}
                aria-label='Toggle light/dark mode'
                sx={{ borderRadius: 999 }}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            <IconButton
              color='inherit'
              aria-label='Open menu'
              onClick={openDrawer}
              sx={{ borderRadius: 999 }}>
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* -------- Mobile bottom-sheet drawer -------- */}
      <Drawer
        anchor='bottom'
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            pb: 1,
          },
        }}>
        <Box sx={{ px: 2, pt: 1.5 }}>
          {/* “grab handle” */}
          <Box
            sx={{
              width: 42,
              height: 5,
              borderRadius: 99,
              bgcolor: 'divider',
              mx: 'auto',
              mb: 1.5,
            }}
          />

          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Typography sx={{ fontWeight: 900 }}>
              {user ? `Hi, ${user.username}` : 'Menu'}
            </Typography>
            <Button
              onClick={closeDrawer}
              size='small'
              sx={{ borderRadius: 999 }}>
              Close
            </Button>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <List sx={{ pb: 0 }}>
            <ListItemButton onClick={() => go('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary='Home' />
            </ListItemButton>

            <ListItemButton onClick={() => go('/cart')}>
              <ListItemIcon>
                <Badge badgeContent={cartCount} color='error'>
                  <ShoppingCartIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary={cartLabel} />
            </ListItemButton>

            {user && (
              <ListItemButton onClick={() => go('/orders')}>
                <ListItemIcon>
                  <ReceiptLongIcon />
                </ListItemIcon>
                <ListItemText primary='My Orders' />
              </ListItemButton>
            )}

            <Divider sx={{ my: 1 }} />

            {user ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </ListItemButton>
            ) : (
              <>
                <ListItemButton onClick={() => go('/login')}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary='Login' />
                </ListItemButton>

                <ListItemButton onClick={() => go('/signup')}>
                  <ListItemIcon>
                    <PersonAddAltIcon />
                  </ListItemIcon>
                  <ListItemText primary='Sign up' />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;

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

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';

import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CreditCardIcon from '@mui/icons-material/CreditCard';

import { useCart } from '../../context/CartContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { mode, toggleMode } = useThemeMode();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const go = (path) => {
    closeDrawer();
    navigate(path);
  };

  const cartLabel = useMemo(() => {
    if (!cartCount) return 'Cart';
    return `Cart (${cartCount})`;
  }, [cartCount]);

  const handleLogoutClick = () => setLogoutOpen(true);
  const handleLogoutCancel = () => setLogoutOpen(false);

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    closeDrawer();
    logout();
    navigate('/');
  };

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
                  onClick={handleLogoutClick}
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
        transitionDuration={280}
        SlideProps={{
          easing: {
            enter: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
            exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            pb: 1,
          },
        }}>
        <Box sx={{ px: 2, pt: 1.5 }}>
          {/* grab handle */}
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

          {/* Checkout CTA (only when cart has items) */}
          {cartCount > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Button
                fullWidth
                variant='contained'
                size='large'
                startIcon={<CreditCardIcon />}
                onClick={() => go('/checkout')}
                sx={{ borderRadius: 3, py: 1.2 }}>
                Checkout
              </Button>
            </Box>
          )}

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
              <ListItemButton
                onClick={() => {
                  closeDrawer();
                  handleLogoutClick();
                }}>
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

      {/* -------- Logout confirmation modal -------- */}
      <Dialog
        open={logoutOpen}
        onClose={handleLogoutCancel}
        maxWidth='xs'
        fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Log out?</DialogTitle>
        <DialogContent>
          <Typography color='text.secondary'>
            You’ll be signed out of your account on this device.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleLogoutCancel} variant='outlined'>
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant='contained'
            color='error'>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar;
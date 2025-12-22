import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function Navbar() {
  const { cartCount } = useCart();

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography
          variant='h6'
          component={RouterLink}
          to='/'
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          ChicBags & UrbanShoes
        </Typography>

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
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

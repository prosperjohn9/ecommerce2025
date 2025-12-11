import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' sx={{ flexGrow: 1 }}>
          ChicBags & UrbanShoes
        </Typography>

        <Button color='inherit' component={RouterLink} to='/'>
          Home
        </Button>

        <Button color='inherit' component={RouterLink} to='/cart'>
          Cart
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

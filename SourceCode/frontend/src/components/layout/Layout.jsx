import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Container from '@mui/material/Container';

function Layout() {
  return (
    <>
      <Navbar />
      <Container sx={{ mt: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;

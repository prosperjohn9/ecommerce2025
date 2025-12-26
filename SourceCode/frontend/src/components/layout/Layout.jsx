import { Outlet } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Container from '@mui/material/Container';
import Footer from './Footer';


function Layout() {
  return (
    <>
      <Navbar />
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}

export default Layout;
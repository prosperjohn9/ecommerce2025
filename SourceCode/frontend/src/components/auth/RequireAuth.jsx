import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext';

// Shows the page only to a signed-in user. It waits for the /auth/me check first,
// so a page refresh does not bounce a signed-in user to the login page.
// The server enforces access on its own; this only decides what to render.
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label='Checking sign-in' />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;

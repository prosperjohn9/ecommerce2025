import { useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(''); // username OR email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return identifier.trim().length >= 3 && password.length >= 6;
  }, [identifier, password]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = login({ identifier, password });
    if (!res.ok) {
      setError(res.message || 'Login failed.');
      return;
    }
    navigate('/');
  };

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 900 }} gutterBottom>
          Login
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Sign in with your username or email.
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack component='form' spacing={2} onSubmit={onSubmit}>
          <TextField
            label='Username or Email'
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete='username'
            fullWidth
          />

          <TextField
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='current-password'
            fullWidth
          />

          <Button
            type='submit'
            variant='contained'
            size='large'
            disabled={!canSubmit}>
            Login
          </Button>

          <Typography variant='body2' sx={{ textAlign: 'center' }}>
            Don’t have an account?{' '}
            <Link component={RouterLink} to='/signup' underline='hover'>
              Sign up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Login;
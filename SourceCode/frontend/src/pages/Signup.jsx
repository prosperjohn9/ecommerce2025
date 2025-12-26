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

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      username.trim().length >= 3 &&
      email.trim().includes('@') &&
      password.length >= 6 &&
      confirm === password
    );
  }, [username, email, password, confirm]);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = signup({ username, email, password });
    if (!res.ok) {
      setError(res.message || 'Signup failed.');
      return;
    }
    navigate('/');
  };

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 900 }} gutterBottom>
          Create account
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Create a username for your store profile.
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack component='form' spacing={2} onSubmit={onSubmit}>
          <TextField
            label='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            helperText='At least 3 characters'
          />

          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete='email'
            fullWidth
          />

          <TextField
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete='new-password'
            fullWidth
            helperText='At least 6 characters'
          />

          <TextField
            label='Confirm password'
            type='password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete='new-password'
            fullWidth
            error={confirm.length > 0 && confirm !== password}
            helperText={
              confirm.length > 0 && confirm !== password
                ? 'Passwords do not match'
                : ' '
            }
          />

          <Button
            type='submit'
            variant='contained'
            size='large'
            disabled={!canSubmit}>
            Sign up
          </Button>

          <Typography variant='body2' sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link component={RouterLink} to='/login' underline='hover'>
              Login
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Signup;
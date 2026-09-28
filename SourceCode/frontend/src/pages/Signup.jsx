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

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Same rules the server enforces (RegisterRequest.java).
  const canSubmit = useMemo(() => {
    const name = displayName.trim();
    return (
      name.length >= 3 &&
      name.length <= 50 &&
      email.trim().includes('@') &&
      password.length >= 12 &&
      password.length <= 128 &&
      confirm === password &&
      !submitting
    );
  }, [displayName, email, password, confirm, submitting]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await signup({ displayName, email, password });
    setSubmitting(false);
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
          Create your store account.
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack component='form' spacing={2} onSubmit={onSubmit}>
          <TextField
            label='Display name'
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete='nickname'
            fullWidth
            helperText='3 to 50 characters, shown in the menu'
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
            helperText='12 to 128 characters. A few random words work well.'
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
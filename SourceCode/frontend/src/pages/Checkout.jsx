import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Alert from '@mui/material/Alert';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();

  // ✅ Guards (10.5)
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) navigate('/', { replace: true });
    else if (!user) navigate('/login', { replace: true });
  }, [cartItems, user, navigate]);

  const [shipping, setShipping] = useState({
    fullName: user?.username || '',
    phone: '',
    address: '',
    city: '',
    country: 'Türkiye',
  });

  const [payment, setPayment] = useState('CARD');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const subtotal = useMemo(() => Number(cartTotal || 0), [cartTotal]);
  const shippingFee = useMemo(() => (subtotal > 0 ? 0 : 0), [subtotal]); // keep 0 for now
  const total = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  const canPlaceOrder = useMemo(() => {
    return (
      shipping.fullName.trim().length >= 3 &&
      shipping.phone.trim().length >= 7 &&
      shipping.address.trim().length >= 5 &&
      shipping.city.trim().length >= 2 &&
      shipping.country.trim().length >= 2 &&
      cartCount > 0
    );
  }, [shipping, cartCount]);

  const onPlaceOrder = () => {
    setError('');
    if (!canPlaceOrder) {
      setError('Please fill all shipping fields correctly.');
      return;
    }

    // UI-only “success”
    setSuccess(true);
    clearCart();

    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1200);
  };

  if (!cartItems || cartItems.length === 0) return null; // guard safety
  if (!user) return null;

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 900 }}>
        Checkout
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems='flex-start'>
        {/* Left: Shipping + Payment */}
        <Paper sx={{ p: 3, flex: 1, width: '100%' }}>
          <Typography variant='h6' sx={{ fontWeight: 900 }} gutterBottom>
            Shipping details
          </Typography>

          <Stack spacing={2}>
            <TextField
              label='Full name'
              value={shipping.fullName}
              onChange={(e) =>
                setShipping((s) => ({ ...s, fullName: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label='Phone'
              value={shipping.phone}
              onChange={(e) =>
                setShipping((s) => ({ ...s, phone: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label='Address'
              value={shipping.address}
              onChange={(e) =>
                setShipping((s) => ({ ...s, address: e.target.value }))
              }
              fullWidth
              multiline
              minRows={2}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label='City'
                value={shipping.city}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, city: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label='Country'
                value={shipping.country}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, country: e.target.value }))
                }
                fullWidth
              />
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant='h6' sx={{ fontWeight: 900 }} gutterBottom>
            Payment
          </Typography>

          <RadioGroup
            value={payment}
            onChange={(e) => setPayment(e.target.value)}>
            <FormControlLabel value='CARD' control={<Radio />} label='Card' />
            <FormControlLabel
              value='COD'
              control={<Radio />}
              label='Cash on Delivery'
            />
          </RadioGroup>

          {error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' sx={{ mt: 2 }}>
              Order placed successfully! Redirecting…
            </Alert>
          )}
        </Paper>

        {/* Right: Order Summary */}
        <Paper
          sx={{
            p: 3,
            width: { xs: '100%', md: 380 },
            position: 'sticky',
            top: 90,
          }}>
          <Typography variant='h6' sx={{ fontWeight: 900 }} gutterBottom>
            Order Summary
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {cartItems.map((item) => (
              <Stack
                key={item.id}
                direction='row'
                justifyContent='space-between'
                alignItems='flex-start'
                spacing={2}>
                <Stack sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }} noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Qty: {item.quantity} • ${Number(item.price).toFixed(2)}
                  </Typography>
                </Stack>

                <Typography sx={{ fontWeight: 900 }}>
                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Stack direction='row' justifyContent='space-between'>
              <Typography color='text.secondary'>Subtotal</Typography>
              <Typography sx={{ fontWeight: 900 }}>
                ${subtotal.toFixed(2)}
              </Typography>
            </Stack>

            <Stack direction='row' justifyContent='space-between'>
              <Typography color='text.secondary'>Shipping</Typography>
              <Typography sx={{ fontWeight: 900 }}>
                {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
              </Typography>
            </Stack>

            <Stack direction='row' justifyContent='space-between'>
              <Typography sx={{ fontWeight: 900 }}>Total</Typography>
              <Typography sx={{ fontWeight: 900 }}>
                ${total.toFixed(2)}
              </Typography>
            </Stack>
          </Stack>

          <Button
            variant='contained'
            size='large'
            fullWidth
            sx={{ mt: 2 }}
            onClick={onPlaceOrder}
            disabled={!canPlaceOrder || success}>
            Place Order
          </Button>

          <Button
            component={RouterLink}
            to='/cart'
            variant='text'
            fullWidth
            sx={{ mt: 1 }}>
            Back to Cart
          </Button>
        </Paper>
      </Stack>
    </Container>
  );
}

export default Checkout;

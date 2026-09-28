import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { keyframes } from '@mui/system';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api/orderAPI';
import { errorMessage } from '../api/client';

/* ---------------------------
   Confetti (lightweight CSS)
---------------------------- */
const fall = keyframes`
  0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
`;

function ConfettiBurst({ active }) {
  const pieces = useMemo(() => {
    const colors = [
      '#8b5cf6',
      '#22c55e',
      '#eab308',
      '#06b6d4',
      '#ef4444',
      '#111827',
    ];
    return Array.from({ length: 24 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.35;
      const duration = 1.2 + Math.random() * 0.6;
      const size = 6 + Math.random() * 6;
      const bg = colors[i % colors.length];
      return { left, delay, duration, size, bg, i };
    });
  }, []);

  if (!active) return null;

  return (
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}>
      {pieces.map((p) => (
        <Box
          key={p.i}
          sx={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            borderRadius: 1,
            backgroundColor: p.bg,
            animation: `${fall} ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </Box>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // The order as the server saved it (ids, prices and total are the server's).
  const [placedOrder, setPlacedOrder] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(false);

  // Countdown (8 seconds)
  const COUNTDOWN_START = 8;
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  // Guard: nothing to check out (IMPORTANT: don’t redirect while modal is open).
  // Sign-in is enforced by RequireAuth in App.js.
  useEffect(() => {
    if (!confirmOpen && cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems.length, confirmOpen, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.phone.trim()) next.phone = 'Phone is required';
    if (!form.address.trim()) next.address = 'Address is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.country.trim()) next.country = 'Country is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      // Only product ids and quantities are sent. The server prices the order.
      const order = await placeOrder({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shipping: form,
        paymentMethod,
      });

      setPlacedOrder(order);
      setExpandedSummary(false);
      setCountdown(COUNTDOWN_START);
      setConfirmOpen(true);
      // Do NOT clear cart here
    } catch (error) {
      setSubmitError(
        errorMessage(error, 'Could not place the order. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Close should clear cart + go to Cart page
  const handleCloseModal = () => {
    setConfirmOpen(false);
    navigate('/cart');
    setTimeout(() => clearCart(), 0); // clear AFTER navigation (prevents guard redirect to home)
  };

  const handleContinueShopping = () => {
    clearCart();
    setConfirmOpen(false);
    navigate('/');
  };

  const handleViewOrders = () => {
    // Navigate first, then clear (prevents Checkout guard from kicking to home)
    setConfirmOpen(false);
    navigate('/orders');
    setTimeout(() => clearCart(), 0);
  };

  // Countdown tick (never negative)
  useEffect(() => {
    if (!confirmOpen) return;

    const t = setInterval(() => {
      setCountdown((c) => Math.max(c - 1, 0));
    }, 1000);

    return () => clearInterval(t);
  }, [confirmOpen]);

  // Auto-finish when countdown hits 0
  useEffect(() => {
    if (!confirmOpen) return;
    if (countdown === 0) handleContinueShopping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, confirmOpen]);

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Typography variant='h4' sx={{ fontWeight: 900, mb: 3 }}>
        Checkout
      </Typography>

      <Stack spacing={3}>
        {/* Order Summary */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 900, mb: 2 }}>
            Order Summary
          </Typography>

          <Stack spacing={1}>
            {cartItems.map((item) => (
              <Stack
                key={item.id}
                direction='row'
                justifyContent='space-between'>
                <Typography variant='body2'>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography variant='body2' fontWeight={700}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='h6' fontWeight={900}>
              Total
            </Typography>
            <Typography variant='h6' fontWeight={900}>
              ${Number(cartTotal).toFixed(2)}
            </Typography>
          </Stack>
        </Paper>

        {/* Shipping */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 900, mb: 2 }}>
            Shipping Information
          </Typography>

          <Stack spacing={2}>
            <TextField
              label='Full Name'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName}
            />
            <TextField
              label='Phone Number'
              name='phone'
              value={form.phone}
              onChange={handleChange}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone}
            />
            <TextField
              label='Address'
              name='address'
              value={form.address}
              onChange={handleChange}
              fullWidth
              error={!!errors.address}
              helperText={errors.address}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label='City'
                name='city'
                value={form.city}
                onChange={handleChange}
                fullWidth
                error={!!errors.city}
                helperText={errors.city}
              />
              <TextField
                label='Country'
                name='country'
                value={form.country}
                onChange={handleChange}
                fullWidth
                error={!!errors.country}
                helperText={errors.country}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Payment */}
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 900, mb: 2 }}>
            Payment Method
          </Typography>

          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel
              value='CARD'
              control={<Radio />}
              label='Credit / Debit Card'
            />
            <FormControlLabel
              value='COD'
              control={<Radio />}
              label='Cash on Delivery'
            />
          </RadioGroup>
        </Paper>

        {/* Place Order */}
        <Box>
          {submitError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Button
            variant='contained'
            size='large'
            fullWidth
            disabled={submitting}
            onClick={handlePlaceOrder}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </Button>

          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Demo checkout — no real payment is processed.
          </Typography>
        </Box>
      </Stack>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth='sm'>
        <Box sx={{ position: 'relative' }}>
          <ConfettiBurst active={confirmOpen} />

          <DialogTitle sx={{ fontWeight: 900 }}>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <CheckCircleIcon />
              <span>Order Confirmed</span>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 1.5 }}>
              Thanks, <strong>{user?.displayName}</strong> — your order has
              been placed successfully.
            </Typography>

            <Paper variant='outlined' sx={{ p: 2, borderRadius: 3, mb: 2 }}>
              <Stack spacing={0.75}>
                <Typography variant='body2' color='text.secondary'>
                  Order ID
                </Typography>
                <Typography fontWeight={900}>#{placedOrder?.id}</Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant='body2' color='text.secondary'>
                  Placed at
                </Typography>
                <Typography fontWeight={700}>
                  {placedOrder &&
                    new Date(placedOrder.createdAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant='body2' color='text.secondary'>
                  Total
                </Typography>
                <Typography fontWeight={900}>
                  ${Number(placedOrder?.total).toFixed(2)}
                </Typography>

                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}>
                  Payment method:{' '}
                  <strong>
                    {placedOrder?.paymentMethod === 'COD'
                      ? 'Cash on Delivery'
                      : 'Card'}
                  </strong>
                </Typography>
              </Stack>
            </Paper>

            <Accordion
              expanded={expandedSummary}
              onChange={() => setExpandedSummary((p) => !p)}
              disableGutters
              sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={900}>View order summary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {(placedOrder?.items || []).map((item) => (
                    <Stack
                      key={item.productId}
                      direction='row'
                      justifyContent='space-between'
                      alignItems='flex-start'
                      spacing={2}>
                      <Typography variant='body2' sx={{ flex: 1 }}>
                        {item.productName} × {item.quantity}
                      </Typography>
                      <Typography variant='body2' fontWeight={800}>
                        ${Number(item.lineTotal).toFixed(2)}
                      </Typography>
                    </Stack>
                  ))}
                  <Divider />
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography fontWeight={900}>Total</Typography>
                    <Typography fontWeight={900}>
                      ${Number(placedOrder?.total).toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mt: 2 }}>
              Auto-continuing in {countdown}s…
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleCloseModal} variant='outlined'>
              Close
            </Button>

            <Button onClick={handleViewOrders} variant='outlined'>
              View Orders
            </Button>

            <Button onClick={handleContinueShopping} variant='contained'>
              Continue shopping ({countdown}s)
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Checkout;
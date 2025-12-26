import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useAuth } from '../context/AuthContext';

function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(saved);
  }, []);

  const myOrders = useMemo(() => {
    if (!user?.email) return [];
    return orders
      .filter((o) => o.userEmail === user.email)
      .slice()
      .reverse();
  }, [orders, user]);

  const paymentLabel = (m) => (m === 'COD' ? 'Cash on Delivery' : 'Card');

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        spacing={1}
        sx={{ mb: 2 }}>
        <Typography variant='h4' sx={{ fontWeight: 900 }}>
          My Orders
        </Typography>

        <Button component={RouterLink} to='/' variant='outlined'>
          Continue shopping
        </Button>
      </Stack>

      {myOrders.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ mb: 1 }}>You don’t have any orders yet.</Typography>
          <Button component={RouterLink} to='/' variant='contained'>
            Browse products
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {myOrders.map((o) => (
            <Paper key={o.id} sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>{o.id}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Placed: {o.placedAt}
                  </Typography>
                </Box>

                <Stack direction='row' spacing={1} alignItems='center'>
                  <Chip size='small' label={paymentLabel(o.paymentMethod)} />
                  <Typography sx={{ fontWeight: 900 }}>
                    ${Number(o.total).toFixed(2)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Accordion
                disableGutters
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&:before': { display: 'none' },
                }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 900 }}>
                    View order details
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Paper
                    variant='outlined'
                    sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                      Shipping
                    </Typography>
                    <Stack spacing={0.5}>
                      <Typography variant='body2'>
                        <strong>Name:</strong> {o.shipping?.fullName}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Phone:</strong> {o.shipping?.phone}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Address:</strong> {o.shipping?.address}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>City:</strong> {o.shipping?.city}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Country:</strong> {o.shipping?.country}
                      </Typography>
                    </Stack>
                  </Paper>

                  <Typography sx={{ fontWeight: 900, mb: 1 }}>Items</Typography>
                  <Stack spacing={1}>
                    {(o.items || []).map((item) => (
                      <Stack
                        key={`${item.id}-${item.name}`}
                        direction='row'
                        justifyContent='space-between'
                        spacing={2}
                        alignItems='flex-start'>
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.name} × {item.quantity}
                        </Typography>
                        <Typography variant='body2' sx={{ fontWeight: 900 }}>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction='row' justifyContent='space-between'>
                    <Typography sx={{ fontWeight: 900 }}>Total</Typography>
                    <Typography sx={{ fontWeight: 900 }}>
                      ${Number(o.total).toFixed(2)}
                    </Typography>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default Orders;
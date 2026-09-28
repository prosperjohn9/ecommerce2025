import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { fetchMyOrders } from '../api/orderAPI';
import { errorMessage } from '../api/client';

// Sign-in is enforced by RequireAuth in App.js. The server returns only the
// signed-in user's orders, newest first.
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchMyOrders()
      .then((data) => active && setOrders(data))
      .catch((err) => active && setError(errorMessage(err, 'Could not load your orders.')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label='Loading orders' />
        </Box>
      ) : error ? (
        <Alert severity='error'>{error}</Alert>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ mb: 1 }}>You don’t have any orders yet.</Typography>
          <Button component={RouterLink} to='/' variant='contained'>
            Browse products
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {orders.map((o) => (
            <Paper key={o.id} sx={{ p: 2.5, borderRadius: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 900 }}>Order #{o.id}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Placed: {new Date(o.createdAt).toLocaleString()}
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
                        key={item.productId}
                        direction='row'
                        justifyContent='space-between'
                        spacing={2}
                        alignItems='flex-start'>
                        <Typography variant='body2' sx={{ flex: 1 }}>
                          {item.productName} × {item.quantity}
                        </Typography>
                        <Typography variant='body2' sx={{ fontWeight: 900 }}>
                          ${Number(item.lineTotal).toFixed(2)}
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

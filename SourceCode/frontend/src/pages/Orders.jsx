import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import { useAuth } from '../context/AuthContext';

function Orders() {
  const { user } = useAuth();

  const orders = (JSON.parse(localStorage.getItem('orders')) || []).filter(
    (o) => o.userEmail === user?.email
  );

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Typography variant='h4' sx={{ fontWeight: 900, mb: 3 }}>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography>No orders yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => (
            <Paper key={order.id} sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography fontWeight={900}>Order #{order.id}</Typography>

                <Typography variant='body2' color='text.secondary'>
                  {order.placedAt}
                </Typography>

                <Divider />

                {order.items.map((item) => (
                  <Typography key={item.id} variant='body2'>
                    {item.name} × {item.quantity}
                  </Typography>
                ))}

                <Divider />

                <Typography fontWeight={900}>
                  Total: ${order.total.toFixed(2)}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default Orders;

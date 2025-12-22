import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import { useCart } from '../context/CartContext';

function Cart() {
  const {
    cartItems,
    cartTotal,
    clearCart,
    removeFromCart,
    addToCart,
    decreaseQuantity,
  } = useCart();

  return (
    <Container sx={{ py: 4 }}>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}>
        <Typography variant='h4'>Cart</Typography>

        <Button
          variant='outlined'
          color='error'
          onClick={clearCart}
          disabled={cartItems.length === 0}>
          Clear Cart
        </Button>
      </Stack>

      {cartItems.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <Stack spacing={2}>
          {cartItems.map((item) => (
            <Paper key={item.id} sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant='h6'>{item.name}</Typography>

                <Typography variant='body2' color='text.secondary'>
                  ${Number(item.price).toFixed(2)} × {item.quantity}
                </Typography>

                <Stack direction='row' spacing={1}>
                  <Button
                    variant='outlined'
                    onClick={() => decreaseQuantity(item.id)}>
                    -
                  </Button>

                  <Button variant='outlined' onClick={() => addToCart(item, 1)}>
                    +
                  </Button>

                  <Button
                    variant='contained'
                    color='error'
                    onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}

          <Divider />

          <Typography variant='h5'>
            Total: ${Number(cartTotal).toFixed(2)}
          </Typography>
        </Stack>
      )}
    </Container>
  );
}

export default Cart;

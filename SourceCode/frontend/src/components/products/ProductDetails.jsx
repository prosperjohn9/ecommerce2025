import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import client from '../../api/client';
import { useCart } from '../../context/CartContext';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const fallbackImage =
  'https://via.placeholder.com/800x500?text=ChicBags+%26+UrbanShoes';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openSnack, setOpenSnack] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await client.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product', error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setOpenSnack(true);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4} alignItems='center'>
        <Grid item xs={12} md={6}>
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            style={{ width: '100%', borderRadius: 12 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography variant='h4'>{product.name}</Typography>

            {product.category ? <Chip label={product.category} /> : null}

            <Typography variant='h5' color='primary'>
              ${Number(product.price).toFixed(2)}
            </Typography>

            {product.description ? (
              <Typography variant='body1'>{product.description}</Typography>
            ) : null}

            {/* Quantity + Add to Cart */}
            <Stack direction='row' spacing={2} alignItems='center'>
              <IconButton
                aria-label='Decrease quantity'
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <RemoveIcon />
              </IconButton>

              <Typography sx={{ minWidth: 24, textAlign: 'center' }}>
                {quantity}
              </Typography>

              <IconButton
                aria-label='Increase quantity'
                onClick={() => setQuantity((q) => q + 1)}>
                <AddIcon />
              </IconButton>

              <Button
                variant='contained'
                size='large'
                onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnack}
        autoHideDuration={2000}
        onClose={() => setOpenSnack(false)}>
        <Alert
          onClose={() => setOpenSnack(false)}
          severity='success'
          sx={{ width: '100%' }}>
          Added to cart!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductDetails;
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

const fallbackImage =
  'https://via.placeholder.com/800x500?text=ChicBags+%26+UrbanShoes';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

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

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            style={{ width: '100%', borderRadius: 8 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography variant='h4'>{product.name}</Typography>

            {product.category && <Chip label={product.category} />}

            <Typography variant='h5' color='primary'>
              ${Number(product.price).toFixed(2)}
            </Typography>

            <Typography variant='body1'>{product.description}</Typography>

            <Button
              variant='contained'
              size='large'
              onClick={() => addToCart(product, 1)}
            >
              Add to Cart
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProductDetails;

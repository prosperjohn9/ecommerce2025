import { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function Home() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getAllProducts(filter); // <-- now uses query param
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError('Failed to fetch products.');
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Products
      </Typography>

      <Stack direction='row' spacing={2} sx={{ mb: 3 }} justifyContent='center'>
        <Button
          variant={filter === 'ALL' ? 'contained' : 'outlined'}
          onClick={() => setFilter('ALL')}>
          All
        </Button>

        <Button
          variant={filter === 'BAG' ? 'contained' : 'outlined'}
          onClick={() => setFilter('BAG')}>
          Bags
        </Button>

        <Button
          variant={filter === 'SHOE' ? 'contained' : 'outlined'}
          onClick={() => setFilter('SHOE')}>
          Shoes
        </Button>
      </Stack>

      {loading && (
        <Stack alignItems='center' sx={{ py: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {!loading && error && <Alert severity='error'>{error}</Alert>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Home;

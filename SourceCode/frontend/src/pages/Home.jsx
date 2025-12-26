import { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

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
        const data = await getAllProducts(filter); // server-side filter via query param
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

  const gridSx = {
    display: 'grid',
    gap: 3,
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))', // phone: 2
      md: 'repeat(4, minmax(0, 1fr))', // tablet: 4
      lg: 'repeat(6, minmax(0, 1fr))', // big screen: 6
    },
    alignItems: 'stretch',
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Products
      </Typography>

      <Stack
        direction='row'
        spacing={2}
        sx={{ mb: 3 }}
        justifyContent='center'
        flexWrap='wrap'
        useFlexGap>
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

      {error && <Alert severity='error'>{error}</Alert>}

      {loading ? (
        <Box sx={gridSx}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}>
              <Skeleton variant='rectangular' height={200} />
              <Box sx={{ p: 2 }}>
                <Skeleton width='45%' height={22} />
                <Skeleton width='90%' height={28} />
                <Skeleton width='70%' height={28} />
                <Skeleton width='35%' height={22} sx={{ mt: 1 }} />
                <Skeleton variant='rounded' height={44} sx={{ mt: 2 }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        !error && (
          <Box sx={gridSx}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
        )
      )}
    </Container>
  );
}

export default Home;

import { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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

      {/* Pill segmented control */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, next) => {
            if (next) setFilter(next);
          }}
          sx={{
            p: 0.5,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            '& .MuiToggleButton-root': {
              px: 2.5,
              py: 1,
              border: 0,
              borderRadius: 999,
              textTransform: 'none',
              fontWeight: 900,
              minWidth: 90,
            },
            '& .MuiToggleButton-root.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'background.paper',
              '&:hover': {
                backgroundColor: 'primary.main',
                opacity: 0.92,
              },
            },
          }}>
          <ToggleButton value='ALL'>All</ToggleButton>
          <ToggleButton value='BAG'>Bags</ToggleButton>
          <ToggleButton value='SHOE'>Shoes</ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
          // Smooth fade-in when products render
          <Box
            sx={{
              opacity: 0,
              transform: 'translateY(6px)',
              animation: 'fadeUp 260ms ease forwards',
              '@keyframes fadeUp': {
                to: { opacity: 1, transform: 'translateY(0px)' },
              },
            }}>
            <Box sx={gridSx}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          </Box>
        )
      )}
    </Container>
  );
}

export default Home;
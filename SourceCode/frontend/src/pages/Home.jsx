import { useEffect, useState } from 'react';
import { getAllProducts } from '../api/productAPI';
import ProductCard from '../components/products/ProductCard';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function Home() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);
  
  const filteredProducts =
    filter === 'ALL'
      ? products
      : products.filter((p) => p.category?.toUpperCase() === filter);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        Products
      </Typography>

      <Stack direction='row' spacing={2} sx={{ mb: 3 }}>
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

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;

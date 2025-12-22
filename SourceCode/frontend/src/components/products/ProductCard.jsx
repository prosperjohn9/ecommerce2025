import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';

const fallbackImage =
  'https://via.placeholder.com/600x400?text=ChicBags+%26+UrbanShoes';

function ProductCard({ product }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component='img'
        height='180'
        image={product.imageUrl || fallbackImage}
        alt={product.name}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
          {product.category && (
            <Chip size='small' label={product.category} variant='outlined' />
          )}
        </Stack>

        <Typography variant='h6' gutterBottom>
          {product.name}
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          ${Number(product.price).toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button
          size='small'
          variant='contained'
          component={RouterLink}
          to={`/products/${product.id}`}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;

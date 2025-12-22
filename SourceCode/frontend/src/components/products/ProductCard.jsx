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
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 6,
        },
      }}
      elevation={2}>
      <CardMedia
        component='img'
        height='190'
        image={product?.imageUrl || fallbackImage}
        alt={product?.name || 'Product'}
        loading='lazy'
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
          {product?.category && (
            <Chip size='small' label={product.category} variant='outlined' />
          )}
        </Stack>

        <Typography variant='h6' sx={{ lineHeight: 1.2 }} gutterBottom noWrap>
          {product?.name}
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          ${Number(product?.price || 0).toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size='small'
          variant='contained'
          fullWidth
          component={RouterLink}
          to={`/products/${product?.id}`}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;

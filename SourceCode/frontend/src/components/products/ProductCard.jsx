import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

const fallbackImage =
  'https://via.placeholder.com/600x400?text=ChicBags+%26+UrbanShoes';

function ProductCard({ product }) {
  return (
    <Card
      elevation={2}
      sx={{
        width: '100%',
        height: 380, // Lock height so ALL cards match
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden', // Prevents any inner overflow affecting size
      }}>
      {/* Fixed image area */}
      <CardMedia
        component='img'
        image={product?.imageUrl || fallbackImage}
        alt={product?.name || 'Product image'}
        sx={{
          height: 200, // Fixed image height
          width: '100%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />

      {/* Content area takes remaining space */}
      <CardContent
        sx={{
          flexGrow: 1,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
        {product?.category && (
          <Chip
            label={product.category}
            size='small'
            sx={{ width: 'fit-content' }}
          />
        )}

        {/* Title: 2-line clamp + consistent height */}
        <Typography
          variant='h6'
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.2,
            minHeight: '2.4em', // Reserves 2 lines always
          }}>
          {product?.name}
        </Typography>

        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontWeight: 600 }}>
          ${Number(product?.price || 0).toFixed(2)}
        </Typography>

        {/* Spacer so button area stays consistent even if content changes */}
        <div style={{ flexGrow: 1 }} />
      </CardContent>

      {/* Actions pinned to bottom */}
      <CardActions
        sx={{ p: 2, pt: 1, pb: 3, minHeight: 64, alignItems: 'flex-end' }}>
        <Box sx={{ width: '100%', mb: 1 }}>
          {/* mb creates visible gap */}
          <Button
            fullWidth
            variant='contained'
            component={RouterLink}
            to={`/products/${product.id}`}
            sx={{
              py: 1,
              borderRadius: 2,
            }}>
            View Details
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
}

export default ProductCard;

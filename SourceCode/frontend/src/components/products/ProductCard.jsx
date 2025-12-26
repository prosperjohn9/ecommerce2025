import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';

const fallbackImage =
  'https://via.placeholder.com/600x400?text=ChicBags+%26+UrbanShoes';

function ProductCard({ product }) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        willChange: 'transform',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 14px 40px rgba(17,24,39,0.14)'
              : '0 14px 40px rgba(0,0,0,0.45)',
        },
      }}>
      {/* Image wrapper enables smooth zoom */}
      <Box
        sx={{
          height: 200,
          overflow: 'hidden',
          position: 'relative',
        }}>
        <CardMedia
          component='img'
          image={product.imageUrl || fallbackImage}
          alt={product.name}
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            transition: 'transform 280ms ease',
            transformOrigin: 'center',
            // Image zoom on hover
            '.MuiCard-root:hover &': {
              transform: 'scale(1.06)',
            },
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          {product.category && (
            <Chip
              label={product.category}
              size='small'
              sx={{
                width: 'fit-content',
                fontWeight: 700,
              }}
            />
          )}

          {/* Title: max 2 lines, consistent height */}
          <Typography
            variant='h6'
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 56,
              lineHeight: 1.2,
            }}>
            {product.name}
          </Typography>

          {/* Brand */}
          {product.brand && (
            <Typography variant='body2' color='text.secondary'>
              {product.brand}
            </Typography>
          )}

          <Typography variant='body2' color='text.secondary' fontWeight={800}>
            ${Number(product.price).toFixed(2)}
          </Typography>
        </Stack>
      </CardContent>

      {/* Actions: add bottom padding so button never touches card border */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          fullWidth
          variant='contained'
          component={RouterLink}
          to={`/products/${product.id}`}
          sx={{
            py: 1.1,
            transition: 'transform 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0px) scale(0.98)',
            },
          }}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;
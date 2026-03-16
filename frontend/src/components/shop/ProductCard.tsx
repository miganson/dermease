import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { formatCurrency } from "../../lib/format";
import { useCart } from "../../hooks/useCart";
import type { Product } from "../../types/domain";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia component="img" height="240" image={product.imageUrl} alt={product.name} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography variant="h6">{product.name}</Typography>
          <Chip
            label={product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Sold out"}
            color={product.stockQuantity > 0 ? "secondary" : "default"}
            size="small"
          />
        </Stack>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {product.shortDescription}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {formatCurrency(product.price)}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button component={RouterLink} to={`/products/${product.slug}`} variant="outlined" fullWidth>
          View details
        </Button>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartOutlinedIcon />}
          disabled={product.stockQuantity === 0}
          onClick={() => addItem(product, 1)}
        >
          Add
        </Button>
      </CardActions>
    </Card>
  );
}


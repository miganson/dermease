import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import { Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "../../api/endpoints";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/format";

export function ProductDetailsPage() {
  const { identifier = "" } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const productQuery = useQuery({
    queryKey: ["product", identifier],
    queryFn: () => productApi.get(identifier)
  });

  if (productQuery.isLoading) {
    return <LoadingState message="Loading product details..." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <EmptyState
        title="Product not found"
        description="This item may have been removed or the product identifier is invalid."
        actionLabel="Back to shop"
        actionTo="/"
      />
    );
  }

  const product = productQuery.data;

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2 }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: "100%", display: "block", borderRadius: 18, objectFit: "cover" }}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={2}>
          <Typography variant="h3">{product.name}</Typography>
          <Typography variant="h5" color="primary.main">
            {formatCurrency(product.price)}
          </Typography>
          <Typography color="text.secondary">{product.description}</Typography>
          <Typography color="text.secondary">SKU: {product.sku}</Typography>
          <Typography color={product.stockQuantity > 0 ? "secondary.main" : "error.main"}>
            {product.stockQuantity > 0
              ? `${product.stockQuantity} units available`
              : "This product is currently out of stock"}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              inputProps={{ min: 1, max: product.stockQuantity }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartOutlinedIcon />}
              disabled={product.stockQuantity === 0}
              onClick={() => addItem(product, Math.max(1, Math.min(quantity, product.stockQuantity)))}
            >
              Add to cart
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}


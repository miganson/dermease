import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getFallbackProductImage } from "../../lib/images";
import { EmptyState } from "../../components/common/EmptyState";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/format";

const SHIPPING_FEE = 60;

export function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the DermEase catalog and add items to begin checkout."
        actionLabel="Browse products"
        actionTo="/"
      />
    );
  }

  return (
    <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
      <Paper sx={{ p: 3, flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Cart review
        </Typography>
        <List>
          {items.map((item) => (
            <ListItem
              key={item.productId}
              divider
              secondaryAction={
                <IconButton edge="end" onClick={() => removeItem(item.productId)}>
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              }
              sx={{ alignItems: "flex-start", gap: 2 }}
            >
              <ListItemAvatar>
                <Avatar
                  src={item.imageUrl}
                  variant="rounded"
                  sx={{ width: 72, height: 72 }}
                  imgProps={{
                    onError: (event) => {
                      event.currentTarget.src = getFallbackProductImage(item.name);
                    }
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Typography color="text.secondary">{formatCurrency(item.price)}</Typography>
                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                      inputProps={{ min: 1, max: item.stockQuantity }}
                      sx={{ width: 120 }}
                    />
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 3, width: { xs: "100%", lg: 360 }, alignSelf: "flex-start" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Summary
        </Typography>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Shipping</Typography>
            <Typography>{formatCurrency(SHIPPING_FEE)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{formatCurrency(subtotal + SHIPPING_FEE)}</Typography>
          </Stack>
          <Button component={RouterLink} to="/checkout" variant="contained" size="large" sx={{ mt: 2 }}>
            Proceed to checkout
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

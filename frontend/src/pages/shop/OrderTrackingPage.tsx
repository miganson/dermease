import { Alert, Divider, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/endpoints";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { StatusChip } from "../../components/common/StatusChip";
import { formatCurrency, formatDate } from "../../lib/format";

export function OrderTrackingPage() {
  const ordersQuery = useQuery({
    queryKey: ["orders", "mine"],
    queryFn: orderApi.mine
  });

  if (ordersQuery.isLoading) {
    return <LoadingState message="Loading orders..." />;
  }

  if (ordersQuery.isError) {
    return <Alert severity="error">Unable to load order tracking right now.</Alert>;
  }

  if (!ordersQuery.data?.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your placed orders will appear here with payment and fulfillment status."
        actionLabel="Start shopping"
        actionTo="/"
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Order tracking</Typography>
      {ordersQuery.data.map((order) => (
        <Paper key={order._id} sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <div>
                <Typography variant="h6">Order {order._id}</Typography>
                <Typography color="text.secondary">Placed {formatDate(order.createdAt)}</Typography>
              </div>
              <Stack direction="row" spacing={1}>
                <StatusChip status={order.status} />
                <StatusChip status={order.paymentStatus} kind="payment" />
              </Stack>
            </Stack>
            <Divider />
            {order.items.map((item) => (
              <Stack key={`${order._id}-${item.product}`} direction="row" justifyContent="space-between">
                <Typography color="text.secondary">
                  {item.productName} x{item.quantity}
                </Typography>
                <Typography>{formatCurrency(item.lineTotal)}</Typography>
              </Stack>
            ))}
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{formatCurrency(order.total)}</Typography>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

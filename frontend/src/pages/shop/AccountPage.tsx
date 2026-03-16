import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../../api/endpoints";
import { LoadingState } from "../../components/common/LoadingState";
import { StatusChip } from "../../components/common/StatusChip";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/format";

export function AccountPage() {
  const { user } = useAuth();
  const ordersQuery = useQuery({
    queryKey: ["orders", "mine", "account"],
    queryFn: orderApi.mine
  });

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">My account</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {user?.fullName} • {user?.email} • {user?.mobileNumber}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent orders
        </Typography>
        {ordersQuery.isLoading ? <LoadingState message="Loading your orders..." /> : null}
        {ordersQuery.isError ? <Alert severity="error">Unable to load your order history.</Alert> : null}
        <Grid container spacing={2}>
          {ordersQuery.data?.slice(0, 3).map((order) => (
            <Grid key={order._id} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{order._id}</Typography>
                  <StatusChip status={order.status} />
                  <Typography color="text.secondary">{formatCurrency(order.total)}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
}


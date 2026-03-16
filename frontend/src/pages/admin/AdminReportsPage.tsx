import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "../../api/endpoints";
import { LoadingState } from "../../components/common/LoadingState";
import { formatCurrency } from "../../lib/format";

export function AdminReportsPage() {
  const dailySalesQuery = useQuery({
    queryKey: ["reports", "daily-sales"],
    queryFn: reportApi.dailySales
  });
  const monthlySalesQuery = useQuery({
    queryKey: ["reports", "monthly-sales"],
    queryFn: reportApi.monthlySales
  });
  const lowStockQuery = useQuery({
    queryKey: ["reports", "low-stock"],
    queryFn: reportApi.lowStock
  });
  const productPerformanceQuery = useQuery({
    queryKey: ["reports", "product-performance"],
    queryFn: reportApi.productPerformance
  });

  if (
    dailySalesQuery.isLoading ||
    monthlySalesQuery.isLoading ||
    lowStockQuery.isLoading ||
    productPerformanceQuery.isLoading
  ) {
    return <LoadingState message="Loading reports..." />;
  }

  if (
    dailySalesQuery.isError ||
    monthlySalesQuery.isError ||
    lowStockQuery.isError ||
    productPerformanceQuery.isError
  ) {
    return <Alert severity="error">Unable to load reports.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Reports and visibility</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Daily sales
            </Typography>
            <Stack spacing={1.5}>
              {dailySalesQuery.data?.slice(0, 5).map((entry, index) => (
                <Typography key={`daily-${index}`} color="text.secondary">
                  {String(entry.date)} • {String(entry.orderId)} • {formatCurrency(Number(entry.total ?? 0))}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly sales summary
            </Typography>
            <Stack spacing={1.5}>
              {monthlySalesQuery.data?.slice(0, 5).map((entry, index) => {
                const entryId = entry._id as { year?: number; month?: number } | undefined;
                return (
                  <Typography key={`monthly-${index}`} color="text.secondary">
                    {String(entryId?.month)}/{String(entryId?.year)} • Paid orders: {String(entry.paidOrders)} •
                    Revenue: {formatCurrency(Number(entry.totalSales ?? 0))}
                  </Typography>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Low-stock products
            </Typography>
            <Stack spacing={1.5}>
              {lowStockQuery.data?.map((product) => (
                <Typography key={product._id} color="text.secondary">
                  {product.name} • {product.stockQuantity} remaining • threshold {product.lowStockThreshold}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Product performance
            </Typography>
            <Stack spacing={1.5}>
              {productPerformanceQuery.data?.slice(0, 5).map((entry, index) => (
                <Typography key={`performance-${index}`} color="text.secondary">
                  {String(entry._id)} • Qty sold: {String(entry.quantitySold)} • Revenue:{" "}
                  {formatCurrency(Number(entry.revenueContribution ?? 0))}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}


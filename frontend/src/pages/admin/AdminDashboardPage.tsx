import { Alert, Grid, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/endpoints";
import { MetricCard } from "../../components/admin/MetricCard";
import { LoadingState } from "../../components/common/LoadingState";
import { formatCurrency, formatDate } from "../../lib/format";

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard
  });

  const auditLogsQuery = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: adminApi.auditLogs
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <Alert severity="error">Unable to load admin dashboard.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">DermEase operations overview</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Active products" value={dashboardQuery.data.totalProducts} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Pending orders" value={dashboardQuery.data.pendingOrders} tone="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Low-stock items" value={dashboardQuery.data.lowStockItems} tone="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard label="Paid revenue" value={formatCurrency(dashboardQuery.data.totalRevenue)} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent audit visibility
        </Typography>
        <Stack spacing={1.5}>
          {auditLogsQuery.data?.slice(0, 6).map((log) => (
            <Paper key={log._id} variant="outlined" sx={{ p: 2 }}>
              <Typography fontWeight={700}>{log.action}</Typography>
              <Typography color="text.secondary">{log.summary}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(log.createdAt)}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}


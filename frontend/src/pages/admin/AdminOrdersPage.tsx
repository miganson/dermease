import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { LoadingState } from "../../components/common/LoadingState";
import { StatusChip } from "../../components/common/StatusChip";
import { formatCurrency, formatDate } from "../../lib/format";
import { orderStatusLabels } from "../../lib/constants";
import { queryClient } from "../../lib/queryClient";
import type { Order } from "../../types/domain";

const schema = z.object({
  status: z.enum(["pending_payment", "paid", "packed", "shipped", "completed", "cancelled"]),
  note: z.string().min(4)
});

type OrderForm = z.infer<typeof schema>;

export function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.orders
  });

  const { control, handleSubmit, reset } = useForm<OrderForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "packed",
      note: "Order status updated by admin."
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: OrderForm) =>
      selectedOrder ? adminApi.updateOrderStatus(selectedOrder._id, values.status, values.note) : null,
    onSuccess: () => {
      setSelectedOrder(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["orders", "mine"] });
    }
  });

  function openDialog(order: Order) {
    setSelectedOrder(order);
    reset({
      status: order.status,
      note: "Order status updated by admin."
    });
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Order management</Typography>

      {ordersQuery.isLoading ? <LoadingState message="Loading admin orders..." /> : null}
      {ordersQuery.isError ? <Alert severity="error">Unable to load orders.</Alert> : null}

      <Stack spacing={2}>
        {ordersQuery.data?.map((order) => (
          <Paper key={order._id} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                <div>
                  <Typography variant="h6">{order._id}</Typography>
                  <Typography color="text.secondary">Placed {formatDate(order.createdAt)}</Typography>
                </div>
                <Stack direction="row" spacing={1}>
                  <StatusChip status={order.status} />
                  <StatusChip status={order.paymentStatus} kind="payment" />
                </Stack>
              </Stack>
              <Typography color="text.secondary">
                Recipient: {order.recipientName} • {order.contactNumber}
              </Typography>
              <Typography>Total: {formatCurrency(order.total)}</Typography>
              <Button variant="outlined" onClick={() => openDialog(order)} sx={{ alignSelf: "flex-start" }}>
                Update status
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm">
        <DialogTitle>Update order status</DialogTitle>
        <DialogContent>
          <form
            onSubmit={handleSubmit(async (values) => {
              await mutation.mutateAsync(values);
            })}
          >
            <Stack spacing={2} sx={{ pt: 1 }}>
              {mutation.isError ? <Alert severity="error">Unable to update order status.</Alert> : null}
              <FormTextField control={control} name="status" label="Status" select fullWidth>
                {Object.entries(orderStatusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </FormTextField>
              <FormTextField control={control} name="note" label="Admin note" fullWidth multiline minRows={3} />
              <Button type="submit" variant="contained" disabled={mutation.isPending}>
                Save status
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}


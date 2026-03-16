import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { orderApi, paymentApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../lib/format";
import { paymentMethods } from "../../lib/constants";

const schema = z.object({
  recipientName: z.string().min(2),
  contactNumber: z.string().min(7),
  deliveryAddress: z.string().min(10),
  paymentMethod: z.enum(["gcash", "bank_transfer", "card"]),
  notes: z.string().optional()
});

type CheckoutForm = z.infer<typeof schema>;

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setError
  } = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipientName: user?.fullName ?? "",
      contactNumber: user?.mobileNumber ?? "",
      deliveryAddress: "",
      paymentMethod: "gcash",
      notes: ""
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async (values: CheckoutForm) => {
      const order = await orderApi.create({
        ...values,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });

      const paymentSession = await paymentApi.createSession(order._id);

      return { order, paymentSession };
    },
    onSuccess: ({ order, paymentSession }) => {
      clearCart();
      navigate(`/payment/${paymentSession.transactionId}?orderId=${order._id}`, {
        state: {
          order,
          paymentSession
        }
      });
    }
  });

  async function onSubmit(values: CheckoutForm) {
    if (!items.length) {
      setError("deliveryAddress", {
        type: "manual",
        message: "Your cart is empty"
      });
      return;
    }

    await checkoutMutation.mutateAsync(values);
  }

  return (
    <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
      <Paper sx={{ p: 3, flex: 1 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Checkout</Typography>
          <Typography color="text.secondary">
            Confirm your delivery details, payment method, and order summary before placing the order.
          </Typography>
          {checkoutMutation.isError ? (
            <Alert severity="error">
              {checkoutMutation.error instanceof Error
                ? checkoutMutation.error.message
                : "Unable to create order"}
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <FormTextField control={control} name="recipientName" label="Recipient name" fullWidth />
              <FormTextField control={control} name="contactNumber" label="Contact number" fullWidth />
              <FormTextField
                control={control}
                name="deliveryAddress"
                label="Delivery address"
                fullWidth
                multiline
                minRows={3}
              />
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={Boolean(fieldState.error)}>
                    <InputLabel>Payment method</InputLabel>
                    <Select {...field} label="Payment method">
                      {paymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                  </FormControl>
                )}
              />
              <FormTextField control={control} name="notes" label="Order notes" fullWidth multiline minRows={3} />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                Place order and continue to payment
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, width: { xs: "100%", lg: 360 }, alignSelf: "flex-start" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Order summary
        </Typography>
        <Stack spacing={1.5}>
          {items.map((item) => (
            <Stack key={item.productId} direction="row" justifyContent="space-between">
              <Typography color="text.secondary">
                {item.name} x{item.quantity}
              </Typography>
              <Typography>{formatCurrency(item.price * item.quantity)}</Typography>
            </Stack>
          ))}
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Shipping</Typography>
            <Typography>{formatCurrency(60)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">{formatCurrency(subtotal + 60)}</Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}


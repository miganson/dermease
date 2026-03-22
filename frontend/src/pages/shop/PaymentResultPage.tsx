import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { paymentApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { paymentMethods, DEMO_PAYMENT_MODE } from "../../lib/constants";
import { formatCurrency } from "../../lib/format";
import { queryClient } from "../../lib/queryClient";
import { fullNameMessage, fullNameRegex } from "../../lib/validation";

const cardSchema = z.object({
  cardholderName: z.string().trim().min(2).regex(fullNameRegex, fullNameMessage),
  cardNumber: z
    .string()
    .regex(/^(4\d{15}|5[1-5]\d{14})$/, "Only Visa or Mastercard 16-digit card numbers are accepted."),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Use MM format."),
  expiryYear: z.string().regex(/^\d{2}$/, "Use YY format."),
  cvc: z.string().regex(/^\d{3,4}$/, "Use a 3 or 4 digit security code.")
});

type CardForm = z.infer<typeof cardSchema>;

function detectCardNetwork(cardNumber: string) {
  if (cardNumber.startsWith("4")) {
    return "Visa";
  }

  if (/^5[1-5]/.test(cardNumber)) {
    return "Mastercard";
  }

  return null;
}

export function PaymentResultPage() {
  const { transactionId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    order?: { _id: string; total: number; paymentMethod?: "gcash" | "bank_transfer" | "card" };
    paymentSession?: {
      reference: string;
      amount: number;
      method?: "gcash" | "bank_transfer" | "card";
    };
  } | null;

  const paymentMethod =
    state?.paymentSession?.method ?? state?.order?.paymentMethod ?? searchParams.get("method") ?? "gcash";

  const [gatewayMeta, setGatewayMeta] = useState<{
    cardNetwork?: "Visa" | "Mastercard";
    cardLast4?: string;
    gatewayLabel?: string;
    cardholderName?: string;
  }>();

  const { control, handleSubmit, watch, formState } = useForm<CardForm>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: ""
    }
  });

  const cardNumber = watch("cardNumber");
  const cardNetwork = useMemo(() => detectCardNetwork(cardNumber ?? ""), [cardNumber]);

  const completionMutation = useMutation({
    mutationFn: (outcome: "success" | "failed") => paymentApi.complete(transactionId, outcome, gatewayMeta),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      ]);
    }
  });

  const paymentLabel =
    paymentMethods.find((method) => method.value === paymentMethod)?.label ?? "Payment";

  return (
    <Paper sx={{ maxWidth: 760, mx: "auto", p: 4 }}>
      <Stack spacing={2.5}>
        <Typography variant="h4">Mock payment gateway</Typography>
        <Typography color="text.secondary">
          This project uses a demo payment flow. It stores payment activity and order status without charging a
          real card or wallet.
        </Typography>

        <Alert severity="info">
          Payment mode: {DEMO_PAYMENT_MODE}. Method: {paymentLabel}. Reference:{" "}
          {state?.paymentSession?.reference ?? searchParams.get("orderId") ?? "N/A"}
        </Alert>

        <Typography>
          Amount due: {formatCurrency(state?.paymentSession?.amount ?? state?.order?.total ?? 0)}
        </Typography>

        {paymentMethod === "card" && !gatewayMeta ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CreditCardOutlinedIcon color="primary" />
                <Typography variant="h6">Debit / Credit card details</Typography>
              </Stack>
              <Typography color="text.secondary">
                Enter a mock Visa or Mastercard number. The next step simulates redirecting to the selected card
                network.
              </Typography>
              <form
                onSubmit={handleSubmit(async (values) => {
                  const network = detectCardNetwork(values.cardNumber);
                  if (!network) {
                    return;
                  }

                  setGatewayMeta({
                    cardNetwork: network,
                    cardLast4: values.cardNumber.slice(-4),
                    gatewayLabel: network === "Visa" ? "Visa Secure" : "Mastercard Identity Check",
                    cardholderName: values.cardholderName
                  });
                })}
              >
                <Stack spacing={2}>
                  <FormTextField control={control} name="cardholderName" label="Cardholder name" fullWidth />
                  <FormTextField
                    control={control}
                    name="cardNumber"
                    label="Card number"
                    fullWidth
                    helperText="Use a Visa number starting with 4 or a Mastercard number starting with 51-55."
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FormTextField control={control} name="expiryMonth" label="Expiry month (MM)" fullWidth />
                    <FormTextField control={control} name="expiryYear" label="Expiry year (YY)" fullWidth />
                    <FormTextField control={control} name="cvc" label="CVC" fullWidth />
                  </Stack>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LockOutlinedIcon />}
                    disabled={formState.isSubmitting || !cardNetwork}
                  >
                    Continue to {cardNetwork ?? "card network"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        ) : null}

        {paymentMethod !== "card" || gatewayMeta ? (
          <>
            {gatewayMeta ? (
              <Alert severity="info">
                Redirected to mock {gatewayMeta.gatewayLabel}. Card ending in {gatewayMeta.cardLast4} is ready
                for simulated authorization.
              </Alert>
            ) : null}

            {completionMutation.isError ? (
              <Alert severity="error">
                {completionMutation.error instanceof Error
                  ? completionMutation.error.message
                  : "Unable to update payment"}
              </Alert>
            ) : null}

            {completionMutation.isSuccess ? (
              <Alert severity="success">
                Payment status updated. If the payment failed, stock was restored automatically.
              </Alert>
            ) : null}

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircleOutlineRoundedIcon />}
                onClick={() => completionMutation.mutate("success")}
                disabled={completionMutation.isPending}
              >
                Simulate success
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ErrorOutlineRoundedIcon />}
                onClick={() => completionMutation.mutate("failed")}
                disabled={completionMutation.isPending}
              >
                Simulate failure
              </Button>
              <Button variant="text" onClick={() => navigate("/orders")}>
                View my orders
              </Button>
            </Stack>
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}

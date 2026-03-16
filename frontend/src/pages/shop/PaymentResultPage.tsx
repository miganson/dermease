import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { paymentApi } from "../../api/endpoints";
import { DEMO_PAYMENT_MODE } from "../../lib/constants";
import { formatCurrency } from "../../lib/format";

export function PaymentResultPage() {
  const { transactionId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    order?: { _id: string; total: number };
    paymentSession?: { reference: string; amount: number };
  } | null;

  const completionMutation = useMutation({
    mutationFn: (outcome: "success" | "failed") => paymentApi.complete(transactionId, outcome)
  });

  return (
    <Paper sx={{ maxWidth: 700, mx: "auto", p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Demo payment confirmation</Typography>
        <Typography color="text.secondary">
          DermEase uses a gateway-ready mock flow in this build. Use the buttons below to simulate a
          payment outcome and update the linked order status.
        </Typography>
        <Alert severity="info">
          Payment mode: {DEMO_PAYMENT_MODE}. Order reference:{" "}
          {state?.paymentSession?.reference ?? searchParams.get("orderId") ?? "N/A"}
        </Alert>
        <Typography>
          Amount due: {formatCurrency(state?.paymentSession?.amount ?? state?.order?.total ?? 0)}
        </Typography>
        {completionMutation.isError ? (
          <Alert severity="error">
            {completionMutation.error instanceof Error
              ? completionMutation.error.message
              : "Unable to update payment"}
          </Alert>
        ) : null}
        {completionMutation.isSuccess ? (
          <Alert severity="success">Payment status updated. You can now review the order in your account.</Alert>
        ) : null}
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
      </Stack>
    </Paper>
  );
}


import { Chip } from "@mui/material";
import { orderStatusLabels } from "../../lib/constants";
import type { OrderStatus, PaymentStatus } from "../../types/domain";

export function StatusChip({
  status,
  kind = "order"
}: {
  status: OrderStatus | PaymentStatus;
  kind?: "order" | "payment";
}) {
  const colorMap: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
    pending_payment: "warning",
    paid: "success",
    packed: "info",
    shipped: "info",
    completed: "success",
    cancelled: "error",
    pending: "warning",
    failed: "error",
    refunded: "default"
  };

  const label =
    kind === "order"
      ? orderStatusLabels[status] ?? status
      : status.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());

  return <Chip label={label} color={colorMap[status] ?? "default"} size="small" />;
}


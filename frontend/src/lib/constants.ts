import type { PaymentMethod, ProductCategory } from "../types/domain";

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "DermEase Online";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
export const DEMO_PAYMENT_MODE = import.meta.env.VITE_DEMO_PAYMENT_MODE ?? "mock_gateway";

export const productCategories: { value: ProductCategory; label: string }[] = [
  { value: "cleanser", label: "Cleanser" },
  { value: "toner", label: "Toner" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "serum", label: "Serum" },
  { value: "sunscreen", label: "Sunscreen" },
  { value: "acne_care", label: "Acne Care" },
  { value: "gift_bundle", label: "Gift Bundle" }
];

export const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "gcash", label: "GCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" }
];

export const orderStatusLabels: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  packed: "Packed",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled"
};


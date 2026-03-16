export const USER_ROLES = ["customer", "admin"] as const;
export const PRODUCT_CATEGORIES = [
  "cleanser",
  "toner",
  "moisturizer",
  "serum",
  "sunscreen",
  "acne_care",
  "gift_bundle"
] as const;
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "packed",
  "shipped",
  "completed",
  "cancelled"
] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export const PAYMENT_METHODS = ["gcash", "bank_transfer", "card"] as const;
export const INVENTORY_ADJUSTMENT_TYPES = [
  "order_hold",
  "manual_add",
  "manual_remove",
  "cancel_restore"
] as const;
export const PAYMENT_PROVIDER = "mock_gateway";

export type UserRole = (typeof USER_ROLES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type InventoryAdjustmentType = (typeof INVENTORY_ADJUSTMENT_TYPES)[number];


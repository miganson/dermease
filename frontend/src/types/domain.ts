export type UserRole = "customer" | "admin";
export type ProductCategory =
  | "cleanser"
  | "toner"
  | "moisturizer"
  | "serum"
  | "sunscreen"
  | "acne_care"
  | "gift_bundle";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "packed"
  | "shipped"
  | "completed"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "gcash" | "bank_transfer" | "card";

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: UserRole;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  imagePublicId?: string;
  tags: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
  quantity: number;
}

export interface OrderItem {
  product: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  note: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  customer: string;
  items: OrderItem[];
  recipientName: string;
  contactNumber: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  placedAt: string;
  statusHistory: OrderStatusHistory[];
  createdAt?: string;
}

export interface PaymentSession {
  transactionId: string;
  gatewaySessionId: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
}

export interface DashboardSummary {
  totalProducts: number;
  pendingOrders: number;
  lowStockItems: number;
  totalRevenue: number;
}

export interface InventoryAdjustment {
  _id: string;
  quantity: number;
  remarks: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
}


import { apiRequest } from "./client";
import type {
  AuditLog,
  AuthSession,
  DashboardSummary,
  Order,
  PaymentSession,
  Product,
  User
} from "../types/domain";

export const authApi = {
  register: (payload: { fullName: string; email: string; mobileNumber: string; password: string }) =>
    apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload)
    }),
  me: () => apiRequest<User>("/auth/me"),
  logout: () =>
    apiRequest<null>("/auth/logout", {
      method: "POST"
    })
};

export const productApi = {
  list: (search = "", category = "") =>
    apiRequest<Product[]>(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`, {
      auth: false
    }),
  get: (identifier: string) => apiRequest<Product>(`/products/${identifier}`, { auth: false }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiRequest<{ secure_url: string; public_id: string }>("/products/upload-image", {
      method: "POST",
      body: formData
    });
  },
  create: (payload: Partial<Product>) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  update: (productId: string, payload: Partial<Product>) =>
    apiRequest<Product>(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),
  remove: (productId: string) =>
    apiRequest<null>(`/products/${productId}`, {
      method: "DELETE"
    })
};

export const orderApi = {
  create: (payload: Record<string, unknown>) =>
    apiRequest<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  mine: () => apiRequest<Order[]>("/orders/my"),
  one: (orderId: string) => apiRequest<Order>(`/orders/my/${orderId}`)
};

export const paymentApi = {
  createSession: (orderId: string) =>
    apiRequest<PaymentSession>("/payments/session", {
      method: "POST",
      body: JSON.stringify({ orderId })
    }),
  complete: (transactionId: string, outcome: "success" | "failed") =>
    apiRequest<Record<string, unknown>>(`/payments/${transactionId}/complete`, {
      method: "POST",
      body: JSON.stringify({ outcome })
    })
};

export const adminApi = {
  dashboard: () => apiRequest<DashboardSummary>("/admin/dashboard"),
  orders: () => apiRequest<Order[]>("/admin/orders"),
  updateOrderStatus: (orderId: string, status: string, note: string) =>
    apiRequest<Order>(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note })
    }),
  inventory: () => apiRequest<Product[]>("/admin/inventory"),
  adjustStock: (payload: { productId: string; adjustment: number; remarks: string }) =>
    apiRequest<unknown>("/admin/inventory/adjustments", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  payments: () => apiRequest<Record<string, unknown>[]>("/admin/payments"),
  auditLogs: () => apiRequest<AuditLog[]>("/admin/audit-logs")
};

export const reportApi = {
  dailySales: () => apiRequest<Record<string, unknown>[]>("/reports/daily-sales"),
  monthlySales: () => apiRequest<Record<string, unknown>[]>("/reports/monthly-sales"),
  inventoryStatus: () => apiRequest<Product[]>("/reports/inventory-status"),
  lowStock: () => apiRequest<Product[]>("/reports/low-stock"),
  orderStatus: () => apiRequest<Record<string, unknown>[]>("/reports/order-status"),
  paymentSummary: () => apiRequest<Record<string, unknown>[]>("/reports/payment-summary"),
  productPerformance: () => apiRequest<Record<string, unknown>[]>("/reports/product-performance")
};

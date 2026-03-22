import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminRoute, ProtectedRoute } from "./components/common/RouteGuards";
import { HomePage } from "./pages/shop/HomePage";
import { ProductDetailsPage } from "./pages/shop/ProductDetailsPage";
import { CartPage } from "./pages/shop/CartPage";
import { CheckoutPage } from "./pages/shop/CheckoutPage";
import { PaymentResultPage } from "./pages/shop/PaymentResultPage";
import { AccountPage } from "./pages/shop/AccountPage";
import { OrderTrackingPage } from "./pages/shop/OrderTrackingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminInventoryPage } from "./pages/admin/AdminInventoryPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/products/:identifier" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:transactionId" element={<PaymentResultPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<OrderTrackingPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

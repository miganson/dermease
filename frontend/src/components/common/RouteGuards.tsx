import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "./LoadingState";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading admin access..." />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}


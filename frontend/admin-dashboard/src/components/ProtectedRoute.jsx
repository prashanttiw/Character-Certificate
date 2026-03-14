import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/features/auth/context/AdminAuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-ring" />
        <p className="muted-copy">Checking admin session...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

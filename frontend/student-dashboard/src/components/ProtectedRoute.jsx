import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-1)]">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-16 animate-spin rounded-full border-4 border-[var(--brand-1)]/20 border-t-[var(--brand-1)]" />
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--ink-3)]">
            Checking session
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

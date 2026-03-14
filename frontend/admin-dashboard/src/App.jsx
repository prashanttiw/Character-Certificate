import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAdminAuth } from "./features/auth/context/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthShell from "./layouts/AuthShell";
import AdminShell from "./layouts/AdminShell";
import LoginPage from "./features/auth/pages/LoginPage";
import AuditTrailPage from "./features/logs/pages/AuditTrailPage";

function HomeRedirect() {
  const { isAuthenticated } = useAdminAuth();
  return <Navigate to={isAuthenticated ? "/logs" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthShell>
              <LoginPage />
            </AuthShell>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <AdminShell>
                <AuditTrailPage />
              </AdminShell>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { adminAuthApi } from "../services/auth";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const storedAdmin = adminAuthApi.getCurrentAdmin();

    if (token && storedAdmin) {
      setAdmin(storedAdmin);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await adminAuthApi.login(email, password);
    setAdmin(response.admin);
    return response;
  };

  const logout = () => {
    adminAuthApi.logout();
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      login,
      logout,
    }),
    [admin, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

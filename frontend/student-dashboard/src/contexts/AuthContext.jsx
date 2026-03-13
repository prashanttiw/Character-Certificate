import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = authAPI.getCurrentUser();

    if (token && userData) {
      setUser(userData);
    }

    setLoading(false);
  }, []);

  const login = async (emailOrRollNo, password) => {
    const response = await authAPI.login(emailOrRollNo, password);
    setUser(response.student);
    return response;
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      loading,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

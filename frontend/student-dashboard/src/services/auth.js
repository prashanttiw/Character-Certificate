import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  sendRegistrationOtp: async (userData) => {
    const response = await api.post("/auth/register/send-otp", userData);
    return response.data;
  },

  verifyRegistrationOtp: async (email, otp) => {
    const response = await api.post("/auth/register/verify-otp", { email, otp });
    return response.data;
  },

  login: async (emailOrRollNo, password) => {
    const response = await api.post("/auth/login", { emailOrRollNo, password });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.student));
    }

    return response.data;
  },

  sendForgotPasswordOtp: async (email) => {
    const response = await api.post("/auth/forgot-password/send-otp", { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post("/auth/forgot-password/verify-otp", {
      email,
      otp,
      newPassword,
    });

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => Boolean(localStorage.getItem("token")),
};

export default api;

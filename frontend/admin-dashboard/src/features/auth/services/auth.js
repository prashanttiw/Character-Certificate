import api from "@/lib/api";

export const adminAuthApi = {
  login: async (email, password) => {
    const response = await api.post("/admin/auth/login", { email, password });

    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.admin));
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },

  getCurrentAdmin: () => {
    const admin = localStorage.getItem("adminUser");
    return admin ? JSON.parse(admin) : null;
  },
};

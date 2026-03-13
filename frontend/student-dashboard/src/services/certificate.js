import api from "./auth";

export const certificateAPI = {
  apply: async (formData) => {
    const response = await api.post("/student/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  updateDraft: async (formData) => {
    const response = await api.put("/student/edit", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  submitApplication: async () => {
    const response = await api.post("/student/submit-latest");
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get("/student/status");
    return response.data;
  },
};

export const studentAPI = {
  getDashboard: async () => {
    const response = await api.get("/student/dashboard");
    return response.data;
  },
};

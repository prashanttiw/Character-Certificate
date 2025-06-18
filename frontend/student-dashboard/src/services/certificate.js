import api from './auth.js';

// Certificate API functions
export const certificateAPI = {
  // Apply for certificate with files
  apply: async (formData) => {
    const response = await api.post('/certificates/apply', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Save as draft
  saveAsDraft: async (formData) => {
    const response = await api.post('/certificates/save-draft', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update draft application
  updateDraft: async (formData) => {
    const response = await api.put('/certificates/update-draft', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Submit application (final submission)
  submitApplication: async () => {
    const response = await api.post('/certificates/submit-final');
    return response.data;
  },

  // Get application status
  getStatus: async () => {
    const response = await api.get('/certificates/status');
    return response.data;
  },

  // Verify certificate by ID (public endpoint)
  verifyCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/download/${certificateId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Student API functions
export const studentAPI = {
  // Get student dashboard data
  getDashboard: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },

  // Send OTP for profile editing
  sendEditOTP: async (password) => {
    const response = await api.post('/profile/send-edit-otp', { password });
    return response.data;
  },

  // Verify OTP and update profile
  verifyEditOTP: async (otp, updatedData) => {
    const response = await api.post('/profile/verify-edit-otp', { 
      otp, 
      ...updatedData 
    });
    return response.data;
  },
};

import api from './api';

export const adminService = {
  getAnalyticsOverview: async () => {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  getDepartmentAnalytics: async () => {
    const response = await api.get('/admin/analytics/department');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },
};

export default adminService;

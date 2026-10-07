import api from './api';

export const applicationService = {
  apply: async (opportunityId) => {
    const response = await api.post(`/applications/${opportunityId}`);
    return response.data;
  },

  withdraw: async (id) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/mine');
    return response.data;
  },

  getReceivedApplications: async (params = {}) => {
    const response = await api.get('/applications/received', { params });
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.put(`/applications/${id}/status`, statusData);
    return response.data;
  },
};

export default applicationService;

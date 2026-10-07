import api from './api';

export const opportunityService = {
  getOpportunities: async (params = {}) => {
    const response = await api.get('/opportunities', { params });
    return response.data;
  },

  getOpportunityById: async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  getMyOpportunities: async () => {
    const response = await api.get('/opportunities/mine');
    return response.data;
  },

  createOpportunity: async (opportunityData) => {
    const response = await api.post('/opportunities', opportunityData);
    return response.data;
  },

  updateOpportunity: async (id, opportunityData) => {
    const response = await api.put(`/opportunities/${id}`, opportunityData);
    return response.data;
  },

  deleteOpportunity: async (id) => {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
  },
};

export default opportunityService;

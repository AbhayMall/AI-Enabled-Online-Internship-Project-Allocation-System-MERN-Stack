import api from './api';

export const matchService = {
  getRecommendations: async () => {
    const response = await api.get('/match/recommendations');
    return response.data;
  },
};

export default matchService;

import api from './api';

export const facultyService = {
  getProfile: async () => {
    const response = await api.get('/faculty/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/faculty/profile', profileData);
    return response.data;
  },
};

export default facultyService;

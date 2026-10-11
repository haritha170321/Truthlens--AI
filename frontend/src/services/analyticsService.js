import api from './api';

export const getAnalyticsData = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

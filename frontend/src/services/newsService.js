import api from './api';

export const analyzeTextNews = async (data) => {
  const response = await api.post('/news/analyze', data);
  return response.data;
};

export const analyzeUrlNews = async (url) => {
  const response = await api.post('/news/analyze-url', { url });
  return response.data;
};

export const analyzeImageNews = async (formData) => {
  const response = await api.post('/news/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzePdfNews = async (formData) => {
  const response = await api.post('/news/analyze-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getNewsHistory = async (params = {}) => {
  const response = await api.get('/news/history', { params });
  return response.data;
};

export const getAnalysisDetails = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const deleteAnalysisRecord = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};

export const clearAllNewsHistory = async () => {
  const response = await api.delete('/news/history/clear');
  return response.data;
};

export const getDemoCases = async () => {
  const response = await api.get('/news/demo-cases');
  return response.data;
};

export const getSavedArticles = async () => {
  const response = await api.get('/saved');
  return response.data;
};

export const saveArticle = async (data) => {
  const response = await api.post('/saved', data);
  return response.data;
};

export const deleteSavedArticle = async (id) => {
  const response = await api.delete(`/saved/${id}`);
  return response.data;
};

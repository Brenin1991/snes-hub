import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
      localStorage.removeItem('current_user');
      // Não redirecionar para /login, apenas limpar o localStorage
      // O App.js vai detectar que não há usuário e mostrar a seleção
    }
    return Promise.reject(error);
  }
);

// Users API
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = (formData) => api.post('/users', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const updateUser = (id, formData) => api.put(`/users/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const deleteUser = (id) => api.delete(`/users/${id}`).then(res => res.data);

export const loginUser = (id) => api.post(`/users/${id}/login`).then(res => res.data);

export const logoutUser = () => api.post('/users/logout').then(res => res.data);

export const getCurrentUser = () => api.get('/users/me').then(res => res.data);

// Games API
export const getGames = async () => {
  try {
    const response = await api.get('/games');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { data: [] };
  }
};

export const getGameById = async (id) => {
  try {
    const response = await api.get(`/games/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
};
export const createGame = (formData) => api.post('/games', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const updateGame = (id, formData) => api.put(`/games/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const deleteGame = (id) => api.delete(`/games/${id}`).then(res => res.data);
export const playGame = (id) => api.post(`/games/${id}/play`).then(res => res.data);
export const toggleFavorite = (id) => api.post(`/games/${id}/favorite`).then(res => res.data);

// Screenshots API
export const getGameScreenshots = async (id) => {
  try {
    const response = await api.get(`/games/${id}/screenshots`);
    return response.data;
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return [];
  }
};

export default api;

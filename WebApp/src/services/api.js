import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const checkApiStatus = () => {
  return api.get('/');
};

export const authService = {
  register: (userData) => api.post('/api/auth/register/', userData),
  login: (credentials) => api.post('/api/auth/token/', credentials),
  refreshToken: (refresh) => api.post('/api/auth/token/refresh/', { refresh }),
};

// Book services
export const bookService = {
  getAll: (params) => api.get('/api/books/', { params }),
  getById: (id) => api.get(`/api/books/${id}/`),
  create: (data) => api.post('/api/books/', data),
  update: (id, data) => api.put(`/api/books/${id}/`, data),
  delete: (id) => api.delete(`/api/books/${id}/`),
};

// Movie services
export const movieService = {
  getAll: (params) => api.get('/api/movies/', { params }),
  getById: (id) => api.get(`/api/movies/${id}/`),
  create: (data) => api.post('/api/movies/', data),
  update: (id, data) => api.put(`/api/movies/${id}/`, data),
  delete: (id) => api.delete(`/api/movies/${id}/`),
};

// Review services
export const reviewService = {
  getAll: (params) => api.get('/api/reviews/', { params }),
  getById: (id) => api.get(`/api/reviews/${id}/`),
  create: (data) => api.post('/api/reviews/', data),
  update: (id, data) => api.put(`/api/reviews/${id}/`, data),
  delete: (id) => api.delete(`/api/reviews/${id}/`),
};

export default api; 
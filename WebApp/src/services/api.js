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
    const publicEndpoints = ['/api/books/', '/api/movies/', '/api/auth/register/', '/api/auth/token/'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.startsWith(endpoint) && (
        config.method === 'get' || 
        config.method === 'post' || 
        !config.method
      )
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('access_token', response.data.access);
        
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export const checkApiStatus = () => {
  return api.get('/');
};

export const authService = {
  register: (userData) => {
    const formattedData = {
      username: userData.name || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password,
      password_confirm: userData.confirmPassword
    };
    console.log('Sending registration data:', formattedData);
    return api.post('/api/auth/register/', formattedData);
  },
  login: (credentials) => {
    const storedUsername = localStorage.getItem('username');
    const loginData = {
      username: storedUsername || credentials.email.split('@')[0],
      password: credentials.password,
    };
    console.log('Sending login data:', loginData);
    return api.post('/api/auth/token/', loginData);
  },
  refreshToken: (refresh) => api.post('/api/auth/token/refresh/', { refresh }),
};

// Book services
export const bookService = {
  getAll: (params) => api.get('/api/books/', { params }),
  getAllPaginated: (page = 1, limit = 100) => 
    api.get('/api/books/', { params: { page, limit } }),
  getById: (id) => api.get(`/api/books/${id}/`),
  create: (data) => api.post('/api/books/', data),
  update: (id, data) => api.put(`/api/books/${id}/`, data),
  delete: (id) => api.delete(`/api/books/${id}/`),
};

// Movie services
export const movieService = {
  getAll: (params) => api.get('/api/movies/', { params }),
  getAllPaginated: (page = 1, limit = 100) => 
    api.get('/api/movies/', { params: { page, limit } }),
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
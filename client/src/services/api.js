import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // In dev, default to backend port 5000; can override via REACT_APP_API_URL
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend expects Authorization: Bearer <token>
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/user');
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await api.post('/auth/change-password', passwords);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// Products API
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/${slug}`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get('/products/featured');
  return response.data;
};

export const getProductCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// News API
export const getNews = async (params = {}) => {
  const response = await api.get('/news', { params });
  return response.data;
};

// SEO Config API
export const getSeoConfig = async () => {
  const response = await api.get('/seo/config');
  return response.data;
};

export const saveSeoConfig = async (config) => {
  const response = await api.post('/seo/config', config);
  return response.data;
};

export const getNewsBySlug = async (slug) => {
  const response = await api.get(`/news/${slug}`);
  return response.data;
};

export const getFeaturedNews = async () => {
  const response = await api.get('/news/featured');
  return response.data;
};

export const createNews = async (newsData) => {
  const response = await api.post('/news', newsData);
  return response.data;
};

export const updateNews = async (id, newsData) => {
  const response = await api.put(`/news/${id}`, newsData);
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`/news/${id}`);
  return response.data;
};

// Contact API
export const submitContactForm = async (contactData) => {
  const response = await api.post('/contact', contactData);
  return response.data;
};

export const getContactInquiries = async (params = {}) => {
  const response = await api.get('/contact', { params });
  return response.data;
};

export const updateContactStatus = async (id, status) => {
  const response = await api.put(`/contact/${id}/status`, { status });
  return response.data;
};

export const respondToInquiry = async (id, responseData) => {
  const response = await api.put(`/contact/${id}/respond`, responseData);
  return response.data;
};

export const recallMessage = async (id, messageId) => {
  const response = await api.put(`/contact/${id}/messages/${messageId}/recall`);
  return response.data;
};

// Admin API
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// Admin products (all, includes drafts)
export const getAdminProducts = async () => {
  const response = await api.get('/admin/products');
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Admin Categories API
export const getAdminCategories = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/admin/categories/${id}`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/admin/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

export const getCategoryUsage = async (id) => {
  const response = await api.get(`/admin/categories/${id}/usage`);
  return response.data;
};

// File Upload API
export const uploadFile = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// SEO API
export const getSEOSettings = async () => {
  const response = await api.get('/seo/settings');
  return response.data;
};

export const updateSEOSettings = async (settings) => {
  const response = await api.put('/seo/settings', settings);
  return response.data;
};

export const generateSitemap = async () => {
  const response = await api.post('/seo/sitemap');
  return response.data;
};

// Analytics API
export const getAnalytics = async (params = {}) => {
  const response = await api.get('/analytics', { params });
  return response.data;
};

export const trackPageView = async (pageData) => {
  const response = await api.post('/analytics/pageview', pageData);
  return response.data;
};

// Search API
export const searchContent = async (query, params = {}) => {
  const response = await api.get('/search', { 
    params: { q: query, ...params } 
  });
  return response.data;
};

// Newsletter API
export const subscribeNewsletter = async (email) => {
  const response = await api.post('/newsletter/subscribe', { email });
  return response.data;
};

export const unsubscribeNewsletter = async (email) => {
  const response = await api.post('/newsletter/unsubscribe', { email });
  return response.data;
};

// Export default api instance
export default api;

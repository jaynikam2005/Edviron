import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error?.message || 'Request failed'));
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: unknown) => {
    // Handle 401 errors by redirecting to login
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
  },

  // User management
  users: {
    create: (userData: unknown) => api.post('/users', userData),
    getAll: () => api.get('/users'),
    getById: (id: string) => api.get(`/users/${id}`),
    delete: (id: string) => api.delete(`/users/${id}`),
  },

  // Payment processing
  payments: {
    create: (paymentData: { school_id: string; amount: number; callback_url: string }) =>
      api.post('/payment/create-payment', paymentData),
    getOrder: (orderId: string) => api.get(`/payment/order/${orderId}`),
    getSchoolOrders: (schoolId: string) => api.get(`/payment/orders/school/${schoolId}`),
  },

  // Webhook management
  webhooks: {
    getLogs: (limit?: number) => {
      const params = limit ? `?limit=${limit}` : '';
      return api.get(`/payment/webhook-logs${params}`);
    },
    getLogsByStatus: (status: string) => api.get(`/payment/webhook-logs/status/${status}`),
  },

  // Transaction APIs
  transactions: {
    getAll: (params?: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
      status?: string;
      payment_mode?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const query = queryParams.toString();
      const url = query ? `/transactions?${query}` : '/transactions';
      return api.get(url);
    },
    getBySchool: (schoolId: string, params?: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      const query = queryParams.toString();
      const url = query ? `/transactions/school/${schoolId}?${query}` : `/transactions/school/${schoolId}`;
      return api.get(url);
    },
    getStatus: (customOrderId: string) => api.get(`/transaction-status/${customOrderId}`),
  },
};

// Export the axios instance for custom requests
export default api;
import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://vigorously-more-impala.ngrok-free.app';

// Request monitoring
let requestCount = 0;
const requestLog: Array<{ url: string; timestamp: number; method: string }> = [];

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
  },
});

// Add request interceptor to monitor API calls
api.interceptors.request.use(
  (config) => {
    requestCount++;
    requestLog.push({
      url: `${config.method?.toUpperCase()} ${config.url}`,
      timestamp: Date.now(),
      method: config.method || 'unknown'
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request #${requestCount}] ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for monitoring
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

// API monitoring utilities
export const getRequestCount = () => requestCount;
export const getRequestLog = () => [...requestLog];
export const resetRequestCount = () => {
  requestCount = 0;
  requestLog.length = 0;
};

// Print request summary
export const printRequestSummary = () => {
  console.log('\n=== API Request Summary ===');
  console.log(`Total requests: ${requestCount}`);
  console.log('Recent requests:');
  requestLog.slice(-10).forEach((req, index) => {
    const time = new Date(req.timestamp).toLocaleTimeString();
    console.log(`  ${index + 1}. [${time}] ${req.url}`);
  });
  console.log('=========================\n');
};

// Auth API
export const authAPI = {
  buyerLogin: (credentials: { email: string; password: string }) =>
    api.post('/buyer/login', credentials),
  
  buyerSignUp: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post('/buyer/signUp', data),
  
  sellerLogin: (credentials: { email: string; password: string }) =>
    api.post('/seller/login', credentials),
  
  sellerSignUp: (data: { name: string; email: string; password: string; phone: string }) =>
    api.post('/seller/signUp', data),
};

// Buyer API
export const buyerAPI = {
  // Stores
  getStores: (params?: { limit?: number; sortBy?: string }) =>
    api.get('/buyer/stores', { params }),
  
  getStore: (storeId: string) =>
    api.get(`/buyer/stores/${storeId}`),
  
  // Products  
  getProducts: (params?: { category?: string; limit?: number; sortBy?: string }) =>
    api.get('/buyer/products', { params }),
  
  getProduct: (productId: string) =>
    api.get(`/buyer/products/${productId}`),
  
  // Cart
  getCart: (buyerId: string) =>
    api.get(`/buyer/cart/${buyerId}`),
  
  addToCart: (buyerId: string, data: { productId: string; quantity: number }) =>
    api.post(`/buyer/cart/${buyerId}/add`, data),
  
  updateCartQuantity: (buyerId: string, data: { productId: string; quantity: number }) =>
    api.put(`/buyer/cart/${buyerId}/quantity`, data),
  
  removeFromCart: (buyerId: string, data: { productId: string }) =>
    api.delete(`/buyer/cart/${buyerId}/remove`, { data }),
  
  clearCart: (buyerId: string) =>
    api.delete(`/buyer/cart/${buyerId}/clear`),
  
  // Orders
  getOrders: (buyerId: string) =>
    api.get(`/buyer/orders/${buyerId}`),
  
  createOrder: (buyerId: string, orderData: any) =>
    api.post(`/buyer/orders/${buyerId}`, orderData),
  
  getOrder: (buyerId: string, orderId: string) =>
    api.get(`/buyer/orders/${buyerId}/${orderId}`),
  
  cancelOrder: (buyerId: string, orderId: string) =>
    api.put(`/buyer/orders/${buyerId}/${orderId}/cancel`),
  
  trackOrder: (buyerId: string, orderId: string) =>
    api.get(`/buyer/orders/${buyerId}/${orderId}/track`),
  
  // Notifications
  getNotifications: (buyerId: string, params?: { limit?: number }) =>
    api.get(`/buyer/notifications/${buyerId}`, { params }),
  
  markNotificationRead: (buyerId: string, notificationId: string) =>
    api.put(`/buyer/notifications/${buyerId}/${notificationId}/read`),
  
  markAllNotificationsRead: (buyerId: string) =>
    api.put(`/buyer/notifications/${buyerId}/read-all`),
  
  deleteNotification: (buyerId: string, notificationId: string) =>
    api.delete(`/buyer/notifications/${buyerId}/${notificationId}`),
  
  // Coupons
  validateCoupon: (buyerId: string, couponCode: string) =>
    api.post(`/buyer/cart/${buyerId}/coupons/validate`, { couponCode }),
  
  applyCoupon: (buyerId: string, couponCode: string) =>
    api.post(`/buyer/cart/${buyerId}/coupons/apply`, { couponCode }),
  
  removeCoupon: (buyerId: string) =>
    api.delete(`/buyer/cart/${buyerId}/coupons/remove`),
};

// Seller API
export const sellerAPI = {
  // Dashboard
  getOrders: (sellerId: string, params?: { status?: string; limit?: number }) =>
    api.get(`/seller/orders/${sellerId}`, { params }),
  
  getInventory: (sellerId: string) =>
    api.get(`/seller/inventory/${sellerId}`),
  
  // Order Management
  updateOrderStatus: (storeId: string, orderId: string, status: string, data?: any) =>
    api.put(`/seller/orders/${storeId}/status/${orderId}`, { status, ...data }),
  
  // Inventory Management
  addProduct: (sellerId: string, productData: any) =>
    api.post(`/seller/inventory/${sellerId}`, productData),
  
  updateProduct: (sellerId: string, productId: string, productData: any) =>
    api.put(`/seller/inventory/${sellerId}/product/${productId}`, productData),
  
  deleteProduct: (sellerId: string, productId: string) =>
    api.delete(`/seller/inventory/${sellerId}/product/${productId}`),
  
  // Notifications
  getNotifications: (sellerId: string) =>
    api.get(`/seller/notifications/${sellerId}`),
  
  markNotificationRead: (sellerId: string, notificationId: string) =>
    api.put(`/seller/notifications/${sellerId}/notification/${notificationId}/read`),
  
  markAllNotificationsRead: (sellerId: string) =>
    api.put(`/seller/notifications/${sellerId}/read-all`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api; 
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://restaurant-api-02zg.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach admin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────
export const loginAdmin = (username, password) =>
  api.post('/auth/login', { username, password });

export const verifyToken = () => api.get('/auth/verify');

export const logoutAdmin = () => api.post('/auth/logout');

export const changePassword = (old_password, new_password) =>
  api.post('/auth/change-password', { old_password, new_password });

// ─── Menu ────────────────────────────────────────
export const getMenu = (availableOnly = true) =>
  api.get('/menu', { params: { available_only: availableOnly } });

export const getCategories = () => api.get('/menu/categories');

export const createMenuItem = (item) => api.post('/menu', item);

export const updateMenuItem = (id, data) => api.patch(`/menu/${id}`, data);

export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// ─── Orders ──────────────────────────────────────
export const createOrder = (order) => api.post('/orders', order);

export const getOrderByNumber = (orderNumber) =>
  api.get(`/orders/number/${orderNumber}`);

export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);

export const getOrders = (params = {}) => api.get('/orders', { params });

export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status });

// ─── Admin ───────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard');

export const getAdminOrders = (params = {}) =>
  api.get('/admin/orders', { params });

export const adminUpdateOrderStatus = (orderId, status, notes) =>
  api.put(`/admin/orders/${orderId}/status`, { status, notes });

export const getMenuStats = () => api.get('/admin/menu/stats');

// ─── Specials ────────────────────────────────────
export const getSpecials = (activeOnly = true) =>
  api.get('/specials', { params: { active_only: activeOnly } });

export const createSpecial = (data) => api.post('/specials', data);

export const updateSpecial = (id, data) => api.put(`/specials/${id}`, data);

export const deleteSpecial = (id) => api.delete(`/specials/${id}`);

export const toggleSpecial = (id) => api.patch(`/specials/${id}/toggle`);

// ─── Payment ─────────────────────────────────────
export const createRazorpayOrder = (data) =>
  api.post('/payment/create-razorpay-order', data);

export const verifyPayment = (data) =>
  api.post('/payment/verify-payment', data);

// ─── QR / Table ──────────────────────────────────
export const getTableInfo = (tableId) => api.get(`/qr/table/${tableId}`);

export default api;

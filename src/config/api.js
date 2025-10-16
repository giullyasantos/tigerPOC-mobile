// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tigerpoc-production.up.railway.app';

export const API_ENDPOINTS = {
  WORKER_AUTH: {
    LOGIN: `${API_BASE_URL}/api/worker-auth/login`,
    REFRESH: `${API_BASE_URL}/api/worker-auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/worker-auth/logout`,
  },
  WORK_ORDERS: {
    BASE: `${API_BASE_URL}/api/workorders`,
    BY_ID: (id) => `${API_BASE_URL}/api/workorders/${id}`,
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};

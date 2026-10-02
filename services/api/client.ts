import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, removeToken } from '../../src/utils/storage';

const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'https://api.coolieglobal.com/api';

const client = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: add token
client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized – clear token and redirect to login
      await removeToken();
      // We can dispatch a logout event if needed (via context)
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;
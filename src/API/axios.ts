import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const api = axios.create({
  baseURL: SERVER_URL, // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication (if needed)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('__token__');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
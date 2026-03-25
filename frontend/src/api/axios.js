import axios from 'axios';

// Instancia apuntando al API Gateway
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

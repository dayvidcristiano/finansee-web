import axios from "axios";

const localhost = 'http://localhost:8080/api'
const railway   = 'https://finansee-production.up.railway.app/api'

const apiClient = axios.create({
  baseURL: railway, 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem('authToken'); 
      
      window.location.href = '/login'; 
      
      alert('Sua sessão expirou. Por favor, faça login novamente.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
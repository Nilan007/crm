import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? "http://localhost:5000" : "https://crm-backend-w02x.onrender.com");

const instance = axios.create({
  baseURL: API_URL
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;

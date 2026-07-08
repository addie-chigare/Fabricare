import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

// Global interceptor for standard axios imports to redirect to our BASE_URL
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes("localhost:8000")) {
    config.url = config.url.replace(/https?:\/\/localhost:8000\/api\/v1/, BASE_URL);
    config.url = config.url.replace(/https?:\/\/localhost:8000/, `${window.location.protocol}//${window.location.hostname}:8000`);
  }
  
  // Also pass the Authorization token if present
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;

});

export const getProducts = () =>
  API.get("/products/public");

export const getProductById = (id) =>
  API.get(`/products/${id}`);

export default API;

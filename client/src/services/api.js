import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Global interceptor for standard axios imports to redirect to our BASE_URL
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("http://localhost:8000/api/v1")) {
    config.url = config.url.replace("http://localhost:8000/api/v1", BASE_URL);
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

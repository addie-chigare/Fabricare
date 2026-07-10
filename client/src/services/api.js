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

// Laundry Services API
// Customer APIs
export const getLaundryServices = () =>
  API.get("/laundry/services");

export const getLaundryPricing = () =>
  API.get("/laundry/pricing");

export const bookLaundryPickup = (orderData) =>
  API.post("/laundry/orders", orderData);

export const getLaundryOrders = () =>
  API.get("/laundry/orders");

export const cancelLaundryOrder = (id) =>
  API.put(`/laundry/orders/${id}/cancel`);

export const getLaundryOrderById = (id) =>
  API.get(`/laundry/orders/${id}`);

export const getCustomerSupport = () =>
  API.get("/laundry/support");

// Admin APIs
export const getAllLaundryOrders = () =>
  API.get("/admin/laundry/orders");

export const updateOrderStatus = (id, statusData) =>
  API.put(`/admin/laundry/orders/${id}/status`, statusData);

export const updateLaundryPricing = (pricingData) =>
  API.put("/admin/laundry/pricing", pricingData);

export const getLaundryStats = () =>
  API.get("/admin/laundry/stats");

export default API;

import axios from "axios";

export const BASE_URL = "http://localhost:8000/api/v1";

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

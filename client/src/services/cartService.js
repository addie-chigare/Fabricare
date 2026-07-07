import axios from "axios";

import { BASE_URL } from "./api";

const API = `${BASE_URL}/cart`;

const getToken = () => localStorage.getItem("token");


// ADD TO CART
export const addToCartAPI = (productId, quantity = 1, size = "", color = "") => {
  return axios.post(
    `${API}/add`,
    { productId, quantity, size, color },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
};


// GET CART
export const getCartAPI = () => {
  return axios.get(`${API}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};


// REMOVE CART ITEM
export const removeCartAPI = (id) => {
  return axios.delete(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};


// UPDATE CART
export const updateCartAPI = (id, quantity) => {
  return axios.put(
    `${API}/${id}`,
    { quantity },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
};

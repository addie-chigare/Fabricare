import { createContext, useContext, useState, useEffect } from "react";
import {
  addToCartAPI,
  getCartAPI,
  removeCartAPI,
  updateCartAPI,
} from "../services/cartService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart
  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setCart([]);
        return;
      }

      const { data } = await getCartAPI();
      setCart(data);
    } catch (error) {
      console.log(error);
      setCart([]);
    }
  };

  // load cart on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Add product
  const addToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      await addToCartAPI(
        product._id, 
        product.quantity || 1, 
        product.selectedSize || "", 
        product.selectedColor || ""
      );

      loadCart();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding to cart");
    }
  };

  // Remove item
  const removeFromCart = async (id) => {
    try {
      await removeCartAPI(id);

      setCart((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  // Update quantity
  const updateQuantity = async (id, quantity) => {
    try {
      if (quantity < 1) return;

      await updateCartAPI(id, quantity);

      setCart((prev) =>
        prev.map((item) => (item._id === id ? { ...item, quantity } : item)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  

  // Clear cart on logout
  const clearCart = () => {
    setCart([]);
  };
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        loadCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { isSessionExpired, clearSession } from "./services/sessionHelper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import CreateProduct from "./admin/pages/CreateProduct";
import EditProduct from "./admin/pages/EditProduct";
import AdminOrders from "./admin/pages/AdminOrders";
import ManageUsers from "./admin/pages/ManageUsers";
import AdminUserOrders from "./admin/pages/AdminUserOrders";
import AdminBanners from "./admin/pages/AdminBanners";
import ManageCategories from "./admin/pages/ManageCategories";
import AdminSettings from "./admin/pages/AdminSettings";

import UserLayout from "./user/UserLayout";
import Home from "./user/pages/Home";
import Products from "./user/pages/Products";
import ProductDetails from "./user/pages/ProductDetails";
import Cart from "./user/pages/Cart";
import Orders from "./user/pages/Orders";
import MyAddress from "./user/pages/MyAddress";
import Checkout from "./user/pages/Checkout";
import OrderSuccess from "./user/pages/OrderSuccess";
import Profile from "./user/pages/Profile";
import Wishlist from "./user/pages/Wishlist";
import LaundryServices from "./user/pages/LaundryServices";
import BookLaundry from "./user/pages/BookLaundry";
import LaundryOrders from "./user/pages/LaundryOrders";
import LaundrySupport from "./user/pages/LaundrySupport";
import ManageLaundry from "./admin/pages/ManageLaundry";
import AdminLogin from "./admin/pages/AdminLogin";
import About from "./user/pages/About";
import Contact from "./user/pages/Contact";
import Careers from "./user/pages/Careers";

import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";

import ProtectedRoute from "./user/components/ProtectedRoute";
import AdminRoute from "./admin/components/AdminRoute";

function SessionManager() {
  const location = useLocation();

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      if (token && isSessionExpired()) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        clearSession();
        alert("Your login session has expired (2 hours limit). Please sign in again.");
        if (user.role === "admin") {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 15000); // Check session every 15s
    return () => clearInterval(interval);
  }, [location]);

  return null;
}

function App() {
  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "AXc0pOHv5yhQDf6VQp4gR6ZAqKH0TJWtrgPZfbAe-QBfTMsoSSPq-tqyqDOUBYYN2waP1uXvIFHD9F8X",
        currency: "USD",
        intent: "capture",
        components: "buttons",
         "disable-funding": "card"
      }}
    >
      <Router>
        <SessionManager />
        <ToastContainer position="top-right" autoClose={2000} />

        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* User Layout */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="careers" element={<Careers />} />

            <Route
              path="products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="my-address"
              element={
                <ProtectedRoute>
                  <MyAddress />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="product/:id"
              element={
                <ProtectedRoute>
                  <ProductDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />

            <Route path="laundry/services" element={<LaundryServices />} />
            <Route path="laundry/support" element={<LaundrySupport />} />

            <Route
              path="laundry/book"
              element={
                <ProtectedRoute>
                  <BookLaundry />
                </ProtectedRoute>
              }
            />

            <Route
              path="laundry/orders"
              element={
                <ProtectedRoute>
                  <LaundryOrders />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="user-orders/:id" element={<AdminUserOrders />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="laundry" element={<ManageLaundry />} />
          </Route>
        </Routes>
      </Router>
    </PayPalScriptProvider>
  );
}

export default App;

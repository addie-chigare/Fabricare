import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import "./services/api.js";
import { CartProvider } from "./context/CartContext";
createRoot(document.getElementById("root")).render(
  <CartProvider>
    <App />
  </CartProvider>,
);

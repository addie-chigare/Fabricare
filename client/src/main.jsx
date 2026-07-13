import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import 'react-toastify/dist/ReactToastify.css';
import "./index.css";
import "./services/api.js";
import { CartProvider } from "./context/CartContext";

// 🔒 Security Protection: Disable right-click & source inspection shortcuts
if (import.meta.env.PROD) {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    // Disable F12
    if (e.key === "F12") {
      e.preventDefault();
    }
    // Disable Ctrl + U (View Source)
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
    }
    // Disable Ctrl + Shift + I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
    }
    // Disable Ctrl + Shift + C (Inspect Selector)
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
    }
    // Disable Ctrl + Shift + J (Console)
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") {
      e.preventDefault();
    }
    // Disable Ctrl + S (Save Page)
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")).render(
  <CartProvider>
    <App />
  </CartProvider>,
);

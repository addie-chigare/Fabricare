import { Navigate } from "react-router-dom";
import { isSessionExpired, clearSession } from "../../services/sessionHelper";

const AdminRoute = ({ children }) => {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && isSessionExpired()) {
    clearSession();
    alert("Your session has expired. Please log in again.");
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

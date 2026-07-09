import { Navigate } from "react-router-dom";
import { isSessionExpired, clearSession } from "../../services/sessionHelper";

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && isSessionExpired()) {
    clearSession();
    alert("Your session has expired. Please log in again.");
    return <Navigate to="/login" replace />;
  }

  if (!token) {
    alert("Login Required");
    return <Navigate to="/login" replace />;
  }

  
  if (user?.role === "admin") {
    alert("Login Required");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

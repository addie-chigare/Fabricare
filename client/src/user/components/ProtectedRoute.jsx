import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));


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

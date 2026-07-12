import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { startSession } from "../services/sessionHelper";
import { FaUser, FaLock, FaShieldAlt } from "react-icons/fa";

const Login = () => {

  const navigate = useNavigate();
  const { loadCart } = useCart();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        formData
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      startSession();

      loadCart();
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/Products");
      }

    } catch (error) {

      setError(error.response?.data?.message || "Login Failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <style>{`
        .auth-bg {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #f8f9fa;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(25, 135, 84, 0.06) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(13, 110, 253, 0.05) 0%, transparent 45%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 24px;
        }

        .auth-bg .grain {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.5;
          background-image: radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 90%);
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 20px 45px rgba(16, 24, 40, 0.10);
          padding: 36px 32px;
        }

        .auth-badge {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #198754, #157347);
          box-shadow: 0 6px 16px rgba(25, 135, 84, 0.28);
          margin: 0 auto 14px auto;
        }

        .auth-title {
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #1c2333;
        }

        .auth-input-group .input-group-text {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-right: none;
          color: #6c757d;
        }

        .auth-input-group .form-control {
          border-left: none;
        }

        .auth-input-group .form-control:focus {
          border-color: #86d5b0 !important;
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15) !important;
        }

        .auth-input-group:focus-within .input-group-text {
          border-color: #86d5b0;
        }

        .btn-primary-glow {
          background: linear-gradient(135deg, #198754, #157347) !important;
          border: none !important;
          font-weight: 600 !important;
          box-shadow: 0 6px 16px rgba(25, 135, 84, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-primary-glow:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(25, 135, 84, 0.32);
        }
        .btn-primary-glow:disabled {
          opacity: 0.65;
        }

        .forgot-link {
          color: #6c757d;
          transition: color 0.2s ease;
        }
        .forgot-link:hover {
          color: #198754;
        }
      `}</style>

      <div className="grain" />

      <div className="auth-card">

        <div className="auth-badge">
          <FaShieldAlt color="#fff" size={20} />
        </div>

        <h3 className="text-center mb-4 auth-title">
          Welcome Back
        </h3>

        {error && (
          <div className="alert alert-danger py-2 small">{error}</div>
        )}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold text-muted">Username or Email</Form.Label>
            <div className="input-group auth-input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username or email"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
            <div className="input-group auth-input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="text-end mt-2">
              <Link to="/forgot-password" className="forgot-link" style={{ fontSize: "0.85rem", textDecoration: "none", fontWeight: "500" }}>
                Forgot Password?
              </Link>
            </div>
          </Form.Group>

          <Button type="submit" className="btn-primary-glow w-100 py-2" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>

        </Form>

        <p className="text-center mt-3 mb-0">
          Don't have account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;

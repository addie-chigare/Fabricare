import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
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
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        formData
      );

      const user = res.data.user;

      if (user.role !== "admin") {
        setError("Access Denied: You do not have administrator privileges.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin/dashboard");
      window.location.reload();
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="vh-100 w-100 d-flex align-items-center justify-content-center"
      style={{
        background: "#0f172a",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(244, 63, 94, 0.08) 0px, transparent 50%)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card 
              className="border-0 shadow-lg" 
              style={{ 
                background: "rgba(30, 41, 59, 0.7)", 
                backdropFilter: "blur(12px)",
                borderRadius: "1.25rem",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              <Card.Body className="p-4 text-white">
                <div className="text-center mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center mb-3 text-primary bg-primary bg-opacity-10"
                    style={{ width: "64px", height: "64px", borderRadius: "18px" }}
                  >
                    <FaLock size={28} style={{ color: "#6366f1" }} />
                  </div>
                  <h4 className="fw-bold mb-1">Fabricare Admin</h4>
                  <p className="text-muted small mb-0">Sign in to control dashboard configurations</p>
                </div>

                {error && (
                  <Alert variant="danger" className="py-2.5 small text-center border-0 mb-3" style={{ background: "rgba(220, 38, 38, 0.2)", color: "#fca5a5" }}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Username or Email</Form.Label>
                    <div className="position-relative">
                      <FaUser 
                        className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" 
                        size={14} 
                      />
                      <Form.Control
                        type="text"
                        name="username"
                        placeholder="admin_username"
                        className="py-2.5 ps-5 border-0 text-white"
                        style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "0.75rem" }}
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-muted text-uppercase">Password</Form.Label>
                    <div className="position-relative">
                      <FaLock 
                        className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" 
                        size={14} 
                      />
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="py-2.5 ps-5 border-0 text-white"
                        style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "0.75rem" }}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 py-2.5 fw-bold border-0 d-flex align-items-center justify-content-center gap-2"
                    style={{ 
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Access Dashboard"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-3">
              <a 
                href="/" 
                className="text-muted text-decoration-none small hover-underline" 
                style={{ fontSize: "0.85rem" }}
              >
                &larr; Back to Storefront
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;

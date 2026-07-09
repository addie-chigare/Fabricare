import { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { startSession } from "../services/sessionHelper";

const Login = () => {

  const navigate = useNavigate();
  const { loadCart } = useCart();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        formData
      );
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      startSession();

      alert("Login Successful");
      loadCart();
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/Products");
      }

    } catch (error) {

      alert(error.response?.data?.message || "Login Failed");

    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">

      <Row className="w-100 justify-content-center">

        <Col md={5} lg={4}>

          <Card className="shadow border-0">

            <Card.Body className="p-4">

              <h3 className="text-center mb-4 fw-bold">
                Login
              </h3>

              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                  <Form.Label>Username or Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username or email"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-end mt-2">
                    <Link to="/forgot-password" style={{ fontSize: "0.85rem", textDecoration: "none", fontWeight: "500" }}>
                      Forgot Password?
                    </Link>
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>

              </Form>

              <p className="text-center mt-3 mb-0">
                Don't have account? <Link to="/register">Register</Link>
              </p>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
};

export default Login;

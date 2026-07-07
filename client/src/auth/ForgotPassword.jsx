import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaUser, FaExternalLinkAlt } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(40);

  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your Email or Username");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/forgot-password", { 
        email, 
      });
      setMessage(res.data.message);
      setTimer(40);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset code. Please verify details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      alert(res.data.message || "Password reset successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/forgot-password", { 
        email, 
      });
      setMessage(res.data.message || "Reset code sent to your email.");
      setTimer(40);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={5} lg={4}>
          <Card className="shadow border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-4">
              
              <div className="mb-4">
                <Link to="/login" className="text-muted text-decoration-none small d-flex align-items-center gap-1">
                  <FaArrowLeft size={12} /> Back to Login
                </Link>
              </div>

              <h3 className="text-center mb-3 fw-bold">
                Reset Password
              </h3>
              
              <p className="text-muted text-center small mb-4">
                {step === 1 
                  ? "Enter your Email address or Username. A secure 6-digit OTP will be sent." 
                  : "Enter the OTP code sent to your email and choose your new password."
                }
              </p>

              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              {message && <Alert variant="success" className="py-2 small">{message}</Alert>}



              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form onSubmit={handleSendOtp}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Email Address or Username</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaEnvelope />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Enter email or username"
                            className="border-start-0 bg-light"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </Form.Group>

                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 py-2 fw-semibold"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Reset Code"}
                      </Button>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form onSubmit={handleResetPassword}>
                      
                      <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="small fw-semibold text-muted mb-0">6-Digit OTP</Form.Label>
                          {timer > 0 ? (
                            <span className="text-muted small">Resend in <strong>{timer}s</strong></span>
                          ) : (
                            <button 
                              type="button"
                              onClick={handleResendOtp} 
                              className="btn btn-link p-0 text-decoration-none small fw-semibold text-primary"
                              disabled={loading}
                              style={{ fontSize: "0.85rem" }}
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaKey />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="border-start-0 bg-light text-center fw-bold letter-spacing-2"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">New Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            placeholder="Minimum 6 characters"
                            className="border-start-0 bg-light"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Confirm New Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            placeholder="Re-enter new password"
                            className="border-start-0 bg-light"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </Form.Group>

                      <Button 
                        variant="success" 
                        type="submit" 
                        className="w-100 py-2 fw-semibold"
                        disabled={loading}
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </Button>


                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;

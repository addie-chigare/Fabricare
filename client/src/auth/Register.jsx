import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaUser, FaIdCard, FaShieldAlt } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Registration Details, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(40);
  const [suggestions, setSuggestions] = useState([]);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/register",
        formData
      );

      setMessage(res.data.message || "OTP code sent to your email.");
      setTimer(40);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed. Please try again.");
      if (err.response?.data?.suggestions) {
        setSuggestions(err.response.data.suggestions);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!otp) {
      setError("Please enter the 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/verify-registration",
        {
          email: formData.email,
          otp,
        }
      );

      alert(res.data.message || "Registration Successful!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/register",
        formData
      );
      setMessage(res.data.message || "OTP code resent to your email.");
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

        .auth-back-link {
          color: #6c757d !important;
          transition: color 0.2s ease;
        }
        .auth-back-link:hover {
          color: #198754 !important;
        }

        .auth-input-group .form-control:focus {
          border-color: #86d5b0 !important;
          box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15) !important;
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

        .otp-input {
          letter-spacing: 0.5em !important;
          font-size: 1.1rem !important;
        }

        .suggestion-pill {
          background: #f0faf5 !important;
          border: 1px solid #b8e6cc !important;
          color: #157347 !important;
        }
        .suggestion-pill:hover {
          background: #d9f2e4 !important;
        }
      `}</style>

      <div className="grain" />

      <div className="auth-card">
        <div className="mb-3">
          {step === 2 ? (
            <button
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
              }}
              className="btn btn-link p-0 auth-back-link text-decoration-none small d-flex align-items-center gap-1"
              style={{ border: "none", background: "none" }}
            >
              <FaArrowLeft size={12} /> Back
            </button>
          ) : (
            <Link to="/login" className="auth-back-link text-decoration-none small d-flex align-items-center gap-1">
              <FaArrowLeft size={12} /> Back to Login
            </Link>
          )}
        </div>

        <div className="auth-badge">
          <FaShieldAlt color="#fff" size={20} />
        </div>

        <h3 className="text-center mb-4 auth-title">
          {step === 1 ? "Create Account" : "Verify Email"}
        </h3>

        {step === 2 && (
          <p className="text-muted text-center small mb-4">
            Enter the 6-digit OTP code sent to {formData.email}
          </p>
        )}

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
              <Form onSubmit={handleSubmitDetails}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Full Name</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaIdCard />
                    </span>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      className="border-start-0 bg-light"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Username</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="text"
                      name="username"
                      placeholder="Enter username"
                      className="border-start-0 bg-light"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="mt-2 small">
                      <span className="text-muted">Suggested: </span>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, username: suggestion });
                            setSuggestions([]);
                          }}
                          className="btn btn-sm suggestion-pill me-1 py-0 px-2 fw-semibold"
                          style={{ fontSize: "0.75rem", borderRadius: "20px" }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Email Address</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaEnvelope />
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      className="border-start-0 bg-light"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Minimum 6 characters"
                      className="border-start-0 bg-light"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-glow w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Register"}
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
              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="small fw-semibold text-muted mb-0">6-Digit OTP</Form.Label>
                    {timer > 0 ? (
                      <span className="text-muted small">Resend in <strong>{timer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="btn btn-link p-0 text-decoration-none small fw-semibold text-success"
                        disabled={loading}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <FaKey />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="border-start-0 bg-light text-center fw-bold otp-input"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-glow w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;

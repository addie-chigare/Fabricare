import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaShieldAlt } from "react-icons/fa";

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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
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

        .otp-input {
          letter-spacing: 0.5em !important;
          font-size: 1.1rem !important;
        }

        .resend-link {
          color: #198754 !important;
        }
      `}</style>

      <div className="grain" />

      <div className="auth-card">

        <div className="mb-3">
          <Link to="/login" className="auth-back-link text-decoration-none small d-flex align-items-center gap-1">
            <FaArrowLeft size={12} /> Back to Login
          </Link>
        </div>

        <div className="auth-badge">
          <FaShieldAlt color="#fff" size={20} />
        </div>

        <h3 className="text-center mb-3 auth-title">
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
                  <div className="input-group auth-input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Enter email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-glow w-100 py-2"
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
                        className="btn btn-link p-0 text-decoration-none small fw-semibold resend-link"
                        disabled={loading}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text">
                      <FaKey />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="text-center fw-bold otp-input"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">New Password</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="At least 8 chars with uppercase, lowercase, digit, & symbol"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Confirm New Password</Form.Label>
                  <div className="input-group auth-input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-primary-glow w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>

              </Form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ForgotPassword;

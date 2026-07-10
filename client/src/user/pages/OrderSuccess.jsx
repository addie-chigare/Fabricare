import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShoppingBag, FaTruck, FaArrowRight } from "react-icons/fa";
import { Container, Button, Card } from "react-bootstrap";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <Container className="py-5 d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: "24px", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)" }}>
          <div className="bg-success py-5 d-flex justify-content-center align-items-center position-relative overflow-hidden">
            {/* Animated Background Elements */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="position-absolute opacity-10"
              style={{ width: "300px", height: "300px", borderRadius: "50%", border: "20px solid white", top: "-150px", right: "-150px" }}
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            >
              <FaCheckCircle className="text-white" size={80} />
            </motion.div>
          </div>

          <Card.Body className="p-5 text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="fw-bold mb-3"
            >
              Order Placed Successfully!
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted mb-4 fs-5"
            >
              Thank you for choosing <span className="text-primary fw-bold">Fabricare</span>. Your style journey continues here!
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-light p-3 rounded-4 mb-4 d-flex align-items-center justify-content-center gap-3 border"
            >
              <FaTruck className="text-primary" />
              <span className="small fw-semibold">Redirecting to track your order in {countdown}s...</span>
            </motion.div>

            <div className="d-grid gap-3">
              <Button 
                as={Link} 
                to="/products" 
                variant="primary" 
                size="lg" 
                className="rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                <FaShoppingBag /> Continue Shopping
              </Button>
              
              <Button 
                as={Link} 
                to="/orders" 
                variant="outline-dark" 
                size="lg" 
                className="rounded-pill py-3 fw-bold border-2"
              >
                View My Orders <FaArrowRight className="ms-2" size={14} />
              </Button>
            </div>
          </Card.Body>

          <div className="bg-light py-3 px-5 text-center border-top">
            <p className="smaller text-muted mb-0">
              Need help? <Link to="/contact" className="text-primary fw-bold text-decoration-none">Contact Support</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
};

export default OrderSuccess;

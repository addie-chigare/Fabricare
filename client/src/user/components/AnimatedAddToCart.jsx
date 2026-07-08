import { motion, AnimatePresence } from "framer-motion";
import { Button } from "react-bootstrap";
import { FaShoppingCart, FaCheck } from "react-icons/fa";

const AnimatedAddToCart = ({ onClick, added, loading, className }) => {
  return (
    <Button
      variant={added ? "success" : "primary"}
      className={`fw-bold position-relative overflow-hidden ${className}`}
      onClick={onClick}
      disabled={loading || added}
      style={{ minHeight: "38px", fontSize: "0.82rem", transition: "background-color 0.3s ease" }}
    >
      <AnimatePresence mode="wait">
        {!added ? (
          <motion.div
            key="add"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <FaShoppingCart size={13} />
            <span className="d-none d-sm-inline">Add to Cart</span>
            <span className="d-inline d-sm-none">Add</span>
          </motion.div>
        ) : (
          <motion.div
            key="added"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="d-flex align-items-center justify-content-center gap-2"
          >
            <FaCheck size={13} />
            <span className="d-none d-sm-inline">Added!</span>
            <span className="d-inline d-sm-none">Added</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple Animation Effect */}
      <motion.span
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="position-absolute bg-white rounded-circle"
        style={{
          width: "100px",
          height: "100px",
          top: "50%",
          left: "50%",
          marginTop: "-50px",
          marginLeft: "-50px",
          pointerEvents: "none",
        }}
      />
    </Button>
  );
};

export default AnimatedAddToCart;

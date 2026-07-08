import { Card, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from "react";
import axios from "axios";

const ProductCard = ({ product }) => {
  const { addToCart, cart, removeFromCart, updateQuantity } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  const cartItem = cart.find((item) => item.product && item.product._id === product._id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  // Load initial wishlist state
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const wishlist = user.wishlist || [];
    setIsWishlisted(wishlist.includes(product._id));
  }, [product._id]);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (product.stock === 0) {
      alert("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (user?.role === "admin") {
      alert("Please login as user to add to cart");
      return;
    }

    addToCart(product);
  };

  const handleIncreaseQty = async (e) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (currentQuantity >= product.stock) {
      alert(`Only ${product.stock} items left in stock`);
      return;
    }
    await updateQuantity(cartItem._id, currentQuantity + 1);
  };

  const handleDecreaseQty = async (e) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (currentQuantity === 1) {
      await removeFromCart(cartItem._id);
    } else {
      await updateQuantity(cartItem._id, currentQuantity - 1);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation(); // Prevent card navigation
    if (product.stock === 0) {
      alert("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (user?.role === "admin") {
      alert("Please login as user to purchase products");
      return;
    }

    // Add to cart
    addToCart(product);
    
    // Redirect to checkout
    navigate("/checkout");
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation(); // Prevent card navigation
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to wishlist products.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/wishlist/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsWishlisted(!isWishlisted);

      // Update local storage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.wishlist = res.data.wishlist;
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch event to update navbar wishlist badge
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  // Calculate discounted price
  const discountVal = product.discount || 0;
  const sellingPrice = discountVal > 0 
    ? product.price - (product.price * discountVal) / 100 
    : product.price;

  return (
    <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4 px-2">
      <Card
        onClick={() => navigate(`/product/${product._id}`)}
        className="h-100 border-0 shadow-sm overflow-hidden position-relative product-card-hover bg-white"
        style={{
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          transition: "var(--transition)",
        }}
      >


        {/* Product Image Box */}
        <div
          className="position-relative overflow-hidden d-flex align-items-center justify-content-center bg-light mobile-product-img-box"
          style={{ height: "200px" }}
        >
          <Card.Img
            variant="top"
            src={product.image}
            className="w-100 h-100 p-3 image-zoom"
            style={{ objectFit: "contain", transition: "var(--transition)" }}
          />

          {/* Wishlist Toggle Heart Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            className="btn btn-link position-absolute end-0 top-0 m-2 p-0 bg-white rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
            style={{ zIndex: 10, width: "32px", height: "32px", textDecoration: "none" }}
          >
            {isWishlisted ? (
              <FaHeart className="text-danger" size={15} />
            ) : (
              <FaRegHeart className="text-muted" size={15} />
            )}
          </button>

          {/* Discount Percentage Badge */}
          {discountVal > 0 && (
            <Badge
              bg="danger"
              className="position-absolute start-0 top-0 m-2 px-2 py-1 fw-bold rounded-pill text-uppercase"
              style={{ zIndex: 10, fontSize: "0.65rem" }}
            >
              {discountVal}% OFF
            </Badge>
          )}

          {/* Stock Badges */}
          {product.stock === 0 ? (
            <Badge
              bg="dark"
              className="position-absolute bottom-0 start-0 m-2 px-2 py-1 text-uppercase font-monospace"
              style={{ fontSize: "0.6rem", borderRadius: "4px" }}
            >
              Sold Out
            </Badge>
          ) : product.stock <= 5 ? (
            <Badge
              bg="warning"
              className="position-absolute bottom-0 start-0 m-2 px-2 py-1 text-dark text-uppercase font-monospace"
              style={{ fontSize: "0.6rem", borderRadius: "4px" }}
            >
              Only {product.stock} left
            </Badge>
          ) : null}
        </div>

        {/* Card Body */}
        <Card.Body className="d-flex flex-column p-3">
          {/* Brand Name */}
          <small
            className="text-uppercase tracking-wider text-muted mb-1 fw-bold"
            style={{ fontSize: "0.65rem", letterSpacing: "0.05em" }}
          >
            {product.brand || "Fabricare Signature"}
          </small>

          {/* Product Title */}
          <Card.Title
            className="fw-bold mb-1 text-truncate-2 text-dark"
            style={{ fontSize: "0.85rem", minHeight: "2.4rem", lineHeight: "1.3" }}
          >
            {product.name}
          </Card.Title>

          {/* Rating */}
          <div className="d-flex align-items-center mb-2">
            <div className="text-warning me-1 small" style={{ fontSize: "0.7rem" }}>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(product.rating || 4.5) ? "" : "opacity-25"} />
              ))}
            </div>
            <span className="text-muted smaller">({product.rating || 4.5})</span>
          </div>

          {/* Pricing Box */}
          <div className="d-flex align-items-baseline gap-2 mt-auto">
            <span className="fw-bold text-primary" style={{ fontSize: "1.05rem" }}>
              ₹{sellingPrice.toLocaleString()}
            </span>
            {discountVal > 0 && (
              <span className="text-muted text-decoration-line-through smaller">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 mt-3">
            {isInCart ? (
              <div 
                className="flex-grow-1 d-flex align-items-center justify-content-between border border-primary rounded-3 bg-light"
                style={{ minHeight: "38px", padding: "0 8px" }}
                onClick={(e) => e.stopPropagation()} // Prevent card navigation
              >
                <button
                  type="button"
                  className="btn btn-sm border-0 p-1 text-primary fw-bold"
                  onClick={handleDecreaseQty}
                  style={{ fontSize: "1rem", outline: "none", boxShadow: "none" }}
                >
                  −
                </button>
                <span className="fw-bold text-primary" style={{ fontSize: "0.85rem" }}>
                  {currentQuantity}
                </span>
                <button
                  type="button"
                  className="btn btn-sm border-0 p-1 text-primary fw-bold"
                  onClick={handleIncreaseQty}
                  style={{ fontSize: "1rem", outline: "none", boxShadow: "none" }}
                >
                  +
                </button>
              </div>
            ) : (
              <Button
                variant="outline-primary"
                className="flex-grow-1 py-1.5 px-2 d-flex align-items-center justify-content-center gap-1 fw-bold text-nowrap"
                style={{ fontSize: "0.75rem", borderRadius: "10px", minHeight: "38px" }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FaShoppingCart size={11} /> <span>Add</span>
              </Button>
            )}
            
            <Button
              variant="primary"
              className="flex-grow-1 py-1.5 px-2 d-flex align-items-center justify-content-center gap-1 fw-bold text-nowrap"
              style={{ fontSize: "0.75rem", borderRadius: "10px", minHeight: "38px" }}
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              <FaBolt size={11} /> <span>Buy Now</span>
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductCard;

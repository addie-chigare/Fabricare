import { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Breadcrumb, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaShoppingBag, FaHeart } from "react-icons/fa";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const token = localStorage.getItem("token");

  // Load wishlist items
  const loadWishlist = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get("http://localhost:8000/api/v1/auth/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(data || []);
    } catch (err) {
      console.error("Load wishlist error:", err);
      setError("Failed to load wishlist items.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Remove item from wishlist
  const handleRemoveItem = async (productId) => {
    try {
      setError("");
      setMessage("");
      const res = await axios.post("http://localhost:8000/api/v1/auth/wishlist/toggle", 
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setWishlistItems((prev) => prev.filter((item) => item && item._id !== productId));
      setMessage("Product removed from wishlist.");

      // Sync local storage user object
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.wishlist = res.data.wishlist;
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch event to update navbar wishlist counter
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError("Failed to remove item.");
    }
  };

  // Move item to cart
  const handleMoveToCart = async (item) => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (userObj?.role === "admin") {
      alert("Admins cannot purchase products");
      return;
    }
    try {
      setError("");
      setMessage("");
      
      // Get first available size and color
      const selectedSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : "";
      const selectedColor = item.colors && item.colors.length > 0 ? item.colors[0] : "";

      // Add to cart logic
      await addToCart({
        ...item,
        quantity: 1,
        selectedSize,
        selectedColor
      });

      // Remove from wishlist on database
      const res = await axios.post("http://localhost:8000/api/v1/auth/wishlist/toggle", 
        { productId: item._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setWishlistItems((prev) => prev.filter((w) => w && w._id !== item._id));
      setMessage(`"${item.name}" moved to cart successfully!`);

      // Sync local storage user object
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.wishlist = res.data.wishlist;
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch event to update navbar wishlist counter
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Move to cart error:", err);
      setError("Failed to move item to cart.");
    }
  };

  return (
    <Container className="py-4 py-lg-5" style={{ minHeight: "80vh" }}>
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-4 small">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/products" }}>Products</Breadcrumb.Item>
        <Breadcrumb.Item active>Wishlist</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom">
        <FaHeart size={24} className="text-danger animate-pulse" />
        <h2 className="fw-bold text-dark mb-0">My Wishlist</h2>
        <span className="badge rounded-pill bg-light text-muted border font-monospace ms-2">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {error && <Alert variant="danger" className="py-2.5 rounded-4 mb-4">{error}</Alert>}
      {message && <Alert variant="success" className="py-2.5 rounded-4 mb-4">{message}</Alert>}

      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted small">Loading wishlist, please wait...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-4">
          <div className="mb-3">
            <FaHeart size={48} className="text-danger opacity-25" />
          </div>
          <h4 className="fw-bold mb-2">Your Wishlist is Empty</h4>
          <p className="text-muted small mb-4">Explore our collections and save your favorite clothing items here.</p>
          <Button as={Link} to="/products" variant="primary" className="px-4 py-2.5 rounded-3 fw-bold">
            Shop Our Products
          </Button>
        </div>
      ) : (
        <Row className="gx-3 gy-4">
          {wishlistItems.map((item) => {
            if (!item) return null;
            const discountVal = item.discount || 0;
            const sellingPrice = discountVal > 0 
              ? item.price - (item.price * discountVal) / 100 
              : item.price;
              
            return (
              <Col key={item._id} xs={6} sm={6} md={4} lg={3}>
                <Card 
                  className="h-100 border-0 shadow-sm overflow-hidden bg-white product-card-hover cursor-pointer"
                  style={{ borderRadius: "var(--radius-lg)" }}
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {/* Image wrapper */}
                  <div 
                    className="position-relative bg-light overflow-hidden d-flex align-items-center justify-content-center"
                    style={{ height: "180px" }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-100 h-100 p-3 object-fit-contain image-zoom"
                      onError={(e) => { e.target.src = "https://placehold.co/300x300?text=No+Image"; }}
                    />
                    
                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item._id);
                      }}
                      className="btn btn-link position-absolute end-0 top-0 m-2 p-1 bg-white rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                      style={{ width: "30px", height: "30px", zIndex: 5 }}
                    >
                      <FaTrash size={12} className="text-danger" />
                    </button>

                    {/* Discount badge */}
                    {discountVal > 0 && (
                      <Badge 
                        bg="danger" 
                        className="position-absolute start-0 top-0 m-2 px-2 py-1 fw-bold rounded-pill text-uppercase"
                        style={{ fontSize: "0.65rem", zIndex: 5 }}
                      >
                        {discountVal}% OFF
                      </Badge>
                    )}
                  </div>

                  <Card.Body className="p-3 d-flex flex-column">
                    <small className="text-uppercase tracking-wider text-muted mb-1 fw-bold" style={{ fontSize: "0.65rem" }}>
                      {item.brand || "Fabricare Signature"}
                    </small>
                    <Card.Title className="fw-bold mb-1 text-truncate text-dark" style={{ fontSize: "0.85rem" }}>
                      {item.name}
                    </Card.Title>
                    
                    <div className="d-flex align-items-baseline gap-2 mb-3 mt-auto">
                      <span className="fw-bold text-primary" style={{ fontSize: "0.95rem" }}>₹{sellingPrice.toLocaleString()}</span>
                      {discountVal > 0 && (
                        <span className="text-muted text-decoration-line-through smaller">₹{item.price.toLocaleString()}</span>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToCart(item);
                      }}
                      className="w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <FaShoppingBag size={12} /> Move to Cart
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Wishlist;

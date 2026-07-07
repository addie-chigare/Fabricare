import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Button, Alert, Badge, Form, Card, Spinner } from "react-bootstrap";
import { 
  FaStar, 
  FaHeart, 
  FaRegHeart, 
  FaShoppingBag, 
  FaTruck, 
  FaUndo, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaChevronRight 
} from "react-icons/fa";
import API from "../../services/api";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const token = localStorage.getItem("token");

  // Product states
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  
  // Image gallery states
  const [activeImage, setActiveImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: "0% 0%", transform: "scale(1)" });
  const [isZoomed, setIsZoomed] = useState(false);

  // Variant selection states
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  
  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Refs for zoom
  const zoomContainerRef = useRef(null);

  const getProduct = useCallback(async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const data = res.data;
      setProduct(data);
      setActiveImage(data.image);
      
      // Default selections
      if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
      if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);

      // Check wishlist state
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.wishlist) {
        setIsWishlisted(user.wishlist.includes(id));
      }
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  const increaseQty = () => {
    if (product && qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const decreaseQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  // Image zoom handler
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)"
    });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transformOrigin: "0% 0%", transform: "scale(1)" });
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/wishlist/toggle", 
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsWishlisted(res.data.wishlist.includes(id));
      
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.wishlist = res.data.wishlist;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Wishlist toggle error", err);
    }
  };

  const handleAddToCart = async () => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (userObj?.role === "admin") {
      alert("Admins cannot purchase products");
      return;
    }

    try {
      setLoading(true);
      await addToCart({
        ...product,
        quantity: qty,
        selectedSize,
        selectedColor
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const userObj = JSON.parse(localStorage.getItem("user"));
    if (userObj?.role === "admin") {
      alert("Admins cannot purchase products");
      return;
    }

    try {
      setLoading(true);
      await addToCart({
        ...product,
        quantity: qty,
        selectedSize,
        selectedColor
      });
      navigate("/checkout");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setReviewLoading(true);

    try {
      const res = await axios.post(`http://localhost:8000/api/v1/products/${id}/review`, 
        { rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReviewSuccess("Review submitted successfully!");
      setNewComment("");
      setNewRating(5);
      getProduct(); // reload product reviews
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Calculate price and discount
  const discountVal = product.discount || 0;
  const sellingPrice = discountVal > 0 
    ? product.price - (product.price * discountVal) / 100 
    : product.price;

  // Mock secondary images for showcase gallery
  const galleryImages = [
    product.image,
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  ];

  return (
    <Container className="py-4 py-lg-5">
      {/* Breadcrumbs */}
      <div className="d-flex align-items-center gap-2 mb-4 text-muted small">
        <Link to="/" className="text-decoration-none text-muted">Home</Link>
        <FaChevronRight size={10} />
        <Link to="/products" className="text-decoration-none text-muted">Products</Link>
        <FaChevronRight size={10} />
        <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: "200px" }}>{product.name}</span>
      </div>

      {added && (
        <Alert variant="success" className="text-center py-2 shadow-sm rounded-4 animate__animated animate__fadeInDown">
          ✨ **Success!** Product added to your shopping cart.
        </Alert>
      )}

      <Row className="gy-4 mb-5">
        {/* LEFT: Image Gallery & Zoom */}
        <Col lg={6}>
          <Row>
            {/* Thumbnails (desktop left side, mobile bottom) */}
            <Col md={2} className="order-2 order-md-1 mt-3 mt-md-0 d-flex flex-row flex-md-column gap-2 justify-content-start">
              {galleryImages.map((imgUrl, i) => (
                <div 
                  key={i}
                  className={`border rounded-3 p-1 bg-white cursor-pointer transition-all ${activeImage === imgUrl ? "border-primary border-2" : "border-light"}`}
                  onClick={() => setActiveImage(imgUrl)}
                  style={{ width: "65px", height: "65px", overflow: "hidden" }}
                >
                  <img src={imgUrl} alt="thumbnail" className="w-100 h-100 object-fit-cover rounded-2" />
                </div>
              ))}
            </Col>

            {/* Main Premium Zoom Container */}
            <Col md={10} className="order-1 order-md-2">
              <div 
                ref={zoomContainerRef}
                className="main-image-container border rounded-4 bg-white p-3 shadow-sm overflow-hidden position-relative"
                style={{ height: "450px", cursor: "zoom-in" }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-100 h-100 object-fit-contain transition-transform duration-75"
                  style={isZoomed ? zoomStyle : { transform: "scale(1)" }}
                  onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}
                />
                {discountVal > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3 shadow">
                    {discountVal}% OFF
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        </Col>

        {/* RIGHT: Product Metadata & Choices */}
        <Col lg={6} className="ps-lg-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-uppercase tracking-wider text-muted fw-bold small">{product.brand || "Fabricare Premium"}</span>
            <button 
              onClick={handleToggleWishlist}
              className="btn btn-light rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
            >
              {isWishlisted ? <FaHeart size={20} className="text-danger animate-pulse" /> : <FaRegHeart size={20} className="text-muted" />}
            </button>
          </div>
          <h2 className="fw-bold text-dark mb-2">{product.name}</h2>
          
          {/* Ratings & Score */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="text-warning d-flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(product.rating || 4) ? "text-warning" : "text-light-gray"} size={16} />
              ))}
            </div>
            <span className="fw-bold text-dark small">{product.rating || 4.5} / 5</span>
            <span className="text-muted small">({product.reviews?.length || 0} customer reviews)</span>
          </div>

          <hr className="my-3 opacity-25" />

          {/* Pricing Details */}
          <div className="mb-4">
            <div className="d-flex align-items-baseline gap-3">
              <h3 className="fw-bold text-primary mb-0">₹{sellingPrice.toLocaleString()}</h3>
              {discountVal > 0 && (
                <>
                  <span className="text-muted text-decoration-line-through fs-5">₹{product.price.toLocaleString()}</span>
                  <Badge bg="success-light" className="text-success py-1 px-2 rounded-2 smaller">Save ₹{(product.price - sellingPrice).toLocaleString()}</Badge>
                </>
              )}
            </div>
            <div className="text-muted smaller mt-1">Inclusive of all taxes</div>
          </div>

          {/* Color Selectors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-3">
              <label className="fw-semibold text-dark small mb-2 d-block">Select Color: <span className="text-primary">{selectedColor}</span></label>
              <div className="d-flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${selectedColor === c ? "btn-primary shadow" : "btn-outline-secondary"}`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selectors */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <label className="fw-semibold text-dark small mb-2 d-block">Select Size: <span className="text-primary">{selectedSize}</span></label>
              <div className="d-flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`btn rounded-3 d-flex align-items-center justify-content-center fw-bold transition-all ${selectedSize === s ? "btn-dark border-dark" : "btn-light border-light-subtle"}`}
                    style={{ width: "45px", height: "45px", fontSize: "0.85rem" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Material & Stock Status */}
          <div className="bg-light p-3 rounded-4 mb-4 shadow-sm border border-light-subtle">
            <Row className="gy-2">
              <Col xs={6}>
                <div className="smaller text-muted text-uppercase fw-semibold">Material</div>
                <div className="fw-bold text-dark small">{product.material || "100% Organic Cotton"}</div>
              </Col>
              <Col xs={6}>
                <div className="smaller text-muted text-uppercase fw-semibold">Availability</div>
                <div>
                  {product.stock > 0 ? (
                    <Badge bg="success" className="py-1 px-2 rounded-2 smaller"><FaCheckCircle className="me-1" /> {product.stock} In Stock</Badge>
                  ) : (
                    <Badge bg="danger" className="py-1 px-2 rounded-2 smaller"><FaTimesCircle className="me-1" /> Sold Out</Badge>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Qty & Actions */}
          {product.stock > 0 ? (
            <>
              <div className="d-flex align-items-center mb-4">
                <span className="fw-semibold text-dark small me-3">Quantity:</span>
                <div className="d-flex align-items-center bg-light border rounded-pill p-1">
                  <Button variant="link" className="p-0 text-dark text-decoration-none px-3" onClick={decreaseQty}>-</Button>
                  <span className="fw-bold text-dark px-2">{qty}</span>
                  <Button variant="link" className="p-0 text-dark text-decoration-none px-3" onClick={increaseQty}>+</Button>
                </div>
              </div>

              <div className="d-flex gap-3">
                <Button 
                  onClick={handleAddToCart}
                  disabled={loading}
                  variant="outline-primary"
                  className="w-50 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  <FaShoppingBag size={15} /> Add to Cart
                </Button>
                
                <Button 
                  onClick={handleBuyNow}
                  disabled={loading}
                  variant="primary"
                  className="w-50 py-3 rounded-4 fw-bold shadow-sm"
                >
                  Buy Now
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="warning" className="text-center rounded-4">
              This product is currently out of stock. We will restock it soon!
            </Alert>
          )}

          {/* Guarantee Badges */}
          <div className="row mt-4 pt-3 border-top g-3 text-center">
            <div className="col-4">
              <div className="text-primary mb-1"><FaTruck size={18} /></div>
              <div className="smaller fw-bold text-dark">Fast Delivery</div>
            </div>
            <div className="col-4">
              <div className="text-primary mb-1"><FaUndo size={18} /></div>
              <div className="smaller fw-bold text-dark">7-Day Returns</div>
            </div>
            <div className="col-4">
              <div className="text-primary mb-1"><FaShieldAlt size={18} /></div>
              <div className="smaller fw-bold text-dark">Quality Assured</div>
            </div>
          </div>
        </Col>
      </Row>

      {/* TABS: Description, Reviews */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
        <Card.Header className="bg-light border-0 py-3 px-4">
          <h5 className="fw-bold mb-0 text-dark">Description & Reviews</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="gy-4">
            {/* Description Card */}
            <Col lg={7}>
              <h5 className="fw-bold text-dark mb-3">Product Description</h5>
              <p className="text-muted" style={{ lineHeight: "1.6" }}>{product.description}</p>
              <h6 className="fw-bold text-dark mt-4 mb-2">Specifications & Fit</h6>
              <ul className="text-muted small ps-3">
                <li>Material: {product.material || "100% Cotton"}</li>
                <li>Fit Type: Regular Fit / True to Size</li>
                <li>Design: Premium stitching and collar layout</li>
                <li>Occasion: Active wear, casual style</li>
              </ul>
            </Col>

            {/* Customer Reviews Section */}
            <Col lg={5} className="border-start border-light pl-lg-4">
              <h5 className="fw-bold text-dark mb-4">Customer Reviews ({product.reviews?.length || 0})</h5>
              
              {/* Reviews List */}
              <div className="d-flex flex-column gap-3 overflow-y-auto mb-4" style={{ maxHeight: "300px" }}>
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((r, index) => (
                    <div key={index} className="bg-light p-3 rounded-4 border border-light-subtle">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark small">{r.userName}</span>
                        <span className="smaller text-muted">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, starIdx) => (
                          <FaStar key={starIdx} size={11} className={starIdx < r.rating ? "text-warning" : "text-light-gray"} />
                        ))}
                      </div>
                      <p className="text-muted mb-0 small" style={{ fontSize: "0.82rem" }}>{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted small bg-light rounded-4">
                    No reviews yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>

              {/* Submit a Review Form */}
              <div className="border-top pt-4">
                <h6 className="fw-bold text-dark mb-3">Write a Customer Review</h6>
                {reviewError && <Alert variant="danger" className="py-2 small">{reviewError}</Alert>}
                {reviewSuccess && <Alert variant="success" className="py-2 small">{reviewSuccess}</Alert>}

                <Form onSubmit={handleAddReview}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">Your Rating</Form.Label>
                    <Form.Select 
                      value={newRating} 
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="form-select-sm"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                      <option value="3">⭐⭐⭐ (3 - Average)</option>
                      <option value="2">⭐⭐ (2 - Poor)</option>
                      <option value="1">⭐ (1 - Terrible)</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted text-uppercase mb-1">Review Comment</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      placeholder="Share your experience with this product..."
                      className="small"
                    />
                  </Form.Group>
                  <Button 
                    type="submit" 
                    disabled={reviewLoading || !token} 
                    className="w-100 py-2 fw-bold btn-sm rounded-3"
                  >
                    {reviewLoading ? <Spinner size="sm" /> : "Submit Review"}
                  </Button>
                  {!token && <small className="text-danger d-block mt-1 small">Please login to write reviews.</small>}
                </Form>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductDetails;

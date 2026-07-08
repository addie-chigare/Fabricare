import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Row, Col, Button, Alert, Badge, Card, Spinner, Container, Carousel } from "react-bootstrap";
import { 
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
import { useCart } from "../../context/CartContext";

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
  

  // Variant selection states
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  
  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getProduct = useCallback(async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const data = res.data;
      setProduct(data);

      
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

  const handleToggleWishlist = async () => {
    if (!token) {
      alert("Please login first to wishlist products.");
      navigate("/login");
      return;
    }
    try {
      const res = await API.post("/auth/wishlist/toggle", 
        { productId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsWishlisted(res.data.wishlist.includes(id));
      
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.wishlist = res.data.wishlist;
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch event to update navbar wishlist counter
      window.dispatchEvent(new Event("wishlist-updated"));
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

  // Retrieve gallery images from the database field
  const galleryImages = product.images && product.images.length > 0 
    ? [product.image, ...product.images.filter(img => img !== product.image)]
    : [product.image];

  return (
    <Container className="py-4 py-lg-5">
      {/* Breadcrumbs */}
      <div className="d-flex align-items-center gap-2 mb-4 text-muted small">
        <Link to="/" className="text-decoration-none text-muted">Home</Link>
        <FaChevronRight size={10} className="opacity-50" />
        <Link to="/products" className="text-decoration-none text-muted">Products</Link>
        <FaChevronRight size={10} className="opacity-50" />
        <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: "200px" }}>{product.name}</span>
      </div>

      {added && (
        <Alert variant="success" className="text-center py-2 shadow-sm rounded-4 animate__animated animate__fadeInDown">
          ✨ **Success!** Product added to your shopping cart.
        </Alert>
      )}

      <Row className="gy-4 mb-5">
        {/* LEFT: Image Carousel Slider */}
        <Col lg={6}>
          <div className="border rounded-4 bg-white p-3 shadow-sm overflow-hidden position-relative">
            <Carousel 
              variant="dark" 
              interval={null} 
              indicators={galleryImages.length > 1}
              controls={galleryImages.length > 1}
              className="product-details-carousel"
            >
              {galleryImages.map((imgUrl, i) => (
                <Carousel.Item key={i}>
                  <div style={{ height: "450px" }} className="d-flex align-items-center justify-content-center bg-white">
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-100 h-100 object-fit-contain"
                      onError={(e) => { e.target.src = "https://placehold.co/400x400?text=No+Image" }}
                    />
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            {discountVal > 0 && (
              <Badge bg="danger" className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-3 shadow" style={{ zIndex: 5 }}>
                {discountVal}% OFF
              </Badge>
            )}
          </div>
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
              {isWishlisted ? <FaHeart size={20} className="text-danger" /> : <FaRegHeart size={20} className="text-muted" />}
            </button>
          </div>
          <h2 className="fw-bold text-dark mb-3">{product.name}</h2>
          
          <hr className="my-3 opacity-25" />

          {/* Pricing Details */}
          <div className="mb-4">
            <div className="d-flex align-items-baseline gap-3">
              <h3 className="fw-bold text-primary mb-0">₹{sellingPrice.toLocaleString()}</h3>
              {discountVal > 0 && (
                <>
                  <span className="text-muted text-decoration-line-through fs-5">₹{product.price.toLocaleString()}</span>
                  <Badge bg="success-light" className="text-success py-1 px-2 rounded-2 smaller" style={{ backgroundColor: "rgba(25, 135, 84, 0.08)" }}>Save ₹{(product.price - sellingPrice).toLocaleString()}</Badge>
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
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold transition ${selectedColor === c ? "btn-primary shadow" : "btn-outline-secondary"}`}
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
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`btn rounded-3 d-flex align-items-center justify-content-center fw-bold transition ${selectedSize === s ? "btn-dark border-dark" : "btn-light border-light-subtle"}`}
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
                  <Button variant="link" className="p-0 text-dark text-decoration-none px-3 fw-bold" onClick={decreaseQty}>-</Button>
                  <span className="fw-bold text-dark px-2">{qty}</span>
                  <Button variant="link" className="p-0 text-dark text-decoration-none px-3 fw-bold" onClick={increaseQty}>+</Button>
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

      {/* DESCRIPTION BLOCK (No Reviews tab) */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5 bg-white">
        <Card.Header className="bg-light border-0 py-3 px-4">
          <h5 className="fw-bold mb-0 text-dark">Product Details & Specifications</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="gy-4">
            <Col lg={7}>
              <h5 className="fw-bold text-dark mb-3">Product Description</h5>
              <p className="text-muted" style={{ lineHeight: "1.7" }}>{product.description}</p>
            </Col>
            <Col lg={5} className="border-start border-light ps-lg-4">
              <h5 className="fw-bold text-dark mb-3">Specifications</h5>
              <ul className="text-muted small ps-3 d-flex flex-column gap-2" style={{ lineHeight: "1.5" }}>
                <li><strong>Material:</strong> {product.material || "100% Cotton"}</li>
                <li><strong>Available Sizes:</strong> {product.sizes?.join(", ") || "None"}</li>
                <li><strong>Available Colors:</strong> {product.colors?.join(", ") || "None"}</li>
                <li><strong>Fit Type:</strong> Regular Fit / True to Size</li>
                <li><strong>Design:</strong> Premium stitching and collar layout</li>
                <li><strong>Occasion:</strong> Active wear, casual style</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductDetails;

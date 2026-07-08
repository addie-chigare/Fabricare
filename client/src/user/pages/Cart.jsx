import { Button, Row, Col, Card, Container } from "react-bootstrap";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaShieldAlt, FaChevronRight } from "react-icons/fa";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const increaseQty = (item) => {
    if (item.quantity >= item.product?.stock) {
      toast.error("Product is out of stock");
      return;
    }
    updateQuantity(item._id, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const deliveryFee = subtotal > 1500 ? 0 : 99;
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Shopping Cart</h2>
          <p className="text-muted small mb-0">You have {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>
        <Button
          as={Link}
          to="/"
          variant="link"
          className="text-decoration-none text-primary fw-semibold small d-flex align-items-center gap-2"
        >
          <FaArrowLeft size={12} /> Continue Shopping
        </Button>
      </div>

      {cart.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Card.Body className="py-5 d-flex flex-column align-items-center justify-content-center">
            <div 
              className="bg-light text-primary rounded-circle p-4 mb-4 d-flex align-items-center justify-content-center animate__animated animate__zoomIn"
              style={{ width: "90px", height: "90px" }}
            >
              <FaShoppingCart size={40} />
            </div>
            <h4 className="fw-bold mb-2">Your Cart is Empty</h4>
            <p className="text-muted small mb-4" style={{ maxWidth: "360px" }}>
              Looks like you haven't added anything to your cart yet. Explore our latest arrivals to find premium wear!
            </p>
            <Button
              as={Link}
              to="/"
              variant="primary"
              className="px-4 py-2 fw-bold"
              style={{ borderRadius: "10px" }}
            >
              Explore Collections
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="gy-4">
          {/* Cart Items List */}
          <Col lg={8}>
            <div className="d-flex flex-column gap-3">
              {cart.map((item) => (
                <Card 
                  className="border-0 shadow-sm rounded-4 p-3 bg-white position-relative hover-shadow transition" 
                  key={item._id}
                  style={{ transition: "all 0.3s ease" }}
                >
                  <Card.Body className="p-0">
                    <Row className="align-items-center gy-3">
                      {/* Product Image */}
                      <Col xs={4} sm={3} md={2} className="text-center">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="img-fluid rounded-3 border"
                          style={{ maxHeight: "85px", objectFit: "cover" }}
                        />
                      </Col>

                      {/* Product Info */}
                      <Col xs={8} sm={9} md={4}>
                        {item.product ? (
                          <>
                            <h6 className="fw-bold text-dark mb-1 line-clamp-1">{item.product.name}</h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {item.size && (
                                <span className="badge bg-light text-muted border px-2 py-1 small fw-semibold">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="badge bg-light text-muted border px-2 py-1 small fw-semibold">
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                            <span className="text-primary fw-bold small">₹{item.product.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-danger small fw-semibold">Product is currently unavailable</span>
                        )}
                      </Col>

                      {/* Quantity Controls */}
                      <Col xs={6} md={3} className="d-flex justify-content-start justify-content-md-center">
                        <div 
                          className="d-flex align-items-center justify-content-between border rounded-3 bg-light"
                          style={{ minHeight: "36px", padding: "0 8px", width: "105px" }}
                        >
                          <button
                            type="button"
                            className="btn btn-sm border-0 p-1 text-muted fw-bold"
                            disabled={item.quantity <= 1}
                            onClick={() => decreaseQty(item)}
                          >
                            −
                          </button>
                          <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm border-0 p-1 text-muted fw-bold"
                            disabled={item.quantity >= item.product?.stock}
                            onClick={() => increaseQty(item)}
                          >
                            +
                          </button>
                        </div>
                      </Col>

                      {/* Total Amount & Delete Button */}
                      <Col xs={6} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end gap-3">
                        <div className="text-md-end">
                          <span className="text-muted smaller d-block d-md-none">Subtotal</span>
                          <strong className="text-dark fs-6">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</strong>
                        </div>
                        <Button
                          variant="link"
                          className="text-danger p-2 hover-bg-light rounded-circle"
                          onClick={() => removeFromCart(item._id)}
                          aria-label="Remove item"
                        >
                          <FaTrash size={14} />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          {/* Sticky Summary Card */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 bg-white p-4 position-sticky" style={{ top: "100px" }}>
              <Card.Header className="bg-transparent border-0 p-0 mb-3">
                <h5 className="fw-bold text-dark mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Subtotal</span>
                  <span className="fw-semibold text-dark">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Delivery Charges</span>
                  <span className="fw-semibold text-success">
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="alert alert-warning py-2 px-3 rounded-3 small mb-4" style={{ fontSize: "0.76rem" }}>
                    🎉 Add <b>₹{(1500 - subtotal).toLocaleString()}</b> more to unlock <b>FREE SHIPPING</b>!
                  </div>
                )}
                
                <hr className="my-3" />

                <div className="d-flex justify-content-between align-items-baseline mb-4">
                  <span className="fw-bold text-dark">Total Amount</span>
                  <span className="fw-extrabold text-primary fs-4">₹{total.toLocaleString()}</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 mb-3 shadow-sm btn-checkout"
                  onClick={() => navigate("/checkout")}
                >
                  <span>Proceed to Checkout</span>
                  <FaChevronRight size={12} />
                </Button>

                <div className="d-flex align-items-center justify-content-center gap-2 text-muted smaller text-center">
                  <FaShieldAlt className="text-success" size={13} />
                  <span>Secure 256-bit SSL encrypted payments</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;

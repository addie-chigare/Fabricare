import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge } from "react-bootstrap";
import { FaShippingFast, FaReceipt, FaLock, FaShieldAlt, FaMoneyBillWave, FaPaypal, FaInfoCircle } from "react-icons/fa";
import API from "../../services/api";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
    addressLine: "",
  });

  const [accepted, setAccepted] = useState(false);
  const token = localStorage.getItem("token");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const { data } = await API.get("/address/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSavedAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault);
        if (defaultAddr) {
          setAddress(defaultAddr);
        }
      } catch (err) {
        console.error("Failed to load saved addresses:", err);
      }
    };

    if (token) {
      loadAddresses();
    }
  }, [token]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const placeOrder = async (transactionId = null, e) => {
    if (e) e.preventDefault();

    if (!cart || cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Address verification
    if (!address.fullName.trim() || !address.phone.trim() || !address.pincode.trim() || !address.city.trim() || !address.state.trim() || !address.addressLine.trim()) {
      toast.error("Please fill in all shipping details");
      return;
    }

    const items = cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const subtotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    const deliveryFee = subtotal > 1500 ? 0 : 99;
    const totalAmount = subtotal + deliveryFee;

    try {
      setLoading(true);
      await API.post(
        "/orders/place",
        {
          items,
          totalAmount,
          address,
          paymentMethod,
          transactionId,
          acceptedPolicy: accepted,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Order Placed Successfully!");
      clearCart();
      navigate("/order-success");
    } catch (error) {
      console.error(error.response?.data);
      toast.error(error.response?.data?.message || "Order Placement Failed");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const deliveryFee = subtotal > 1500 ? 0 : 99;
  const totalAmount = subtotal + deliveryFee;

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          className="bg-primary text-white p-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "50px", height: "50px" }}
        >
          <FaShippingFast size={24} />
        </div>
        <div>
          <h2 className="fw-bold mb-0">Checkout Securely</h2>
          <p className="text-muted mb-0 small">Enter details and select a payment method to complete purchase</p>
        </div>
      </div>

      <Row className="gy-4">
        {/* Left Column: Shipping & Policy */}
        <Col lg={7}>
          {/* Saved Addresses Selector */}
          {savedAddresses.length > 0 && (
            <Card className="mb-4 border-0 shadow-sm rounded-4 bg-white p-4">
              <h6 className="fw-bold mb-3 text-dark">Select Saved Address</h6>
              <div className="d-flex flex-column gap-2">
                {savedAddresses.map((addr) => (
                  <div 
                    key={addr._id} 
                    className={`border rounded-3 p-3 transition position-relative cursor-pointer ${
                      address._id === addr._id ? "border-primary bg-light-primary" : "border-light"
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor: address._id === addr._id ? "rgba(99, 102, 241, 0.04)" : "transparent"
                    }}
                    onClick={() => setAddress(addr)}
                  >
                    <Form.Check
                      type="radio"
                      name="addressSelect"
                      id={`addr-${addr._id}`}
                      checked={address._id === addr._id}
                      onChange={() => setAddress(addr)}
                      label={
                        <div style={{ paddingLeft: 8 }}>
                          <span className="fw-bold text-dark">{addr.fullName}</span>
                          <span className="badge bg-light border text-muted ms-2 smaller">{addr.phone}</span>
                          <div className="text-muted small mt-1">{addr.addressLine}</div>
                          <div className="text-muted small fw-semibold">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Shipping Form Card */}
          <Card className="border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark">Shipping Information</h5>
            <Form>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Full Name</Form.Label>
                  <Form.Control
                    placeholder="Receiver's name"
                    name="fullName"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.fullName}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Phone Number</Form.Label>
                  <Form.Control
                    placeholder="e.g. 9876543210"
                    name="phone"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.phone}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Pincode</Form.Label>
                  <Form.Control
                    placeholder="6 digit PIN code"
                    name="pincode"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.pincode}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">City</Form.Label>
                  <Form.Control
                    placeholder="Enter city"
                    name="city"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.city}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">State</Form.Label>
                  <Form.Control
                    placeholder="Enter state"
                    name="state"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.state}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={12} className="mb-1">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Street Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Flat/House No., Street Name, Landmark"
                    name="addressLine"
                    className="py-2.5 rounded-3 border-light bg-light"
                    style={{ fontSize: "0.88rem" }}
                    value={address.addressLine}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Cancellation Policy Container ("best policy") */}
          <Card 
            className="border-0 shadow-sm rounded-4 p-4 mb-4" 
            style={{ 
              backgroundColor: "rgba(99, 102, 241, 0.03)", 
              border: "1px dashed rgba(99, 102, 241, 0.35)" 
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <FaShieldAlt className="text-primary" size={18} />
              <h6 className="fw-bold text-dark mb-0">Fabricare Customer Shield & Policy</h6>
            </div>
            
            <div className="small text-muted mb-3 d-flex flex-column gap-2" style={{ fontSize: "0.82rem", lineHeight: "1.4" }}>
              <div className="d-flex gap-2">
                <span className="text-primary">•</span>
                <span><b>12-Hour Cancellation:</b> Change of mind? Cancel your order within 12 hours from your dashboard for an instant full refund.</span>
              </div>
              <div className="d-flex gap-2">
                <span className="text-primary">•</span>
                <span><b>Zero Handling Penalties:</b> Absolutely no charges are applied on cancellations made before dispatch.</span>
              </div>
              <div className="d-flex gap-2">
                <span className="text-primary">•</span>
                <span><b>Hassle-Free Processing:</b> Once approved, payments are returned directly back to your source within 3 working days.</span>
              </div>
            </div>

            <hr className="my-3 opacity-25" />

            <div className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="policy-switch"
                className="custom-switch fw-bold text-primary small"
                style={{ cursor: "pointer", fontSize: "0.82rem" }}
                label="I read and accept the Fabricare cancellation & refund policy."
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            </div>
          </Card>
        </Col>

        {/* Right Column: Summary & Payment */}
        <Col lg={5}>
          {/* Order Summary Card */}
          <Card className="border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <FaReceipt size={17} className="text-primary" /> 
              <span>Order Summary</span>
              <Badge bg="light-primary" className="text-primary ms-auto smaller">{cart.length} item{cart.length !== 1 ? "s" : ""}</Badge>
            </h5>

            <ListGroup variant="flush" className="mb-3 border-0">
              {cart.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="px-0 d-flex align-items-center justify-content-between border-light"
                >
                  <div className="d-flex align-items-center gap-2">
                    <img 
                      src={item.product?.image} 
                      alt="" 
                      className="rounded border" 
                      style={{ width: "36px", height: "36px", objectFit: "cover" }} 
                    />
                    <div>
                      <span className="fw-semibold text-dark line-clamp-1 small" style={{ maxWidth: "160px" }}>{item.product?.name}</span>
                      <span className="text-muted smaller">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <strong className="text-dark small">₹{(item.product?.price * item.quantity).toLocaleString()}</strong>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="bg-light p-3 rounded-3 mb-2" style={{ fontSize: "0.82rem" }}>
              <div className="d-flex justify-content-between mb-1.5 text-muted">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Delivery Charges</span>
                <span className="text-success">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-baseline px-2 mt-3">
              <span className="fw-bold text-dark">Total Amount</span>
              <strong className="text-primary fs-5">₹{totalAmount.toLocaleString()}</strong>
            </div>
          </Card>

          {/* Secure Payment Options Card */}
          <Card className="border-0 shadow-sm rounded-4 bg-white p-4">
            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
              <FaShieldAlt size={16} className="text-success" />
              <span>Choose Payment Method</span>
            </h5>

            {/* Side-by-side Selectable Payment Cards */}
            <Row className="gx-2 mb-4">
              <Col xs={6}>
                <div 
                  className={`border rounded-3 p-3 text-center transition cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                    paymentMethod === "COD" ? "border-primary bg-light-primary text-primary" : "border-light text-muted"
                  }`}
                  style={{
                    cursor: "pointer",
                    height: "85px",
                    backgroundColor: paymentMethod === "COD" ? "rgba(99, 102, 241, 0.04)" : "transparent"
                  }}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <FaMoneyBillWave size={22} className="mb-2" />
                  <span className="fw-bold small" style={{ fontSize: "0.78rem" }}>Cash On Delivery</span>
                </div>
              </Col>
              <Col xs={6}>
                <div 
                  className={`border rounded-3 p-3 text-center transition cursor-pointer d-flex flex-column align-items-center justify-content-center ${
                    paymentMethod === "PayPal" ? "border-primary bg-light-primary text-primary" : "border-light text-muted"
                  }`}
                  style={{
                    cursor: "pointer",
                    height: "85px",
                    backgroundColor: paymentMethod === "PayPal" ? "rgba(99, 102, 241, 0.04)" : "transparent"
                  }}
                  onClick={() => setPaymentMethod("PayPal")}
                >
                  <FaPaypal size={22} className="mb-2 text-primary" />
                  <span className="fw-bold small" style={{ fontSize: "0.78rem" }}>Pay with PayPal</span>
                </div>
              </Col>
            </Row>

            {/* Action Payment Controls */}
            {paymentMethod === "COD" && (
              <Button
                className="w-100 fw-bold py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={!accepted || loading}
                onClick={() => placeOrder()}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <FaLock size={12} />
                )}
                <span>{loading ? "Processing..." : "Place Order (COD)"}</span>
              </Button>
            )}

            {paymentMethod === "PayPal" && (
              <div>
                {!accepted && (
                  <div className="alert alert-danger py-2.5 px-3 rounded-3 small d-flex align-items-center gap-2 mb-3" style={{ fontSize: "0.75rem" }}>
                    <FaInfoCircle size={13} className="flex-shrink-0" />
                    <span>Please accept the policy switch above to enable PayPal buttons.</span>
                  </div>
                )}
                <div style={{ opacity: accepted ? 1 : 0.45, pointerEvents: accepted ? "auto" : "none" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", height: 40 }}
                    disabled={!accepted}
                    createOrder={(data, actions) => {
                      let totalUSD = (totalAmount / 83).toFixed(2);
                      if (Number(totalUSD) < 1) {
                        totalUSD = "1.00";
                      }
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: totalUSD,
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order.capture();
                      const transactionId = details.purchase_units[0].payments.captures[0].id;
                      placeOrder(transactionId);
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;

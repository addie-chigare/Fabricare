import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
} from "react-bootstrap";
import { FaShippingFast, FaReceipt, FaLock } from "react-icons/fa";

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
        const { data } = await axios.get(
          "http://localhost:8000/api/v1/address/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setSavedAddresses(data);

        const defaultAddr = data.find((a) => a.isDefault);

        if (defaultAddr) {
          setAddress(defaultAddr);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadAddresses();
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

    const items = cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const totalAmount = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/api/v1/orders/place",
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
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Order Placement Failed");
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="fw-bold mb-0">Checkout</h2>
          <p className="text-muted mb-0">
            Complete your details to place the order
          </p>
        </div>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <Card
          className="mb-3 border-0 shadow-sm"
          style={{ borderRadius: "20px" }}
        >
          <Card.Body>
            <h6 className="fw-bold mb-3">Select Saved Address</h6>

            {savedAddresses.map((addr) => (
              <div key={addr._id} className="border rounded p-3 mb-2">
                <Form.Check
                  type="radio"
                  name="addressSelect"
                  label={
                    <div>
                      <b>{addr.fullName}</b>
                      <div>{addr.addressLine}</div>
                      <div>
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div>{addr.phone}</div>
                    </div>
                  }
                  onChange={() => setAddress(addr)}
                  checked={address._id === addr._id}
                />
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      <Row className="gy-4">
        {/* Shipping Details */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold">Shipping Information</h5>
            </Card.Header>

            <Card.Body className="p-4">
              <Form>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Control
                      placeholder="Full Name"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Control
                      placeholder="Phone"
                      name="phone"
                      value={address.phone}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Control
                      placeholder="Pincode"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Control
                      placeholder="City"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Control
                      placeholder="State"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                    />
                  </Col>

                  <Col md={12} className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Address Line"
                      name="addressLine"
                      value={address.addressLine}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Form.Check
                  type="checkbox"
                  label="I accept cancellation policy"
                  onChange={(e) => setAccepted(e.target.checked)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Order Summary */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
            <Card.Header className="bg-transparent border-0">
              <h5 className="fw-bold">
                <FaReceipt /> Order Summary
              </h5>
            </Card.Header>

            <Card.Body>
              <ListGroup variant="flush">
                {cart.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between"
                  >
                    <div>
                      {item.product.name} × {item.quantity}
                    </div>

                    <div>₹{item.product.price * item.quantity}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Total</span>

                <b>
                  ₹
                  {cart.reduce(
                    (acc, item) => acc + item.product.price * item.quantity,
                    0,
                  )}
                </b>
              </div>

              <hr />

              <h6 className="fw-bold">Payment Method</h6>

              <Form.Check
                type="radio"
                label="Cash On Delivery (COD)"
                name="payment"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              <Form.Check
                type="radio"
                label="Pay with PayPal"
                name="payment"
                value="PayPal"
                checked={paymentMethod === "PayPal"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />

              {paymentMethod === "COD" && (
                <Button
                  className="w-100 mt-3"
                  disabled={!accepted || loading}
                  onClick={() => placeOrder()}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <FaLock className="me-2" />
                  )}
                  {loading ? " Processing..." : " Place Order (COD)"}
                </Button>
              )}

              {paymentMethod === "PayPal" && (
                <div className="mt-3">
                  {!accepted && (
                    <div className="text-danger small mb-2 border border-danger p-2 rounded bg-light">
                      * Please accept the cancellation policy (checkbox on the left) to enable PayPal payment.
                    </div>
                  )}
                  <div style={{ opacity: accepted ? 1 : 0.5, pointerEvents: accepted ? "auto" : "none" }}>
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      disabled={!accepted}
                      createOrder={(data, actions) => {
                        const totalINR = cart.reduce(
                          (acc, item) => acc + item.product.price * item.quantity,
                          0,
                        );

                        let totalUSD = (totalINR / 83).toFixed(2);

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

                        const transactionId =
                          details.purchase_units[0].payments.captures[0].id;

                        placeOrder(transactionId);
                      }}
                    />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;

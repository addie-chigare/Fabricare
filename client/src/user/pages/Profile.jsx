import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Nav } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import {
  FaUser,
  FaLock,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaCheck,
  FaCalendarAlt,
  FaPhone,
  FaShippingFast,
  FaHeart,
  FaClock
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { addToCart } = useCart();

  // General States
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Tab 1: Profile Details State
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: ""
  });

  // Tab 2: Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Tab 3: Saved Addresses State
  const [addresses, setAddresses] = useState([]);
  const [editAddressId, setEditAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  // Tab 4: Orders State
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All");

  // Tab 5: Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch Current User Profile
  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data?.user) {
        setUserData({
          name: data.user.name || "",
          username: data.user.username || "",
          email: data.user.email || ""
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load user profile");
    }
  }, [token]);

  // Load Saved Addresses
  const loadAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/address/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Load Order History
  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/orders/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Load Wishlist detailed products
  const loadWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:8000/api/v1/auth/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // Initial Load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
    loadAddresses();
    loadOrders();
    loadWishlist();
  }, [token, navigate, loadProfile, loadAddresses, loadOrders, loadWishlist]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setMessage("");
  };

  // 1️⃣ Handle Profile Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/auth/profile",
        { name: userData.name, username: userData.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Profile updated successfully!");
      setUserData({
        ...userData,
        name: res.data.user.name,
        username: res.data.user.username
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  // 3️⃣ Address Management Functions
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (editAddressId) {
        await axios.put(
          `http://localhost:8000/api/v1/address/update/${editAddressId}`,
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Address updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8000/api/v1/address/add",
          addressForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Address added successfully!");
      }

      loadAddresses();
      setAddressForm({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false
      });
      setEditAddressId(null);
    } catch (err) {
      setError("Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    });
    setEditAddressId(addr._id);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setError("");
    setMessage("");
    try {
      await axios.delete(`http://localhost:8000/api/v1/address/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Address deleted successfully!");
      loadAddresses();
    } catch (err) {
      setError("Failed to delete address.");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    setError("");
    setMessage("");
    try {
      await axios.put(
        `http://localhost:8000/api/v1/address/default/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Default address set successfully!");
      loadAddresses();
    } catch (err) {
      setError("Failed to set default address.");
    }
  };

  // 4️⃣ Order Management Functions
  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setError("");
    setMessage("");
    try {
      await axios.put(
        `http://localhost:8000/api/v1/orders/cancel/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Order cancelled successfully!");
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  // Filter Orders logic
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "All") return true;
    if (orderFilter === "Active") {
      return order.status === "Pending" || order.status === "Shipped";
    }
    return order.status === orderFilter;
  });

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  // Animation Variant
  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <Container className="py-5" style={{ minHeight: "80vh" }}>
      <h2 className="fw-bold mb-4 text-center">My Account Dashboard</h2>

      {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
      {message && <Alert variant="success" className="py-2 small">{message}</Alert>}

      <Row className="gy-4">
        {/* Left Sidebar Menu */}
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white p-3">
            <div className="text-center py-3 border-bottom mb-3">
              <div 
                className="bg-primary text-white mx-auto d-flex align-items-center justify-content-center rounded-circle mb-2"
                style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}
              >
                {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
              </div>
              <h5 className="fw-bold mb-0 text-dark">{userData.name || "User"}</h5>
              <small className="text-muted">@{userData.username}</small>
            </div>
            <Nav className="flex-column gap-2" variant="pills">
              <Nav.Link 
                active={activeTab === "details"}
                onClick={() => handleTabChange("details")}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaUser /> Personal Details
              </Nav.Link>
              <Nav.Link 
                active={activeTab === "password"}
                onClick={() => handleTabChange("password")}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaLock /> Change Password
              </Nav.Link>
              <Nav.Link 
                active={activeTab === "addresses"}
                onClick={() => handleTabChange("addresses")}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaMapMarkerAlt /> Saved Addresses
              </Nav.Link>
              <Nav.Link 
                active={activeTab === "orders"}
                onClick={() => handleTabChange("orders")}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaBoxOpen /> Order History
              </Nav.Link>
              <Nav.Link 
                active={activeTab === "wishlist"}
                onClick={() => handleTabChange("wishlist")}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaHeart /> My Wishlist
              </Nav.Link>
              <hr className="my-2 opacity-25" />
              <Nav.Link 
                onClick={handleLogout}
                className="d-flex align-items-center gap-2 fw-semibold cursor-pointer text-start text-danger py-2 px-3"
                style={{ borderRadius: "10px" }}
              >
                <FaSignOutAlt /> Logout
              </Nav.Link>
            </Nav>
          </Card>
        </Col>

        {/* Right Dashboard Contents */}
        <Col md={9}>
          <Card className="border-0 shadow-sm rounded-4 bg-white p-4" style={{ minHeight: "450px" }}>
            <AnimatePresence mode="wait">
              {/* Tab 1: Personal Info */}
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h4 className="fw-bold mb-4">Edit Personal Information</h4>
                  <Form onSubmit={handleProfileSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        required
                        className="bg-light border-0 py-2 rounded-3"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={userData.username}
                        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                        required
                        className="bg-light border-0 py-2 rounded-3"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-muted">Email Address (Cannot be changed)</Form.Label>
                      <Form.Control
                        type="email"
                        value={userData.email}
                        disabled
                        className="bg-light border-0 py-2 rounded-3 text-muted"
                      />
                    </Form.Group>
                    <Button type="submit" disabled={loading} className="px-4 py-2 fw-semibold rounded-3">
                      {loading ? <Spinner size="sm" /> : "Save Changes"}
                    </Button>
                  </Form>
                </motion.div>
              )}

              {/* Tab 2: Change Password */}
              {activeTab === "password" && (
                <motion.div
                  key="password"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h4 className="fw-bold mb-4">Change Password</h4>
                  <Form onSubmit={handlePasswordSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        placeholder="Enter current password"
                        className="bg-light border-0 py-2 rounded-3"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted">New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        placeholder="Minimum 6 characters"
                        className="bg-light border-0 py-2 rounded-3"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-muted">Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        placeholder="Re-enter new password"
                        className="bg-light border-0 py-2 rounded-3"
                      />
                    </Form.Group>
                    <Button type="submit" disabled={loading} variant="success" className="px-4 py-2 fw-semibold rounded-3">
                      {loading ? <Spinner size="sm" /> : "Update Password"}
                    </Button>
                  </Form>
                </motion.div>
              )}

              {/* Tab 3: Saved Addresses */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Saved Addresses</h4>
                    {editAddressId && (
                      <Button variant="outline-secondary" size="sm" onClick={() => {
                        setEditAddressId(null);
                        setAddressForm({
                          fullName: "",
                          phone: "",
                          addressLine: "",
                          city: "",
                          state: "",
                          pincode: "",
                          isDefault: false
                        });
                      }} className="rounded-3">
                        Cancel Edit
                      </Button>
                    )}
                  </div>

                  <Row className="gy-4">
                    {/* Left: Address Input Form */}
                    <Col lg={5} className="border-end border-light pr-lg-4">
                      <h6 className="fw-bold mb-3 text-muted">{editAddressId ? "Edit Address" : "Add New Address"}</h6>
                      <Form onSubmit={handleSaveAddress}>
                        <Form.Group className="mb-2">
                          <Form.Control
                            placeholder="Full Name"
                            name="fullName"
                            value={addressForm.fullName}
                            onChange={handleAddressChange}
                            required
                            className="bg-light border-0 py-2 rounded-3 small"
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Control
                            placeholder="Phone Number"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressChange}
                            required
                            className="bg-light border-0 py-2 rounded-3 small"
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Control
                            placeholder="Address details (street, area)"
                            name="addressLine"
                            value={addressForm.addressLine}
                            onChange={handleAddressChange}
                            required
                            className="bg-light border-0 py-2 rounded-3 small"
                          />
                        </Form.Group>
                        <Row className="g-2 mb-2">
                          <Col xs={6}>
                            <Form.Control
                              placeholder="City"
                              name="city"
                              value={addressForm.city}
                              onChange={handleAddressChange}
                              required
                              className="bg-light border-0 py-2 rounded-3 small"
                            />
                          </Col>
                          <Col xs={6}>
                            <Form.Control
                              placeholder="State"
                              name="state"
                              value={addressForm.state}
                              onChange={handleAddressChange}
                              required
                              className="bg-light border-0 py-2 rounded-3 small"
                            />
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Control
                            placeholder="Pincode"
                            name="pincode"
                            value={addressForm.pincode}
                            onChange={handleAddressChange}
                            required
                            className="bg-light border-0 py-2 rounded-3 small"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Set as default address"
                            name="isDefault"
                            checked={addressForm.isDefault}
                            onChange={handleAddressChange}
                            className="small"
                          />
                        </Form.Group>
                        <Button type="submit" disabled={loading} className="w-100 py-2 fw-semibold rounded-3 btn-sm">
                          {loading ? <Spinner size="sm" /> : editAddressId ? "Update Address" : "Save Address"}
                        </Button>
                      </Form>
                    </Col>

                    {/* Right: Address Cards List */}
                    <Col lg={7}>
                      <h6 className="fw-bold mb-3 text-muted">Addresses Book</h6>
                      {addresses.length === 0 ? (
                        <div className="text-center py-4 text-muted small bg-light rounded-4">
                          No saved addresses found. Add one on the left.
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3 overflow-y-auto" style={{ maxHeight: "360px" }}>
                          {addresses.map((addr) => (
                            <Card 
                              key={addr._id} 
                              className={`border-0 p-3 rounded-4 shadow-sm position-relative ${addr.isDefault ? "bg-light-blue" : "bg-light"}`}
                              style={{ borderLeft: addr.isDefault ? "4px solid #3b82f6" : "none" }}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="fw-bold mb-1 small">{addr.fullName}</h6>
                                  <div className="text-muted smaller mb-1"><FaPhone size={10} className="me-1" /> {addr.phone}</div>
                                  <div className="text-dark small" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                                    {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                                  </div>
                                </div>
                                <div className="d-flex gap-1">
                                  <Button variant="link" size="sm" className="p-1 text-primary" onClick={() => handleEditAddressClick(addr)}>
                                    <FaEdit size={14} />
                                  </Button>
                                  <Button variant="link" size="sm" className="p-1 text-danger" onClick={() => handleDeleteAddress(addr._id)}>
                                    <FaTrash size={14} />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2 d-flex align-items-center justify-content-between">
                                {addr.isDefault ? (
                                  <Badge bg="primary" className="py-1 px-2 rounded-pill smaller"><FaCheck size={8} /> Default</Badge>
                                ) : (
                                  <button 
                                    type="button" 
                                    onClick={() => handleSetDefaultAddress(addr._id)}
                                    className="btn btn-link p-0 text-decoration-none smaller fw-semibold text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    Set Default
                                  </button>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </Col>
                  </Row>
                </motion.div>
              )}

              {/* Tab 4: Order History & Tracking */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
                    <h4 className="fw-bold mb-0">My Orders History</h4>
                    <div className="d-flex gap-1 bg-light p-1 rounded-pill" style={{ width: "fit-content" }}>
                      {["All", "Active", "Delivered", "Cancelled"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setOrderFilter(opt)}
                          className={`btn rounded-pill px-3 py-1 btn-sm fw-semibold ${orderFilter === opt ? "btn-primary shadow-sm" : "btn-link text-muted text-decoration-none"}`}
                          style={{ fontSize: "0.75rem" }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-5 text-muted bg-light rounded-4">
                      <FaBoxOpen size={40} className="mb-2 opacity-50" />
                      <p className="mb-0 small">No {orderFilter !== "All" ? orderFilter.toLowerCase() : ""} orders found.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
                      {filteredOrders.map((order) => (
                        <Card key={order._id} className="border border-light shadow-sm rounded-4 overflow-hidden bg-white">
                          <Card.Header className="bg-light border-0 py-2 px-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div className="small text-uppercase fw-bold text-muted" style={{ fontSize: "0.7rem" }}>
                              Order ID: <span className="text-dark">#{order._id.slice(-8)}</span> | <FaCalendarAlt size={10} className="me-1" /> {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                            <div className="d-flex gap-1 align-items-center">
                              <Badge 
                                bg={
                                  order.status === "Pending" ? "primary" :
                                  order.status === "Shipped" ? "warning" :
                                  order.status === "Delivered" ? "success" : "danger"
                                }
                                className="py-1 px-2 rounded-3 smaller"
                              >
                                {order.status}
                              </Badge>
                              <Badge 
                                bg={order.paymentStatus === "Completed" ? "success" : "warning"}
                                className="py-1 px-2 rounded-3 smaller text-dark"
                              >
                                Pay: {order.paymentStatus}
                              </Badge>
                            </div>
                          </Card.Header>
                          <Card.Body className="p-3">
                            <Row className="gy-3">
                              {/* Left: Items list */}
                              <Col lg={7} className="border-end border-light pr-3">
                                {order.items.map((item) => (
                                  <div key={item._id} className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom border-light">
                                    <img 
                                      src={item.product?.image} 
                                      alt={item.product?.name} 
                                      style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px" }} 
                                    />
                                    <div className="flex-grow-1">
                                      <div className="fw-bold small" style={{ fontSize: "0.8rem" }}>{item.product?.name}</div>
                                      <small className="text-muted smaller">₹{item.product?.price} × {item.quantity}</small>
                                    </div>
                                    <div className="fw-semibold small">₹{item.product?.price * item.quantity}</div>
                                  </div>
                                ))}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                  <span className="small text-muted fw-bold">Total:</span>
                                  <span className="fw-bold text-primary">₹{order.totalAmount}</span>
                                </div>
                              </Col>
                              
                              {/* Right: Shipping details and Action */}
                              <Col lg={5} className="small d-flex flex-column justify-content-between">
                                <div>
                                  <div className="fw-bold text-muted mb-1 text-uppercase smaller"><FaShippingFast size={10} className="me-1 text-primary" /> Delivery Info</div>
                                  <div className="fw-semibold smaller">{order.address?.fullName}</div>
                                  <div className="text-muted smaller" style={{ fontSize: "0.75rem", lineHeight: "1.3" }}>
                                    {order.address?.addressLine}, {order.address?.city}, {order.address?.pincode}
                                  </div>
                                </div>

                                {/* Tracking dates */}
                                <div className="mt-2 pt-2 border-top border-light smaller">
                                  {order.status === "Shipped" && order.shippedAt && (
                                    <div className="text-warning"><FaClock size={10} /> Shipped: {new Date(order.shippedAt).toLocaleDateString()}</div>
                                  )}
                                  {order.status === "Delivered" && order.deliveredAt && (
                                    <div className="text-success"><FaCheck size={10} /> Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</div>
                                  )}
                                </div>

                                {order.status === "Pending" && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    onClick={() => handleCancelOrder(order._id)}
                                    className="w-100 mt-2 py-1 btn-sm rounded-3 fw-bold"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    Cancel Order
                                  </Button>
                                )}
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            {/* Tab 5: Wishlist */}
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h4 className="fw-bold mb-4">My Wishlist</h4>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light rounded-4">
                    <FaHeart size={40} className="mb-2 text-danger opacity-50" />
                    <p className="mb-0 small">Your wishlist is empty. Explore products to add items.</p>
                    <Button as={Link} to="/products" variant="primary" size="sm" className="mt-3 rounded-pill px-4">
                      Shop Products
                    </Button>
                  </div>
                ) : (
                  <Row className="gy-4">
                    {wishlistItems.map((item) => {
                      if (!item) return null;
                      const discountVal = item.discount || 0;
                      const sellingPrice = discountVal > 0 
                        ? item.price - (item.price * discountVal) / 100 
                        : item.price;
                      return (
                        <Col key={item._id} xs={12} sm={6} md={4} lg={4}>
                          <Card className="h-100 border border-light shadow-sm rounded-4 overflow-hidden bg-white">
                            <div className="position-relative bg-light text-center p-3" style={{ height: "150px" }}>
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-100 w-100 object-fit-contain" 
                              />
                              <button 
                                type="button" 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const res = await axios.post("http://localhost:8000/api/v1/auth/wishlist/toggle", 
                                      { productId: item._id },
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    // Remove locally instantly
                                    setWishlistItems(prev => prev.filter(w => w._id !== item._id));
                                    
                                    // Update local storage user state
                                    const user = JSON.parse(localStorage.getItem("user")) || {};
                                    user.wishlist = res.data.wishlist;
                                    localStorage.setItem("user", JSON.stringify(user));
                                  } catch (err) {
                                    console.error("Remove from wishlist error", err);
                                  }
                                }}
                                className="btn btn-link position-absolute end-0 top-0 m-2 p-1 bg-white rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                                style={{ width: "28px", height: "28px" }}
                              >
                                <FaTrash size={12} className="text-danger" />
                              </button>
                            </div>
                            <Card.Body className="p-3 d-flex flex-column">
                              <small className="text-uppercase tracking-wider text-muted mb-1 fw-bold" style={{ fontSize: "0.6rem" }}>
                                {item.brand || "Fabricare Signature"}
                              </small>
                              <Card.Title className="fw-bold mb-1 text-truncate" style={{ fontSize: "0.85rem" }}>
                                {item.name}
                              </Card.Title>
                              <div className="d-flex align-items-baseline gap-2 mb-3">
                                <span className="fw-bold text-primary small">₹{sellingPrice.toLocaleString()}</span>
                                {discountVal > 0 && (
                                  <span className="text-muted text-decoration-line-through smaller">₹{item.price.toLocaleString()}</span>
                                )}
                              </div>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => {
                                  const userObj = JSON.parse(localStorage.getItem("user"));
                                  if (userObj?.role === "admin") {
                                    alert("Admins cannot purchase products");
                                    return;
                                  }
                                  addToCart(item);
                                  alert("✨ Added to cart!");
                                }}
                                className="w-100 py-2 btn-sm rounded-3 mt-auto fw-bold"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Add To Cart
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;

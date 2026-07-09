import { useEffect, useState, useCallback } from "react";
import { FaCreditCard } from "react-icons/fa";
import { Pagination } from "react-bootstrap";
import axios from "axios";
import { Container, Card, Row, Col, Badge, Button } from "react-bootstrap";
import { generateProductInvoice } from "../../services/invoiceHelper";
import {
  FaBox,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [settings, setSettings] = useState(null);
  const ordersPerPage = 10;
  const token = localStorage.getItem("token");

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/v1/orders/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
    const fetchSettings = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings in Orders:", err);
      }
    };
    fetchSettings();
  }, [loadOrders]);

  const cancelOrder = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/orders/cancel/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Order Cancelled");
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Cannot cancel order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;

    // Active Orders
    if (filter === "Active") {
      return order.status === "Pending" || order.status === "Confirmed" || order.status === "Shipped";
    }

    // Delivered Orders
    if (filter === "Delivered") {
      return order.status === "Delivered";
    }

    // Canceled Orders
    if (filter === "Cancelled") {
      return order.status === "Cancelled";
    }

    return true;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const filterOptions = ["All", "Active", "Delivered", "Cancelled"];

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary text-white p-3 rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "60px" }}
          >
            <FaBox size={28} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">My Orders</h2>
            <p className="text-muted mb-0">
              Track and manage your order history
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className="bg-light p-1 rounded-pill d-flex shadow-sm"
          style={{ border: "1px solid #f1f5f9" }}
        >
          {filterOptions.map((opt) => (
            <Button
              key={opt}
              variant={filter === opt ? "primary" : "link"}
              className={`rounded-pill px-4 fw-bold text-decoration-none transition-all ${filter === opt ? "shadow-sm" : "text-muted"}`}
              onClick={() => setFilter(opt)}
              size="sm"
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card
          className="border-0 shadow-sm text-center py-5"
          style={{ borderRadius: "20px" }}
        >
          <Card.Body>
            <div className="text-muted mb-3">
              <FaBox size={48} className="opacity-25" />
            </div>
            <h4 className="fw-bold">
              No {filter !== "All" ? filter : ""} Orders Found
            </h4>
            <p className="text-muted">
              You haven&apos;t placed any {filter.toLowerCase()} orders yet.
            </p>
            <Button
              variant="primary"
              onClick={() => setFilter("All")}
              className="rounded-pill mt-2"
            >
              View All Orders
            </Button>
          </Card.Body>
        </Card>
      ) : (
        currentOrders.map((order) => (
          <Card
            key={order._id}
            className="border-0 shadow-sm mb-4"
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            <Card.Header className="bg-light border-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-4 text-muted small text-uppercase fw-bold">
                <div>
                  Order ID:{" "}
                  <span className="text-dark">#{order._id.slice(-8)}</span>
                </div>
                <div>
                  <FaCalendarAlt className="me-1" />{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Badge
                  bg={
                    order.status === "Pending"
                      ? "primary"
                      : order.status === "Confirmed"
                        ? "info"
                        : order.status === "Shipped"
                          ? "warning"
                          : order.status === "Delivered"
                            ? "success"
                            : "danger"
                  }
                  className="px-3 py-2"
                  style={{ borderRadius: "8px" }}
                >
                  Order: {order.status}
                </Badge>
                <Badge
                  bg={
                    order.paymentStatus === "Completed"
                      ? "success"
                      : order.paymentStatus === "Refunded"
                        ? "info"
                        : order.paymentStatus === "Failed"
                          ? "danger"
                          : "warning"
                  }
                  className="px-3 py-2 text-dark"
                  style={{ borderRadius: "8px" }}
                >
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
              <div className="small mt-2 text-muted">
                {order.status === "Shipped" && order.shippedAt && (
                  <div>
                    📦 Shipped on:{" "}
                    {new Date(order.shippedAt).toLocaleDateString()}
                  </div>
                )}

                {order.status === "Delivered" && order.deliveredAt && (
                  <div className="text-success">
                    🚚 Delivered on:{" "}
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </div>
                )}

                {order.status === "Cancelled" && order.cancelledAt && (
                  <div className="text-danger">
                    ❌ Cancelled on:{" "}
                    {new Date(order.cancelledAt).toLocaleDateString()}
                  </div>
                )}

                {order.paymentStatus === "Refunded" && (
                  <div className="text-info fw-bold mt-1">
                    💸 Refunded: ₹{order.totalAmount.toLocaleString()} returned to your PayPal account.
                  </div>
                )}
              </div>
            </Card.Header>
            <div className="px-4 pb-2 small">
              {order.status === "Shipped" && order.shippedAt && (
                <div className="text-warning">
                  📦 Shipped on:{" "}
                  {new Date(order.shippedAt).toLocaleDateString()}
                </div>
              )}

              {order.status === "Delivered" && order.deliveredAt && (
                <div className="text-success">
                  🚚 Delivered on:{" "}
                  {new Date(order.deliveredAt).toLocaleDateString()}
                </div>
              )}

              {order.status === "Cancelled" && order.cancelledAt && (
                <div className="text-danger">
                  ❌ Cancelled on:{" "}
                  {new Date(order.cancelledAt).toLocaleDateString()}
                </div>
              )}

              {order.paymentStatus === "Refunded" && (
                <div className="text-info fw-bold">
                  💸 Refunded: ₹{order.totalAmount.toLocaleString()} returned to your PayPal account.
                </div>
              )}
            </div>
            <Card.Body className="p-4">
              <Row className="gy-4">
                {/* Left Column: Products */}
                <Col lg={8}>
                  <h6 className="fw-bold mb-3 text-uppercase small text-muted">
                    Order Items
                  </h6>
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-light"
                    >
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                        className="shadow-sm"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{item.product?.name}</h6>
                        <div className="text-muted small">
                          ₹{item.product?.price.toLocaleString()} ×{" "}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="fw-bold text-primary">
                        ₹
                        {(item.product?.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted small">Total Amount</div>
                    <h4 className="fw-bold text-primary mb-0">
                      ₹{order.totalAmount.toLocaleString()}
                    </h4>
                  </div>
                </Col>

                {/* Right Column: Shipping Address */}
                <Col lg={4}>
                  <div
                    className="h-100 p-3 bg-light rounded-4"
                    style={{ border: "1px solid #f1f5f9" }}
                  >
                    <h6 className="fw-bold mb-3 text-uppercase small text-muted d-flex align-items-center gap-2">
                      <FaMapMarkerAlt className="text-primary" /> Shipping
                      Address
                    </h6>
                    <div className="mb-3">
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <FaUser className="text-muted mt-1" size={14} />
                        <div className="fw-bold">{order.address?.fullName}</div>
                      </div>
                      <div className="d-flex align-items-start gap-2 mb-3">
                        <FaPhone className="text-muted mt-1" size={14} />
                        <div className="text-muted small">
                          {order.address?.phone}
                        </div>
                      </div>

                      <div className="d-flex align-items-start gap-2 mb-3">
                        <FaMapMarkerAlt className="text-muted mt-1" size={14} />
                        <div className="text-muted small lh-base">
                          {order.address?.addressLine},<br />
                          {order.address?.city}, {order.address?.state} -{" "}
                          {order.address?.pincode}
                        </div>
                      </div>

                      <hr className="my-3 opacity-25" />

                      <h6 className="fw-bold mb-3 text-uppercase small text-muted d-flex align-items-center gap-2">
                        <FaCreditCard className="text-primary" /> Payment
                        Details
                      </h6>

                      <div className="mb-2 small">
                        <strong>Payment Method:</strong> {order.paymentMethod}
                      </div>

                      <div className="mb-2 small">
                        <strong>Payment Status:</strong>{" "}
                        <span className={
                          order.paymentStatus === "Completed" ? "text-success fw-bold" :
                          order.paymentStatus === "Refunded" ? "text-info fw-bold" :
                          order.paymentStatus === "Failed" ? "text-danger fw-bold" : "text-warning fw-bold"
                        }>
                          {order.paymentStatus}
                        </span>
                      </div>

                      <div className="mb-0 small text-break">
                        <strong>Transaction ID:</strong>{" "}
                        {order.transactionId ? order.transactionId : "N/A"}
                      </div>
                    </div>

                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100 mt-2 fw-bold py-2"
                        onClick={() => cancelOrder(order._id)}
                        style={{ borderRadius: "10px" }}
                      >
                        Cancel Order
                      </Button>
                    )}

                    {order.status === "Delivered" && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 mt-2 fw-bold py-2"
                        onClick={() => generateProductInvoice(order, settings)}
                        style={{ borderRadius: "10px" }}
                      >
                        Print Invoice
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      )}

      {totalPages > 1 && (
        <div className="d-flex flex-column align-items-center mt-4">
          <span className="small text-muted mb-2 fw-medium">
            Page {currentPage} &rarr; Orders {(currentPage - 1) * ordersPerPage + 1}&ndash;{Math.min(currentPage * ordersPerPage, filteredOrders.length)}
          </span>
          <Pagination>
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            />

            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index}
                active={currentPage === index + 1}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default Orders;

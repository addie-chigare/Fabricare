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

// Groups a list of orders into labeled date buckets: Today, Yesterday,
// This week, This month, and then "Month Year" for anything older.
const groupOrdersByDate = (ordersList) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups = [];
  const groupIndex = {};

  const pushToGroup = (label, order) => {
    if (!(label in groupIndex)) {
      groupIndex[label] = groups.length;
      groups.push({ label, orders: [] });
    }
    groups[groupIndex[label]].orders.push(order);
  };

  ordersList.forEach((order) => {
    const created = new Date(order.createdAt);
    let label;

    if (created >= startOfToday) {
      label = "Today";
    } else if (created >= startOfYesterday) {
      label = "Yesterday";
    } else if (created >= startOfWeek) {
      label = "This week";
    } else if (created >= startOfMonth) {
      label = "This month";
    } else {
      label = created.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }

    pushToGroup(label, order);
  });

  return groups;
};

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

  const orderGroups = groupOrdersByDate(currentOrders);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const filterOptions = ["All", "Active", "Delivered", "Cancelled"];

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  return (
    <Container className="orders-page py-4 py-md-5 px-3 px-sm-4">
      <style>{`
        .orders-page {
          max-width: 1140px;
        }

        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .orders-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .orders-icon-badge {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }

        .filter-tabs {
          display: flex;
          gap: 2px;
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
          max-width: 100%;
        }
        .filter-tabs::-webkit-scrollbar {
          display: none;
        }
        .filter-tabs .btn {
          white-space: nowrap;
          flex-shrink: 0;
        }

        .order-date-group {
          margin-bottom: 1.75rem;
        }

        .order-date-group-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 0.9rem;
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--bs-body-bg, #fff);
          padding: 4px 0;
        }

        .order-date-group-label span {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6c757d;
          white-space: nowrap;
        }

        .order-date-group-line {
          flex-grow: 1;
          height: 1px;
          background: #e9ecef;
        }

        .order-card-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .order-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 20px;
        }

        .order-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .order-item-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .order-item-img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .order-item-info {
          flex-grow: 1;
          min-width: 0;
        }

        .order-item-name {
          overflow-wrap: anywhere;
        }

        .order-item-price {
          flex-shrink: 0;
          text-align: right;
        }

        .pagination-wrap {
          overflow-x: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pagination-wrap::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 767.98px) {
          .orders-header {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-tabs {
            width: 100%;
          }
          .filter-tabs .btn {
            padding-left: 14px !important;
            padding-right: 14px !important;
            font-size: 0.85rem;
          }
          .order-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .order-item-img {
            width: 60px;
            height: 60px;
          }
          .order-item-name {
            font-size: 0.92rem;
          }
        }

        @media (max-width: 575.98px) {
          .orders-icon-badge {
            width: 46px;
            height: 46px;
          }
          .orders-title-row h2 {
            font-size: 1.3rem;
          }
        }
      `}</style>

      <div className="orders-header">
        <div className="orders-title-row">
          <div
            className="bg-primary text-white orders-icon-badge rounded-circle d-flex align-items-center justify-content-center"
          >
            <FaBox size={24} />
          </div>
          <div>
            <h2 className="fw-bold mb-0">My Orders</h2>
            <p className="text-muted mb-0 small">
              Track and manage your order history
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className="bg-light p-1 rounded-pill shadow-sm filter-tabs"
          style={{ border: "1px solid #f1f5f9" }}
        >
          {filterOptions.map((opt) => (
            <Button
              key={opt}
              variant={filter === opt ? "primary" : "link"}
              className={`rounded-pill px-4 fw-bold text-decoration-none ${filter === opt ? "shadow-sm" : "text-muted"}`}
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
        orderGroups.map((group) => (
          <div className="order-date-group" key={group.label}>
            <div className="order-date-group-label">
              <span>{group.label}</span>
              <div className="order-date-group-line" />
            </div>

            {group.orders.map((order) => (
              <Card
                key={order._id}
                className="border-0 shadow-sm mb-4"
                style={{ borderRadius: "20px", overflow: "hidden" }}
              >
                <Card.Header className="bg-light border-0 py-3 px-3 px-sm-4">
                  <div className="order-card-header">
                    <div className="order-meta text-muted small text-uppercase fw-bold">
                      <div>
                        Order ID:{" "}
                        <span className="text-dark">#{order._id.slice(-8)}</span>
                      </div>
                      <div>
                        <FaCalendarAlt className="me-1" />{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="order-badges">
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

                <Card.Body className="p-3 p-sm-4">
                  <Row className="gy-4">
                    {/* Left Column: Products */}
                    <Col lg={8}>
                      <h6 className="fw-bold mb-3 text-uppercase small text-muted">
                        Order Items
                      </h6>
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="order-item-row mb-3 pb-3 border-bottom border-light"
                        >
                          <img
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="order-item-img shadow-sm"
                          />
                          <div className="order-item-info">
                            <h6 className="mb-1 fw-bold order-item-name">
                              {item.product?.name}
                            </h6>
                            <div className="text-muted small">
                              ₹{item.product?.price.toLocaleString()} ×{" "}
                              {item.quantity}
                            </div>
                          </div>
                          <div className="fw-bold text-primary order-item-price">
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
                        <h6 className="fw-bold mb-2 text-uppercase small text-muted d-flex align-items-center gap-2">
                          <FaMapMarkerAlt className="text-primary" /> Shipping
                          Address
                        </h6>
                        <div className="mb-2">
                          <div className="d-flex align-items-start gap-2 mb-1">
                            <FaUser className="text-muted mt-1" size={14} />
                            <div className="fw-bold">{order.address?.fullName}</div>
                          </div>
                          <div className="d-flex align-items-start gap-2 mb-1">
                            <FaPhone className="text-muted mt-1" size={14} />
                            <div className="text-muted small">
                              {order.address?.phone}
                            </div>
                          </div>

                          <div className="d-flex align-items-start gap-2 mb-1">
                            <FaMapMarkerAlt className="text-muted mt-1" size={14} />
                            <div className="text-muted small lh-base">
                              {order.address?.addressLine},<br />
                              {order.address?.city}, {order.address?.state} -{" "}
                              {order.address?.pincode}
                            </div>
                          </div>

                          <hr className="my-2 opacity-25" />

                          <h6 className="fw-bold mb-2 text-uppercase small text-muted d-flex align-items-center gap-2">
                            <FaCreditCard className="text-primary" /> Payment
                            Details
                          </h6>

                          <div className="mb-1 small">
                            <strong>Payment Method:</strong> {order.paymentMethod}
                          </div>

                          <div className="mb-1 small">
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
            ))}
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="d-flex flex-column align-items-center mt-4">
          <span className="small text-muted mb-2 fw-medium text-center">
            Page {currentPage} &rarr; Orders {(currentPage - 1) * ordersPerPage + 1}&ndash;{Math.min(currentPage * ordersPerPage, filteredOrders.length)}
          </span>
          <div className="pagination-wrap w-100 d-flex justify-content-center">
            <Pagination className="mb-0">
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
        </div>
      )}
    </Container>
  );
};

export default Orders;

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaShoppingBag, FaUserAlt, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

const AdminUserOrders = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const ordersPerPage = 10;

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8000/api/v1/admin/users/orders/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
      if (res.data.length > 0) {
          setUser(res.data[0].user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-warning text-dark";
    if (status === "Confirmed") return "bg-info text-white";
    if (status === "Shipped") return "bg-primary text-white";
    if (status === "Delivered") return "bg-success text-white";
    if (status === "Cancelled") return "bg-danger text-white";
    return "bg-secondary text-white";
  };

  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const currentOrders = orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="mb-4">
        <Link to="/admin/users" className="btn btn-link link-secondary p-0 mb-3 text-decoration-none d-flex align-items-center gap-2">
          <FaArrowLeft size={12} /> <span>Back to Users</span>
        </Link>
        <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold h3 mb-0" style={{ width: '64px', height: '64px' }}>
                {user?.username?.charAt(0).toUpperCase() || <FaUserAlt size={24} />}
            </div>
            <div>
                <h3 className="fw-bold text-dark mb-1">{user?.username || 'User'}&apos;s Orders</h3>
                <p className="text-muted small mb-0">{user?.email} • Total Orders: {orders.length}</p>
            </div>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Products</th>
                <th>Delivery Address</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="fw-bold text-dark">#{order._id.slice(-8).toUpperCase()}</div>
                      <div className="text-muted smaller">{new Date(order.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td>
                      <div className="smaller">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-truncate" style={{ maxWidth: '180px' }}>
                            <FaShoppingBag className="text-muted me-1 smaller" />
                            {item.product?.name} <span className="text-muted fw-normal">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="smaller text-dark" style={{ maxWidth: '250px' }}>
                        <div className="fw-bold"><FaMapMarkerAlt className="text-muted me-1" /> {order.address?.fullName}</div>
                        <div className="text-muted text-wrap">{order.address?.addressLine}, {order.address?.city}, {order.address?.state} - {order.address?.pincode}</div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">₹{order.totalAmount}</div>
                      <div className="smaller d-flex align-items-center gap-1">
                          <FaCreditCard className="text-muted" size={10} />
                          <span className={order.paymentStatus === "Received" ? "text-success" : "text-warning"}>{order.paymentStatus}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    This user hasn&apos;t placed any orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
             <span className="small text-muted">Page {currentPage} &rarr; Orders {(currentPage - 1) * ordersPerPage + 1}&ndash;{Math.min(currentPage * ordersPerPage, orders.length)}</span>
             <nav>
              <ul className="pagination pagination-sm mb-0 gap-1">
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                    <button className="page-link border-0 rounded-pill px-3" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserOrders;

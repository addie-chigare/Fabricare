import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import { FaSearch, FaTrash } from "react-icons/fa";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");
  const ordersPerPage = 10;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await API.get("/orders/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await API.put(
        `/orders/admin/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update order status.");
      fetchOrders();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order permanently?")) return;
    try {
      await API.delete(`/orders/admin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = orders.filter((order) =>
    (order.user?.username || "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

  const getStatusClass = (status) => {
    if (status === "Pending") return "bg-warning text-dark";
    if (status === "Confirmed") return "bg-info text-white";
    if (status === "Shipped") return "bg-primary text-white";
    if (status === "Delivered") return "bg-success text-white";
    if (status === "Cancelled") return "bg-danger text-white";
    return "bg-secondary text-white";
  };

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Order Management</h3>
          <p className="text-muted small mb-0">Track and manage customer orders and fulfillment.</p>
        </div>
      </div>

      <div className="admin-card mb-4">
        <div className="row">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by customer name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Contact</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div className="fw-bold text-dark mb-1">#{order._id.slice(-8).toUpperCase()}</div>
                      <div className="text-muted smaller">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{order.user?.username}</div>
                      <div className="text-muted smaller">{order.user?.email}</div>
                    </td>
                    <td>
                      <div className="smaller">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-truncate" style={{ maxWidth: '200px' }}>
                            {item.product?.name} <span className="text-muted">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">₹{order.totalAmount.toLocaleString()}</div>
                      <div className={`smaller fw-bold ${
                        order.paymentStatus === "Completed" ? "text-success" :
                        order.paymentStatus === "Refunded" ? "text-info" :
                        order.paymentStatus === "Failed" ? "text-danger" : "text-warning"
                      }`}>{order.paymentStatus}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: '130px' }}
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger p-2 hover-bg-light rounded-circle border-0"
                        onClick={() => handleDelete(order._id)}
                        title="Delete Order"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
             <span className="small text-muted">Page {currentPage} &rarr; Orders {(currentPage - 1) * ordersPerPage + 1}&ndash;{Math.min(currentPage * ordersPerPage, filteredOrders.length)}</span>
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

export default AdminOrders;

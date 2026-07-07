import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("token");
  const ordersPerPage = 10;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/orders/admin", {
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
      await axios.put(
        `http://localhost:8000/api/v1/orders/admin/status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.user?.username.toLowerCase().includes(search.toLowerCase()),
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
                <th className="text-end">Update Status</th>
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
                      <div className="fw-bold text-dark">₹{order.totalAmount}</div>
                      <div className="smaller text-success">{order.paymentStatus}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm ms-auto"
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No orders found.</td>
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

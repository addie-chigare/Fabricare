import { FaBoxOpen, FaShoppingCart, FaUsers, FaRupeeSign, FaArrowUp, FaArrowDown, FaPlus, FaUserPlus, FaListAlt, FaCog, FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import PropTypes from "prop-types";

import RevenueChart from "../components/RevenueChart";
import TopProducts from "../components/TopProducts";

const StatCard = ({ title, value, icon, trend, trendUp }) => (
  <div className="stat-card">
    <div className="d-flex align-items-center justify-content-between mb-2">
      <div className="stat-card-icon">{icon}</div>
      {trend && (
        <span className={`stat-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
          {trend}
        </span>
      )}
    </div>
    <h3 className="fw-bold mb-0">{value}</h3>
    <p className="text-muted small mb-0">{title}</p>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  trend: PropTypes.string,
  trendUp: PropTypes.bool,
};

const AdminDashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await API.get("/products/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductCount(res.data.length);
      setLowStockCount(res.data.filter(p => p.stock < 10).length);
    } catch (error) { console.error(error); }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCount(res.data.length);
    } catch (error) { console.error(error); }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/orders/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderCount(res.data.totalOrders);
      setRevenue(res.data.totalRevenue);
      setRecentOrders(res.data.recentOrders);
    } catch (error) { console.error(error); }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchProducts, fetchUsers, fetchStats]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5 px-4">
      <style>{`
        .stat-card {
          background: var(--bs-body-bg, #fff);
          border: 1px solid #edf0f3;
          border-radius: 12px;
          padding: 1.1rem 1.25rem;
          height: 100%;
        }
        .stat-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #f4f5f7;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .stat-trend.up { color: #15803d; background: #f0fdf4; }
        .stat-trend.down { color: #b91c1c; background: #fef2f2; }

        .dash-panel {
          background: var(--bs-body-bg, #fff);
          border: 1px solid #edf0f3;
          border-radius: 12px;
          overflow: hidden;
        }
        .dash-panel-header {
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid #edf0f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.7rem 1rem;
          border: 1px solid #edf0f3;
          border-radius: 10px;
          text-decoration: none;
          color: #1f2937;
          font-weight: 600;
          font-size: 0.85rem;
          background: #fff;
        }
        .quick-action-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dash-table {
          width: 100%;
          font-size: 0.85rem;
        }
        .dash-table td {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid #f1f3f5;
          vertical-align: middle;
        }
        .dash-table tr:last-child td { border-bottom: none; }

        .status-pill {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .period-toggle .btn {
          font-size: 0.75rem;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-end mb-4 pt-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontSize: "1.6rem" }}>Dashboard</h2>
          <p className="text-muted small mb-0">Overview of your store</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-2">
          <FaCog size={13} /> Settings
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard title="Revenue" value={`₹${revenue.toLocaleString()}`} icon={<FaRupeeSign />} trend="+15.2%" trendUp={true} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Orders" value={orderCount} icon={<FaShoppingCart />} trend="+8.1%" trendUp={true} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Products" value={productCount} icon={<FaBoxOpen />} trend="+12%" trendUp={true} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard title="Users" value={userCount} icon={<FaUsers />} trend="-3.4%" trendUp={false} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-2 mb-4">
        {[
          { to: "/admin/products/create", icon: <FaPlus />, label: "Add product" },
          { to: "/admin/orders", icon: <FaListAlt />, label: "Order list" },
          { to: "/admin/users", icon: <FaUserPlus />, label: "Manage team" },
        ].map((action, i) => (
          <div className="col-4" key={i}>
            <Link to={action.to} className="quick-action">
              <div className="quick-action-icon">{action.icon}</div>
              {action.label}
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="dash-panel h-100">
            <div className="dash-panel-header">
              <span className="fw-bold small">Revenue</span>
              <div className="d-flex gap-1 period-toggle">
                {["daily", "weekly", "monthly"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 text-capitalize ${
                      revenuePeriod === p ? "btn-dark" : "btn-outline-secondary border-0"
                    }`}
                    onClick={() => setRevenuePeriod(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3">
              <RevenueChart period={revenuePeriod} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="dash-panel h-100 d-flex flex-column">
            <div className="dash-panel-header">
              <span className="fw-bold small">Inventory</span>
              {lowStockCount > 0 && (
                <span className="status-pill" style={{ color: "#b91c1c", background: "#fef2f2" }}>
                  {lowStockCount} low
                </span>
              )}
            </div>
            <div className="p-3 flex-grow-1">
              <div className="d-flex align-items-center justify-content-between mb-3 p-3 rounded-3" style={{ background: "#f8f9fb" }}>
                <div className="d-flex align-items-center gap-2">
                  <FaExclamationTriangle className="text-warning" />
                  <div>
                    <div className="fw-bold small">{lowStockCount} items</div>
                    <div className="text-muted" style={{ fontSize: "0.72rem" }}>Running low on stock</div>
                  </div>
                </div>
                <Link to="/admin/products" className="btn btn-sm btn-outline-secondary">Restock</Link>
              </div>
              <TopProducts />
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="dash-panel">
        <div className="dash-panel-header">
          <span className="fw-bold small">Recent orders</span>
          <Link to="/admin/orders" className="text-decoration-none small fw-bold">View all</Link>
        </div>

        <div className="table-responsive">
          <table className="dash-table">
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 28, height: 28, fontSize: 11, background: "#eef2ff", color: "#4338ca" }}
                        >
                          {order.user?.username?.charAt(0).toUpperCase() || "G"}
                        </div>
                        <div>
                          <div className="fw-bold">{order.user?.username || "Guest"}</div>
                          <div className="text-muted" style={{ fontSize: "0.72rem" }}>{order.user?.email || "External"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="fw-bold">₹{order.totalAmount}</td>
                    <td>
                      <span
                        className="status-pill"
                        style={
                          order.status === "Delivered" ? { color: "#15803d", background: "#f0fdf4" } :
                          order.status === "Cancelled" ? { color: "#b91c1c", background: "#fef2f2" } :
                          order.status === "Shipped" ? { color: "#1d4ed8", background: "#eff6ff" } :
                          { color: "#b45309", background: "#fffbeb" }
                        }
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end text-muted">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No recent orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

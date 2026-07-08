import { FaBoxOpen, FaShoppingCart, FaUsers, FaRupeeSign, FaArrowUp, FaArrowDown, FaPlus, FaUserPlus, FaListAlt, FaCog, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import PropTypes from "prop-types";

import RevenueChart from "../components/RevenueChart";
import TopProducts from "../components/TopProducts";

const StatCard = ({ title, value, icon, bgColor, textColor, trend, trendUp, subtitle }) => (
  <div className="admin-card h-100">
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="admin-stat-icon" style={{ backgroundColor: bgColor, color: textColor }}>
        {icon}
      </div>
      {trend && (
        <span className={`admin-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
          {trend}
        </span>
      )}
    </div>
    <div className="mb-1">
      <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>{value}</h3>
      <h6 className="text-muted small fw-bold text-uppercase mt-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{title}</h6>
    </div>
    {subtitle && <p className="text-muted smaller mb-0 mt-2">{subtitle}</p>}
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  trend: PropTypes.string,
  trendUp: PropTypes.bool,
  subtitle: PropTypes.string,
};

const AdminDashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
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
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate__animated animate__fadeIn pb-5 px-4">
      <div className="d-flex justify-content-between align-items-end mb-4 pt-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.75rem' }}>Management Overview</h2>
          <p className="text-muted small mb-0">Direct insights into your store&apos;s ecosystem.</p>
        </div>
        <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm px-3 d-flex align-items-center gap-2 border-0 fw-bold">
                <FaCog size={14} className="text-muted" /> <span className="text-muted">Settings</span>
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <StatCard 
            title="Revenue" 
            value={`₹${revenue.toLocaleString()}`} 
            icon={<FaRupeeSign />} 
            bgColor="#f0f9ff" 
            textColor="#0369a1"
            trend="+15.2%"
            trendUp={true}
            subtitle="Current cycle earnings"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Orders" 
            value={orderCount} 
            icon={<FaShoppingCart />} 
            bgColor="#fdf2f8" 
            textColor="#be185d"
            trend="+8.1%"
            trendUp={true}
            subtitle="Volume in last 30 days"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Products" 
            value={productCount} 
            icon={<FaBoxOpen />} 
            bgColor="#f0fdf4" 
            textColor="#15803d"
            trend="+12%"
            trendUp={true}
            subtitle="Live in catalog"
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            title="Users" 
            value={userCount} 
            icon={<FaUsers />} 
            bgColor="#fff7ed" 
            textColor="#c2410c"
            trend="-3.4%"
            trendUp={false}
            subtitle="Active registered accounts"
          />
        </div>
      </div>

      {/* Quick Access Horizon */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-3">
            <h6 className="fw-bold mb-0 text-dark">Quick Command Hub</h6>
            <div className="bg-primary-light rounded-pill px-2 py-0 smaller text-primary fw-bold">Actions</div>
        </div>
        <div className="row g-3">
          {[
            { to: "/admin/products/create", icon: <FaPlus />, label: "Add Product", color: "primary" },
            { to: "/admin/orders", icon: <FaListAlt />, label: "Order List", color: "dark" },
            { to: "/admin/users", icon: <FaUserPlus />, label: "Manage Team", color: "dark" },
            { to: "#", icon: <FaHistory />, label: "Audit Logs", color: "dark" }
          ].map((action, i) => (
            <div className="col-6 col-md-3" key={i}>
                <Link to={action.to} className="quick-action-btn h-100">
                    <div className={`p-2 rounded-circle mb-1 bg-${action.color === 'primary' ? 'primary text-white' : 'light text-dark'}`}>
                        {action.icon}
                    </div>
                    <span className="smaller">{action.label}</span>
                </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4 mb-5">
         <div className="col-lg-8">
            <div className="admin-card h-100 p-0 overflow-hidden">
                <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                    <h6 className="fw-bold mb-0">Revenue Trajectory</h6>
                    <div className="dropdown">
                        <button className="btn btn-link btn-sm text-decoration-none dropdown-toggle text-muted fw-bold p-0" style={{ fontSize: '0.75rem' }}>
                            Monthly View
                        </button>
                    </div>
                </div>
                <div className="p-4" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                    <RevenueChart />
                </div>
            </div>
         </div>
         <div className="col-lg-4">
            <div className="admin-card h-100 p-0 overflow-hidden d-flex flex-column">
                <div className="px-4 py-3 border-bottom bg-white d-flex align-items-center justify-content-between">
                    <h6 className="fw-bold mb-0">Inventory Pulse</h6>
                    {lowStockCount > 0 && <span className="bg-danger text-white px-2 py-0 rounded smaller fw-bold pulse-indicator">Alert</span>}
                </div>
                <div className="p-4 flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-4 bg-light p-3 rounded-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white p-2 rounded-3 shadow-sm text-danger"><FaExclamationTriangle /></div>
                            <div>
                                <h6 className="mb-0 fw-bold">{lowStockCount}</h6>
                                <p className="text-muted smaller mb-0">Low Stock Items</p>
                            </div>
                        </div>
                        <Link to="/admin/products" className="btn btn-sm btn-outline-danger border-0 fw-bold smaller">Restock</Link>
                    </div>
                    <TopProducts />
                </div>
            </div>
         </div>
      </div>

      {/* Activity Flux */}
      <div className="admin-card p-0 overflow-hidden border-0 bg-white">
        <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Recent Activity Flux</h6>
          <Link to="/admin/orders" className="text-primary text-decoration-none fw-bold smaller">Full Stream</Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="ps-4">Entity</th>
                <th>Hash</th>
                <th>Volume</th>
                <th>State</th>
                <th className="text-end pe-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-4 d-flex align-items-center justify-content-center fw-bold smaller" style={{ width: '32px', height: '32px', fontSize: '10px' }}>
                          {order.user?.username?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div>
                            <div className="fw-bold text-dark small">{order.user?.username || 'Guest'}</div>
                            <div className="text-muted smaller" style={{ fontSize: '10px' }}>{order.user?.email || 'External'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-muted fw-bold" style={{ fontSize: '10px' }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                    <td><span className="fw-bold text-dark">₹{order.totalAmount}</span></td>
                    <td>
                      <span className={`admin-badge ${
                        order.status === "Delivered" ? "bg-success-light text-success" : 
                        order.status === "Cancelled" ? "bg-danger-light text-danger" : 
                        order.status === "Shipped" ? "bg-primary-light text-primary" : 
                        "bg-warning-light text-warning"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end pe-4 text-muted smaller">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">Awaiting activity signals...</td>
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

import { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import { FaSearch, FaTshirt, FaCalendarAlt, FaPhoneAlt, FaMoneyBillWave, FaSave, FaCheck, FaTimes } from "react-icons/fa";

const ManageLaundry = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });

  // Pricing Form State
  const [washFoldPrice, setWashFoldPrice] = useState(49);
  const [dryCleanPrice, setDryCleanPrice] = useState(99);
  const [steamIronPrice, setSteamIronPrice] = useState(19);

  // Editing Order State
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [timelineDesc, setTimelineDesc] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes, pricingRes] = await Promise.all([
        API.get("/admin/laundry/orders", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/admin/laundry/stats", { headers: { Authorization: `Bearer ${token}` } }),
        API.get("/laundry/pricing")
      ]);

      setOrders(ordersRes.data);
      setStats(statsRes.data);

      // Populate pricing fields from settings (returned via public laundry/pricing endpoint)
      if (pricingRes.data && pricingRes.data.length >= 3) {
        const wash = pricingRes.data.find(p => p.id === "wash_fold");
        const dry = pricingRes.data.find(p => p.id === "dry_cleaning");
        const iron = pricingRes.data.find(p => p.id === "steam_ironing");

        if (wash) setWashFoldPrice(wash.price);
        if (dry) setDryCleanPrice(dry.price);
        if (iron) setSteamIronPrice(iron.price);
      }
    } catch (error) {
      console.error("Error fetching admin laundry data:", error);
      setMessage({ type: "danger", text: "Failed to load laundry configurations and orders." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePricing = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await API.put("/admin/laundry/pricing", {
        laundryWashFoldPrice: washFoldPrice,
        laundryDryCleanPrice: dryCleanPrice,
        laundrySteamIronPrice: steamIronPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: "Laundry pricing rates updated successfully!" });
      // Emit event so storefront gets updated settings
      window.dispatchEvent(new Event("settings-updated"));
      fetchData();
    } catch (error) {
      console.error("Error updating laundry pricing:", error);
      setMessage({ type: "danger", text: "Failed to update pricing details." });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewAmount(order.total_amount);
    setTimelineDesc("");
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await API.put(`/admin/laundry/orders/${editingOrder.id}/status`, {
        status: newStatus,
        total_amount: newAmount,
        timelineDescription: timelineDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: `Order #${editingOrder.order_number} updated successfully.` });
      setEditingOrder(null);
      fetchData();
    } catch (error) {
      console.error("Error updating order status:", error);
      const errMsg = error.response?.data?.message || "Failed to update order status.";
      setMessage({ type: "danger", text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "bg-warning text-dark";
      case "confirmed": return "bg-info text-white";
      case "picked_up": return "bg-secondary text-white";
      case "washing": return "bg-primary text-white";
      case "ironing": return "bg-pink text-white";
      case "ready_for_delivery": return "bg-teal text-white";
      case "delivered": return "bg-success text-white";
      case "cancelled": return "bg-danger text-white";
      default: return "bg-secondary text-white";
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.address.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Laundry Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate__animated animate__fadeIn pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Laundry Service Management</h3>
          <p className="text-muted small mb-0">Manage pickup schedules, process laundry operations, and set rates.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="admin-card d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
              <FaTshirt size={24} />
            </div>
            <div>
              <div className="text-muted smaller">Total Bookings</div>
              <h4 className="fw-bold text-dark mb-0">{stats.totalOrders}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-3">
              <FaCalendarAlt size={24} />
            </div>
            <div>
              <div className="text-muted smaller">Pending Pickups</div>
              <h4 className="fw-bold text-dark mb-0">{stats.pendingOrders}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card d-flex align-items-center gap-3">
            <div className="bg-success bg-opacity-10 text-success p-3 rounded-3">
              <FaMoneyBillWave size={24} />
            </div>
            <div>
              <div className="text-muted smaller">Total Revenue (Delivered)</div>
              <h4 className="fw-bold text-dark mb-0">₹{stats.totalRevenue}</h4>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show small py-2.5 mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close smaller" onClick={() => setMessage({ type: "", text: "" })}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="admin-card p-0 mb-4 overflow-hidden">
        <div className="border-bottom d-flex bg-light px-3">
          <button
            className={`btn border-0 py-3 px-4 rounded-0 fw-semibold small ${activeTab === "orders" ? "border-bottom border-primary border-2 text-primary" : "text-muted"}`}
            onClick={() => setActiveTab("orders")}
          >
            Laundry Bookings ({filteredOrders.length})
          </button>
          <button
            className={`btn border-0 py-3 px-4 rounded-0 fw-semibold small ${activeTab === "pricing" ? "border-bottom border-primary border-2 text-primary" : "text-muted"}`}
            onClick={() => setActiveTab("pricing")}
          >
            Manage Rates / Pricing
          </button>
        </div>

        {/* Tab 1: Orders list */}
        {activeTab === "orders" && (
          <div className="p-3">
            <div className="mb-3">
              <div className="input-group" style={{ maxWidth: "350px" }}>
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by order #, address, name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Schedule</th>
                    <th>Services Requested</th>
                    <th>Pickup Location</th>
                    <th>Billing</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="fw-bold text-dark mb-1">{order.order_number}</div>
                          <div className="text-muted smaller">{new Date(order.created_at).toLocaleDateString("en-IN")}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{order.user?.name || "Temp Customer"}</div>
                          <div className="text-muted smaller">{order.user?.email || "N/A"}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{new Date(order.pickup_date).toLocaleDateString("en-IN")}</div>
                          <div className="text-muted smaller">{order.pickup_time}</div>
                        </td>
                        <td>
                          <div className="smaller">
                            {order.services?.map(s => s.name).join(", ") || "None"}
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate smaller" style={{ maxWidth: "180px" }} title={order.address}>
                            {order.address}
                          </div>
                          <div className="text-muted smaller"><FaPhoneAlt size={10} className="me-1" />{order.contact_number}</div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">₹{order.total_amount}</div>
                        </td>
                        <td>
                          <span className={`admin-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary px-3 fw-semibold"
                            onClick={() => handleOpenEditModal(order)}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted small">No laundry bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing Form */}
        {activeTab === "pricing" && (
          <div className="p-4" style={{ maxWidth: "600px" }}>
            <h5 className="fw-bold mb-4 text-dark">Global Laundry Pricing Schema</h5>
            <form onSubmit={handleUpdatePricing}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Wash & Fold Rate (per kg)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    value={washFoldPrice}
                    onChange={(e) => setWashFoldPrice(e.target.value)}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Dry Cleaning Rate (per item)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    value={dryCleanPrice}
                    onChange={(e) => setDryCleanPrice(e.target.value)}
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted text-uppercase">Steam Ironing Rate (per item)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">₹</span>
                  <input
                    type="number"
                    className="form-control border-start-0"
                    value={steamIronPrice}
                    onChange={(e) => setSteamIronPrice(e.target.value)}
                    min={0}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary px-4 py-2.5 fw-semibold d-flex align-items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <FaSave />
                )}
                <span>Save Pricing Changes</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Editing Order Modal (styled cleanly using standard bootstrap classes) */}
      {editingOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Update Order #{editingOrder.order_number}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingOrder(null)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleUpdateOrder}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Order Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="washing">Washing</option>
                      <option value="ironing">Ironing</option>
                      <option value="ready_for_delivery">Ready for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Total Billing Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      min={0}
                      required
                    />
                    <small className="text-muted smaller">Update total based on actual weight/items count after pickup.</small>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-muted text-uppercase">Timeline Event Description (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={timelineDesc}
                      onChange={(e) => setTimelineDesc(e.target.value)}
                      placeholder="e.g. Clothes weighed: 4.5kg, cleaning started"
                    />
                    <small className="text-muted smaller">This message will be appended to customer's order tracking timeline.</small>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 py-3">
                  <button type="button" className="btn btn-light px-4" onClick={() => setEditingOrder(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-1" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm" role="status"></span> : <FaCheck />}
                    <span>Apply Updates</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLaundry;

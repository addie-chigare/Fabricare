import { FaBell, FaBars } from "react-icons/fa";

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="admin-topbar d-flex justify-content-between align-items-center px-4 py-3">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-light p-2 border-0 rounded-circle d-flex align-items-center justify-content-center"
          onClick={toggleSidebar}
        >
          <FaBars size={18} />
        </button>
        <h5 className="mb-0 fw-bold text-dark d-none d-sm-block">Dashboard Overview</h5>
      </div>

      <div className="d-flex align-items-center gap-4">
        <div className="position-relative" style={{ cursor: "pointer" }}>
          <FaBell size={20} className="text-muted" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1">
            <span className="visually-hidden">unread notifications</span>
          </span>
        </div>

        {/* Admin Profile */}
        <div className="d-flex align-items-center gap-3 ps-3 border-start">
          <div className="text-end d-none d-md-block">
            <p className="mb-0 fw-bold small text-dark">Admin</p>
            <p className="mb-0 text-muted smaller" style={{ fontSize: '0.75rem' }}>Full Access</p>
          </div>
          <div 
            className="bg-primary-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary"
            style={{ width: "40px", height: "40px" }}
          >
            A
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

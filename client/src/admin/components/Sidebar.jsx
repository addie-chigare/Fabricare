import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUsers,
  FaImages,
  FaSignOutAlt,
  FaTimes,
  FaList,
  FaCog
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {/* Overlay background for mobile when menu is active */}
      {isOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none" 
          style={{ zIndex: 1040 }}
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`admin-sidebar d-flex flex-column p-4 ${isOpen ? 'open' : ''}`}>
        {/* Logo & Close */}
        <div className="d-flex align-items-center justify-content-between mb-5 px-2">
          <div>
            <h4 className="text-white fw-bold mb-0">Fabricare</h4>
            <small className="text-muted">Admin Panel</small>
          </div>
          <button 
            className="btn btn-link text-white p-0 d-lg-none border-0"
            onClick={toggleSidebar}
          >
            <FaTimes size={18} />
          </button>
        </div>

        <nav className="nav flex-column gap-2 flex-grow-1">
          <NavLink
            to="/admin"
            end
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaTachometerAlt size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaBoxOpen size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaUsers size={18} />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/banners"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaImages size={18} />
            <span>Banners</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaList size={18} />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `nav-link d-flex align-items-center gap-3 ${isActive ? 'active' : ''}`
            }
          >
            <FaCog size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Logout */}
        <div className="mt-auto border-top border-secondary pt-4">
          <button 
            onClick={handleLogout}
            className="btn btn-link text-danger text-decoration-none d-flex align-items-center gap-3 px-2 w-100"
          >
            <FaSignOutAlt size={18} />
            <span className="fw-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

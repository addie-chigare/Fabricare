import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { Outlet } from "react-router-dom";
import "./Admin.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);

  return (
    <div className="d-flex admin-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-3 p-md-4" style={{ minHeight: "calc(100vh - 70px)", overflowX: "hidden" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

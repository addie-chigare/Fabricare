import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleBlock = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/v1/admin/users/block/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const viewOrders = (id) => {
    navigate(`/admin/user-orders/${id}`);
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">User Management</h3>
          <p className="text-muted small mb-0">Manage customer accounts and access levels.</p>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="mb-0 fw-bold text-dark">{user.username}</p>
                          <small className="text-muted smaller">{user.name}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-muted small">{user.email}</span></td>
                    <td>
                      <span className={`admin-badge ${user.role === "admin" ? "bg-primary text-white" : "bg-light text-dark border"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="admin-badge bg-danger text-white">Blocked</span>
                      ) : (
                        <span className="admin-badge bg-success text-white">Active</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-secondary px-3" onClick={() => toggleBlock(user._id)}>
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button className="btn btn-sm btn-outline-primary px-3" onClick={() => viewOrders(user._id)}>
                          Orders
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
             <span className="small text-muted">Showing {currentUsers.length} of {users.length} users</span>
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

export default ManageUsers;

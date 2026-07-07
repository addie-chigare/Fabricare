import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaPlus, FaUndo } from "react-icons/fa";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState("men");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const categoriesPerPage = 10;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto-generate slug when name or type changes (unless user manually entered one)
  useEffect(() => {
    if (!editingId && name) {
      const computedSlug = `${type}-${name}`
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(computedSlug);
    }
  }, [name, type, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        // Edit Mode
        const res = await axios.put(
          `http://localhost:8000/api/v1/categories/admin/update/${editingId}`,
          { name, type, slug },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(res.data.message || "Category updated successfully");
        resetForm();
      } else {
        // Add Mode
        const res = await axios.post(
          "http://localhost:8000/api/v1/categories/admin/create",
          { name, type, slug },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess(res.data.message || "Category created successfully");
        resetForm();
      }
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setType(cat.type);
    setSlug(cat.slug);
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setType("men");
    setSlug("");
    setError("");
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This might affect products using it.")) return;
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/categories/admin/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message || "Category deleted successfully");
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  const totalPages = Math.ceil(categories.length / categoriesPerPage);
  const currentCategories = categories.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Category Management</h3>
          <p className="text-muted small mb-0">Organize and manage catalog categories for Men's and Kids' clothing.</p>
        </div>
      </div>

      {success && <div className="alert alert-success alert-dismissible fade show py-2 small" role="alert">{success}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2 small" role="alert">{error}</div>}

      <div className="row g-4">
        {/* LIST OF CATEGORIES */}
        <div className="col-lg-8">
          <div className="admin-card p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Type</th>
                    <th>Slug</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.length > 0 ? (
                    currentCategories.map((cat) => (
                      <tr key={cat._id}>
                        <td>
                          <span className="fw-bold text-dark">{cat.name}</span>
                        </td>
                        <td>
                          <span className={`admin-badge ${cat.type === "men" ? "bg-primary text-white" : "bg-warning text-dark"}`}>
                            {cat.type === "men" ? "Men's" : "Kids'"}
                          </span>
                        </td>
                        <td>
                          <code className="text-muted small">{cat.slug}</code>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-icon text-primary"
                              onClick={() => startEdit(cat)}
                              title="Edit Category"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-icon text-danger"
                              onClick={() => deleteCategory(cat._id)}
                              title="Delete Category"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">No categories found. Run seed script or add one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-top d-flex justify-content-between align-items-center bg-light">
                <span className="small text-muted">Showing {currentCategories.length} of {categories.length} categories</span>
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

        {/* ADD/EDIT FORM */}
        <div className="col-lg-4">
          <div className="admin-card">
            <h5 className="fw-bold mb-4">{editingId ? "Edit Category" : "Add New Category"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Shirts, Hoodies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Collection Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="men">Men's Collection</option>
                  <option value="kids">Kids' Collection</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted text-uppercase">URL Slug</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="e.g. men-shirts"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <small className="text-muted smaller d-block mt-1">Unique path used to filter items in the store.</small>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-admin-primary flex-grow-1 py-2.5 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <FaPlus size={12} />
                  )}
                  <span>{editingId ? "Save Changes" : "Add Category"}</span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-light border px-3"
                    onClick={resetForm}
                    title="Cancel Edit"
                  >
                    <FaUndo size={12} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;

import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaTrashAlt, FaEdit, FaStar, FaRegStar } from "react-icons/fa";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const productsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/products/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (error) {
      console.log("Fetch Products Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch {
      alert("Delete failed");
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  let filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === "" || p.category === categoryFilter)
  );

  if (sortOrder === "low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sortOrder === "high") filteredProducts.sort((a, b) => b.price - a.price);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

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
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Products</h2>
          <p className="text-muted small mb-0">Manage your store&apos;s inventory and listings.</p>
        </div>
        <Link to="/admin/products/create" className="btn btn-admin-primary d-flex align-items-center gap-2 px-4 shadow-sm">
          <FaPlus size={14} /> <span>New Product</span>
        </Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="admin-card py-3 border-0 shadow-sm d-flex align-items-center gap-3">
            <div className="bg-primary-light text-primary rounded-3 p-2">
              <FaPlus size={16} />
            </div>
            <div>
              <p className="smaller text-muted mb-0 fw-semibold text-uppercase">Total Items</p>
              <h4 className="fw-bold mb-0">{products.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-card py-3 border-0 shadow-sm d-flex align-items-center gap-3">
            <div className="bg-warning-light text-warning rounded-3 p-2">
              <FaEdit size={16} />
            </div>
            <div>
              <p className="smaller text-muted mb-0 fw-semibold text-uppercase">Low Stock</p>
              <h4 className="fw-bold mb-0 text-warning">{products.filter(p => p.stock > 0 && p.stock < 10).length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-card py-3 border-0 shadow-sm d-flex align-items-center gap-3">
            <div className="bg-danger-light text-danger rounded-3 p-2">
              <FaTrashAlt size={16} />
            </div>
            <div>
              <p className="smaller text-muted mb-0 fw-semibold text-uppercase">Out of Stock</p>
              <h4 className="fw-bold mb-0 text-danger">{products.filter(p => p.stock === 0).length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-card py-3 border-0 shadow-sm d-flex align-items-center gap-3">
            <div className="bg-success-light text-success rounded-3 p-2">
              <FaSearch size={16} />
            </div>
            <div>
              <p className="smaller text-muted mb-0 fw-semibold text-uppercase">Categories</p>
              <h4 className="fw-bold mb-0 text-success">{categories.length}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card mb-4 border-0 shadow-sm">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group input-group-merge">
              <span className="input-group-text bg-light border-0 px-3">
                <FaSearch className="text-muted" size={14} />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-light py-2"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
                className="form-select border-0 bg-light py-2" 
                value={categoryFilter} 
                onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                }}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select border-0 bg-light py-2" onChange={(e) => setSortOrder(e.target.value)}>
              <option value="">Sort By</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden border-0 shadow-sm">
        <div className="table-responsive">
          <table className="admin-table border-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4" style={{ width: '40%' }}>Product Details</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product._id} className="align-middle">
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3 py-1">
                        <img 
                            src={product.image} 
                            width="50" 
                            height="50" 
                            className="rounded-3 object-fit-cover bg-light shadow-sm" 
                            alt={product.name} 
                        />
                        <div>
                          <p className="mb-0 fw-bold text-dark">{product.name}</p>
                          <span className="badge bg-primary-light text-primary smaller fw-medium">{product.category}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="fw-bold text-dark">₹{product.price.toLocaleString()}</span></td>
                    <td>
                      {product.stock > 0 ? (
                        <span className="text-success small fw-semibold">
                          <span className="d-inline-block rounded-circle bg-success me-2" style={{ width: '6px', height: '6px' }}></span>
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-danger small fw-semibold">
                           <span className="d-inline-block rounded-circle bg-danger me-2" style={{ width: '6px', height: '6px' }}></span>
                          Sold out
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const newFeaturedState = !product.isFeatured;
                            await axios.put(
                              `http://localhost:8000/api/v1/products/update/${product._id}`,
                              { isFeatured: newFeaturedState },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setProducts(prevProducts =>
                              prevProducts.map(p =>
                                p._id === product._id ? { ...p, isFeatured: newFeaturedState } : p
                              )
                            );
                          } catch (err) {
                            console.error("Toggle featured error", err);
                          }
                        }}
                        className="btn btn-link p-0 border-0 text-decoration-none"
                      >
                        {product.isFeatured ? (
                          <FaStar className="text-warning" size={18} style={{ filter: "drop-shadow(0 0 2px rgba(255, 193, 7, 0.4))" }} />
                        ) : (
                          <FaRegStar className="text-muted" size={18} />
                        )}
                      </button>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <Link to={`/admin/products/edit/${product._id}`} className="btn btn-icon btn-light rounded-circle" title="Edit">
                           <FaEdit size={14} className="text-primary" />
                        </Link>
                        <button className="btn btn-icon btn-light rounded-circle" onClick={() => deleteProduct(product._id)} title="Delete">
                           <FaTrashAlt size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    <div className="opacity-50 mb-2">No products found</div>
                    <small>Try adjusting your filters or search term</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 d-flex justify-content-between align-items-center">
            <span className="smaller text-muted">Page {currentPage} of {totalPages}</span>
            <div className="d-flex gap-2">
                <button 
                    className="btn btn-sm btn-light px-3 rounded-pill fw-medium" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Prev
                </button>
                <button 
                    className="btn btn-sm btn-light px-3 rounded-pill fw-medium" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

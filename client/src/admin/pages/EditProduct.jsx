import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaCloudUploadAlt, FaSave, FaTrash } from "react-icons/fa";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [discount, setDiscount] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [material, setMaterial] = useState("");
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState("");
  const [imagesList, setImagesList] = useState([""]);

  const handleImageUrlChange = (index, value) => {
    const updated = [...imagesList];
    updated[index] = value;
    setImagesList(updated);
  };

  const handleAddImageUrl = () => {
    if (imagesList.length < 4) {
      setImagesList([...imagesList, ""]);
    }
  };

  const handleRemoveImageUrl = (index) => {
    const updated = imagesList.filter((_, i) => i !== index);
    setImagesList(updated.length > 0 ? updated : [""]);
  };
  const [reviews, setReviews] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Group categories dynamically by type for optgroups
  const groupedCategories = categories.reduce((acc, cat) => {
    if (!cat.type) return acc;
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/v1/products/${id}`);
      const product = res.data;
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price);
      setCategory(product.category);
      setStock(product.stock);
      setBrand(product.brand || "");
      setDiscount(product.discount || "0");
      setIsFeatured(product.isFeatured || false);
      setMaterial(product.material || "");
      setColors(product.colors ? product.colors.join(", ") : "");
      setSizes(product.sizes ? product.sizes.join(", ") : "");
      setImagesList(product.images && product.images.length > 0 ? product.images : [""]);
      setReviews(product.reviews || []);
      setPreview(product.image);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("brand", brand);
      formData.append("discount", discount);
      formData.append("isFeatured", isFeatured);
      formData.append("material", material);
      formData.append("colors", colors);
      formData.append("sizes", sizes);
      formData.append("images", imagesList.filter(url => url.trim() !== "").join(","));
      if (image) {
        formData.append("image", image);
      }

      await axios.put(
        `http://localhost:8000/api/v1/products/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/admin/products");
    } catch (error) {
      console.log(error);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/products/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/products");
    } catch (error) {
      alert("Delete failed");
    }
  };

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
      <div className="mb-4">
        <Link to="/admin/products" className="btn btn-link link-secondary p-0 mb-3 text-decoration-none d-flex align-items-center gap-2">
          <FaArrowLeft size={12} /> <span>Back to Products</span>
        </Link>
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h3 className="fw-bold text-dark mb-1">Edit Product</h3>
                <p className="text-muted small mb-0">Modify product details and pricing.</p>
            </div>
            <button className="btn btn-outline-danger d-flex align-items-center gap-2 px-3" onClick={deleteProduct}>
                <FaTrash size={14} /> <span>Delete Product</span>
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="admin-card mb-4">
              <h5 className="fw-bold mb-4">Basic Information</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Product Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-0">
                <label className="form-label small fw-semibold text-muted text-uppercase">Description</label>
                <textarea
                  className="form-control"
                  rows="6"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="admin-card">
              <h5 className="fw-bold mb-4">Pricing & Inventory</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₹</span>
                    <input
                      type="number"
                      className="form-control border-start-0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Stock Level</label>
                  <input
                    type="number"
                    className="form-control"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Brand</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Fabricare Premium"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Discount Percentage (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 20 (for 20% OFF)"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="col-12 mt-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {Object.keys(groupedCategories).map((typeKey) => (
                      <optgroup key={typeKey} label={`${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}'s Collection`}>
                        {groupedCategories[typeKey].map((c) => (
                          <option key={c._id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Material Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 100% Organic Cotton"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mt-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Available Colors (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Black, Navy Blue, Gray"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                  />
                </div>
                <div className="col-12 mt-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Available Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. S, M, L, XL"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                  />
                </div>
                <div className="col-12 mt-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase d-flex justify-content-between align-items-center">
                    <span>Additional Image URLs (Max 4)</span>
                    {imagesList.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="btn btn-sm btn-link p-0 fw-bold text-decoration-none"
                        style={{ fontSize: "0.75rem" }}
                      >
                        + Add Image
                      </button>
                    )}
                  </label>
                  <div className="d-flex flex-column gap-2">
                    {imagesList.map((url, index) => (
                      <div key={index} className="d-flex gap-2 align-items-center">
                        <span className="text-muted small font-monospace">#{index + 1}</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`https://example.com/image-${index + 1}.jpg`}
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        />
                        {(imagesList.length > 1 || url !== "") && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(index)}
                            className="btn btn-sm btn-outline-danger px-2.5 py-2"
                            style={{ borderRadius: "0.375rem" }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <div className="form-check form-switch bg-light p-3 rounded-3 border">
                    <input 
                      className="form-check-input ms-0 me-2" 
                      type="checkbox" 
                      id="isFeaturedEditSwitch" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-dark ms-2" htmlFor="isFeaturedEditSwitch">
                      Mark as Featured Product
                    </label>
                    <div className="text-muted smaller mt-1 ms-4" style={{ fontSize: "0.8rem" }}>
                      Featured products are showcased prominently at the top of the homepage grid.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="admin-card mb-4 text-center">
              <h5 className="fw-bold mb-4 text-start">Change Media</h5>
              <div 
                className="border border-2 border-dashed rounded-3 p-4 mb-3 position-relative bg-light"
                style={{ cursor: 'pointer', minHeight: '200px' }}
                onClick={() => document.getElementById('product-image-edit').click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '250px' }}
                  />
                ) : (
                  <div className="py-4">
                    <FaCloudUploadAlt size={48} className="text-muted mb-2" />
                    <p className="mb-0 text-muted small">Upload new product image</p>
                  </div>
                )}
                <input
                  id="product-image-edit"
                  type="file"
                  className="d-none"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                  accept="image/*"
                />
              </div>
              <small className="text-muted smaller">ID: {id}</small>
            </div>

            <div className="admin-card p-4">
               <button 
                type="submit" 
                className="btn btn-admin-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                disabled={saving}
               >
                 {saving ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                 ) : (
                    <FaSave />
                 )}
                 <span>{saving ? 'Saving Changes...' : 'Update Product'}</span>
               </button>
                <button type="button" onClick={() => navigate("/admin/products")} className="btn btn-light w-100 mt-2 py-3 fw-semibold">
                  Cancel
                </button>
            </div>
          </div>
        </div>
      </form>

      {/* Customer Reviews Management Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="admin-card p-4">
            <h5 className="fw-bold mb-4">Customer Reviews Management ({reviews.length})</h5>
            {reviews.length === 0 ? (
              <div className="text-center py-4 text-muted small bg-light rounded-4">
                No reviews have been written for this product yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r._id}>
                        <td><span className="fw-bold text-dark">{r.userName}</span></td>
                        <td>
                          <span className="text-warning fw-bold">
                            {"⭐".repeat(r.rating)}
                          </span>
                        </td>
                        <td><span className="text-muted small">{r.comment}</span></td>
                        <td><span className="smaller text-muted">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span></td>
                        <td className="text-end">
                          <button 
                            type="button" 
                            onClick={async () => {
                              if (!window.confirm("Are you sure you want to delete this customer review?")) return;
                              try {
                                await axios.delete(`http://localhost:8000/api/v1/products/${id}/review/${r._id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                alert("Review deleted successfully");
                                setReviews(prev => prev.filter(rev => rev._id !== r._id));
                              } catch (err) {
                                console.error("Delete review failed", err);
                                alert("Delete review failed");
                              }
                            }}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Delete Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;

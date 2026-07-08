import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCloudUploadAlt, FaSave } from "react-icons/fa";

const CreateProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("Fabricare Signature");
  const [discount, setDiscount] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [material, setMaterial] = useState("100% Premium Cotton");
  const [colors, setColors] = useState("Navy Blue, Charcoal Gray, Pure White");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [imagesList, setImagesList] = useState([""]);
  const [image, setImage] = useState(null);

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
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      formData.append("image", image);

      await axios.post(
        "http://localhost:8000/api/v1/products/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/admin/products");
    } catch (error) {
      console.log(error);
      alert("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="mb-4">
        <Link to="/admin/products" className="btn btn-link link-secondary p-0 mb-3 text-decoration-none d-flex align-items-center gap-2">
          <FaArrowLeft size={12} /> <span>Back to Products</span>
        </Link>
        <h3 className="fw-bold text-dark">Create New Product</h3>
        <p className="text-muted small">Fill in the details to add a new product to your catalog.</p>
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
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
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
                  placeholder="Describe the product features, specifications, and benefits..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="admin-card">
              <h5 className="fw-bold mb-4">Pricing & Inventory</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Base Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₹</span>
                    <input
                      type="number"
                      className="form-control border-start-0"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 100"
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
                      id="isFeaturedSwitch" 
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold text-dark ms-2" htmlFor="isFeaturedSwitch">
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
              <h5 className="fw-bold mb-4 text-start">Product Media</h5>
              <div 
                className="border border-2 border-dashed rounded-3 p-4 mb-3 position-relative bg-light"
                style={{ cursor: 'pointer', minHeight: '200px' }}
                onClick={() => document.getElementById('product-image').click()}
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
                    <p className="mb-0 text-muted small">Click to upload product image</p>
                    <small className="text-muted smaller">JPG, PNG or WEBP (Max 5MB)</small>
                  </div>
                )}
                <input
                  id="product-image"
                  type="file"
                  className="d-none"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              {preview && (
                 <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger px-3 mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setPreview(null);
                  }}
                 >
                   Remove Image
                 </button>
              )}
            </div>

            <div className="admin-card text-center p-4">
               <button 
                type="submit" 
                className="btn btn-admin-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
               >
                 {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                 ) : (
                    <FaSave />
                 )}
                 <span>{loading ? 'Creating Product...' : 'Publish Product'}</span>
               </button>
               <Link to="/admin/products" className="btn btn-light w-100 mt-2 py-3 fw-semibold">
                 Discard Draft
               </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;

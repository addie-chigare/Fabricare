import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Form, Button, Row, Col, Table, Alert, Card, Spinner } from "react-bootstrap";
import { FaTrash, FaPlus, FaCloudUploadAlt, FaExternalLinkAlt } from "react-icons/fa";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "/products",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/banners/public");
      setBanners(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select a banner image");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("link", form.link);
      formData.append("image", image);

      await axios.post("http://localhost:8000/api/v1/banners/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Banner uploaded successfully!");
      setForm({ title: "", subtitle: "", link: "/products" });
      setImage(null);
      setPreview(null);
      fetchBanners();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setError("");
    setMessage("");

    try {
      await axios.delete(`http://localhost:8000/api/v1/banners/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Banner deleted successfully!");
      fetchBanners();
    } catch (err) {
      setError("Failed to delete banner");
    }
  };

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Homepage Banners</h2>
        <p className="text-muted small mb-0">Manage the promotional sliding banners shown on the client homepage.</p>
      </div>

      {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
      {message && <Alert variant="success" className="py-2 small">{message}</Alert>}

      <Row className="gy-4">
        {/* Left Side: Create Form */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4 bg-white rounded-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <FaPlus size={16} className="text-primary" /> Create New Banner
            </h5>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted text-uppercase">Banner Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  placeholder="e.g. Premium Cotton Collection"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted text-uppercase">Subtitle</Form.Label>
                <Form.Control
                  type="text"
                  name="subtitle"
                  placeholder="e.g. Up to 40% OFF this summer"
                  value={form.subtitle}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-semibold text-muted text-uppercase">Redirect Link</Form.Label>
                <Form.Control
                  type="text"
                  name="link"
                  placeholder="e.g. /products"
                  value={form.link}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4 text-center">
                <Form.Label className="small fw-semibold text-muted text-uppercase d-block text-start">Banner Media</Form.Label>
                <div
                  className="border border-2 border-dashed rounded-3 p-4 position-relative bg-light cursor-pointer"
                  style={{ minHeight: "150px" }}
                  onClick={() => document.getElementById("banner-image-upload").click()}
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: "150px" }} />
                  ) : (
                    <div className="py-3">
                      <FaCloudUploadAlt size={36} className="text-muted mb-2" />
                      <p className="mb-0 text-muted small">Click to upload banner image</p>
                      <small className="text-muted smaller">Recommended ratio: 1200x450</small>
                    </div>
                  )}
                  <input
                    id="banner-image-upload"
                    type="file"
                    className="d-none"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </Form.Group>

              <Button type="submit" disabled={submitting} className="w-100 py-3 fw-bold rounded-3">
                {submitting ? <Spinner size="sm" /> : "Publish Banner"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Side: List of Banners */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm p-4 bg-white rounded-4 h-100">
            <h5 className="fw-bold mb-4">Active Banners ({banners.length})</h5>

            {loading ? (
              <div className="text-center py-5">
                <Spinner variant="primary" />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-5 text-muted bg-light rounded-3">
                No custom banners uploaded. The homepage will display default Fallback Banners.
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Image</th>
                      <th>Details</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner._id}>
                        <td style={{ width: "120px" }}>
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="img-fluid rounded"
                            style={{ height: "60px", width: "120px", objectFit: "cover" }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold small text-dark mb-0">{banner.title}</div>
                          {banner.subtitle && <small className="text-muted d-block smaller">{banner.subtitle}</small>}
                          <small className="text-primary smaller d-block mt-1">
                            <FaExternalLinkAlt size={10} /> Link: {banner.link}
                          </small>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle"
                            onClick={() => handleDelete(banner._id)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminBanners;

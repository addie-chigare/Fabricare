import { useEffect, useState } from "react";
import axios from "axios";
import { FaSave, FaCloudUploadAlt } from "react-icons/fa";

const AdminSettings = () => {
  const [brandName, setBrandName] = useState("");
  const [footerAbout, setFooterAbout] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerAddress, setFooterAddress] = useState("");
  const [laundryWashFoldPrice, setLaundryWashFoldPrice] = useState(49);
  const [laundryDryCleanPrice, setLaundryDryCleanPrice] = useState(99);
  const [laundrySteamIronPrice, setLaundrySteamIronPrice] = useState(19);
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [aboutMission, setAboutMission] = useState("");
  const [aboutVision, setAboutVision] = useState("");
  const [aboutImageUrl, setAboutImageUrl] = useState("");
  const [contactMapEmbed, setContactMapEmbed] = useState("");
  const [logo, setLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/settings");
      const { 
        brandName, footerAbout, footerEmail, footerPhone, footerAddress, logo, 
        laundryWashFoldPrice, laundryDryCleanPrice, laundrySteamIronPrice,
        aboutTitle, aboutDescription, aboutMission, aboutVision, aboutImageUrl, contactMapEmbed 
      } = res.data;
      setBrandName(brandName || "");
      setFooterAbout(footerAbout || "");
      setFooterEmail(footerEmail || "");
      setFooterPhone(footerPhone || "");
      setFooterAddress(footerAddress || "");
      setPreviewLogo(logo || "");
      setLaundryWashFoldPrice(laundryWashFoldPrice !== undefined ? laundryWashFoldPrice : 49);
      setLaundryDryCleanPrice(laundryDryCleanPrice !== undefined ? laundryDryCleanPrice : 99);
      setLaundrySteamIronPrice(laundrySteamIronPrice !== undefined ? laundrySteamIronPrice : 19);
      setAboutTitle(aboutTitle || "");
      setAboutDescription(aboutDescription || "");
      setAboutMission(aboutMission || "");
      setAboutVision(aboutVision || "");
      setAboutImageUrl(aboutImageUrl || "");
      setContactMapEmbed(contactMapEmbed || "");
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("brandName", brandName);
      formData.append("footerAbout", footerAbout);
      formData.append("footerEmail", footerEmail);
      formData.append("footerPhone", footerPhone);
      formData.append("footerAddress", footerAddress);
      formData.append("laundryWashFoldPrice", laundryWashFoldPrice);
      formData.append("laundryDryCleanPrice", laundryDryCleanPrice);
      formData.append("laundrySteamIronPrice", laundrySteamIronPrice);
      formData.append("aboutTitle", aboutTitle);
      formData.append("aboutDescription", aboutDescription);
      formData.append("aboutMission", aboutMission);
      formData.append("aboutVision", aboutVision);
      formData.append("aboutImageUrl", aboutImageUrl);
      formData.append("contactMapEmbed", contactMapEmbed);
      if (logo) {
        formData.append("logo", logo);
      }

      const res = await axios.put(
        "http://localhost:8000/api/v1/settings/admin/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Settings updated successfully! Changes are now live across the storefront.");
      // Reload updated values
      const updated = res.data.settings;
      setBrandName(updated.brandName || "");
      setFooterAbout(updated.footerAbout || "");
      setFooterEmail(updated.footerEmail || "");
      setFooterPhone(updated.footerPhone || "");
      setFooterAddress(updated.footerAddress || "");
      setPreviewLogo(updated.logo || "");
      setLaundryWashFoldPrice(updated.laundryWashFoldPrice !== undefined ? updated.laundryWashFoldPrice : 49);
      setLaundryDryCleanPrice(updated.laundryDryCleanPrice !== undefined ? updated.laundryDryCleanPrice : 99);
      setLaundrySteamIronPrice(updated.laundrySteamIronPrice !== undefined ? updated.laundrySteamIronPrice : 19);
      setAboutTitle(updated.aboutTitle || "");
      setAboutDescription(updated.aboutDescription || "");
      setAboutMission(updated.aboutMission || "");
      setAboutVision(updated.aboutVision || "");
      setAboutImageUrl(updated.aboutImageUrl || "");
      setContactMapEmbed(updated.contactMapEmbed || "");
      
      // Emit a global custom event so the Navbar and Footer fetch the new settings immediately!
      window.dispatchEvent(new Event("settings-updated"));
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Global Store Settings</h3>
        <p className="text-muted small mb-0">Customize storefront branding, header logo, and footer information from a single dashboard.</p>
      </div>

      {success && <div className="alert alert-success alert-dismissible fade show py-2.5 small" role="alert">{success}</div>}
      {error && <div className="alert alert-danger alert-dismissible fade show py-2.5 small" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* LEFT: Identity & Branding */}
          <div className="col-lg-8">
            <div className="admin-card mb-4">
              <h5 className="fw-bold mb-4">Brand Identity</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Brand Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Fabricare Signature"
                  required
                />
              </div>
            </div>

            <div className="admin-card mb-4">
              <h5 className="fw-bold mb-4">Footer Information</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">Footer "About Us" Summary</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={footerAbout}
                  onChange={(e) => setFooterAbout(e.target.value)}
                  placeholder="Summarize your company's mission/value proposition..."
                  required
                />
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Support Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="support@yourbrand.com"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Support Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerPhone}
                    onChange={(e) => setFooterPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    required
                  />
                </div>
                <div className="col-12 mt-3">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Company Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={footerAddress}
                    onChange={(e) => setFooterAddress(e.target.value)}
                    placeholder="123 Fashion Street, Tech Park, City, Country"
                    required
                  />
                </div>
              </div>
            </div>

            {/* LAUNDRY PRICING CARD */}
            <div className="admin-card mb-4">
              <h5 className="fw-bold mb-4">Laundry Service Pricing (₹)</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Wash & Fold (per kg)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₹</span>
                    <input
                      type="number"
                      className="form-control border-start-0"
                      value={laundryWashFoldPrice}
                      onChange={(e) => setLaundryWashFoldPrice(e.target.value)}
                      min={0}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Dry Cleaning (per item)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₹</span>
                    <input
                      type="number"
                      className="form-control border-start-0"
                      value={laundryDryCleanPrice}
                      onChange={(e) => setLaundryDryCleanPrice(e.target.value)}
                      min={0}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Steam Ironing (per item)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₹</span>
                    <input
                      type="number"
                      className="form-control border-start-0"
                      value={laundrySteamIronPrice}
                      onChange={(e) => setLaundrySteamIronPrice(e.target.value)}
                      min={0}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ABOUT US & CONTACT PAGE CUSTOMIZATION */}
            <div className="admin-card">
              <h5 className="fw-bold mb-4">About Us & Contact Us Content</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">About Us Page Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  placeholder="e.g. About Our Brand"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">About Us Story / Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={aboutDescription}
                  onChange={(e) => setAboutDescription(e.target.value)}
                  placeholder="Write a detailed description about your company, history, or values..."
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted text-uppercase">About Us Image URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={aboutImageUrl}
                  onChange={(e) => setAboutImageUrl(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/photo..."
                  required
                />
                <small className="text-muted smaller">A direct image URL representing the brand on the About page</small>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Our Mission</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={aboutMission}
                    onChange={(e) => setAboutMission(e.target.value)}
                    placeholder="Company mission statement..."
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted text-uppercase">Our Vision</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={aboutVision}
                    onChange={(e) => setAboutVision(e.target.value)}
                    placeholder="Company vision statement..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label small fw-semibold text-muted text-uppercase">Google Maps Embed URL</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={contactMapEmbed}
                  onChange={(e) => setContactMapEmbed(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  required
                />
                <small className="text-muted smaller">
                  Go to Google Maps, click Share, select Embed a map, and copy the URL inside the src="..." attribute.
                </small>
              </div>
            </div>
          </div>

          {/* RIGHT: Logo Media & Save Button */}
          <div className="col-lg-4">
            <div className="admin-card mb-4 text-center">
              <h5 className="fw-bold mb-4 text-start">Header Logo</h5>
              <div 
                className="border border-2 border-dashed rounded-3 p-4 mb-3 position-relative bg-light"
                style={{ cursor: "pointer", minHeight: "180px" }}
                onClick={() => document.getElementById("store-logo-input").click()}
              >
                {previewLogo ? (
                  <img
                    src={previewLogo.startsWith("http") || previewLogo.startsWith("/") || previewLogo.startsWith("blob:") ? previewLogo : `/${previewLogo}`}
                    alt="Store Logo Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "120px", objectFit: "contain" }}
                    onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Logo"; }}
                  />
                ) : (
                  <div className="py-4">
                    <FaCloudUploadAlt size={40} className="text-muted mb-2" />
                    <p className="mb-0 text-muted small">Upload new store logo</p>
                  </div>
                )}
                <input
                  id="store-logo-input"
                  type="file"
                  className="d-none"
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </div>
              <small className="text-muted smaller">Recommended dimensions: 150px x 40px (transparent PNG)</small>
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
                <span>{saving ? "Saving settings..." : "Publish Settings"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

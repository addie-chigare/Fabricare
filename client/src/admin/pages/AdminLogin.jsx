import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser, FaArrowLeft } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    const id = "fabricare-admin-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/auth/login",
        formData
      );

      const user = res.data.user;

      if (user.role !== "admin") {
        setError("Access denied — this account has no administrator privileges.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin/dashboard");
      window.location.reload();
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.message || "Login failed. Check your credentials and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fc-login">
      <style>{css}</style>

      {/* Brand panel */}
      <div className="fc-brand">
        <svg className="fc-weave" viewBox="0 0 400 800" preserveAspectRatio="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 100 + 40} x2="400" y2={i * 100 + 40} className="fc-thread fc-thread--h" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 100 + 40} y1="0" x2={i * 100 + 40} y2="800" className="fc-thread fc-thread--v" />
          ))}
          <line x1="0" y1="0" x2="0" y2="800" className="fc-shuttle" />
        </svg>

        <div className="fc-brand-content">
          <div className="fc-mark" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path d="M2 15C2 8 8 2 15 2s13 6 13 13-6 13-13 13S2 22 2 15Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 15h12M15 9v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <p className="fc-eyebrow">ADMIN&nbsp;ACCESS</p>
          <h1 className="fc-wordmark">Fabricare</h1>
          <p className="fc-tagline">Operations control for every stage of the garment lifecycle — intake, care, and delivery, woven into one system.</p>

          <div className="fc-stat-row">
            <div>
              <span className="fc-stat-num">128k</span>
              <span className="fc-stat-label">Orders tracked</span>
            </div>
            <div>
              <span className="fc-stat-num">99.98%</span>
              <span className="fc-stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="fc-form-panel">
        <div className="fc-form-wrap">
          <a href="/" className="fc-back">
            <FaArrowLeft size={11} /> Back to storefront
          </a>

          <h2 className="fc-heading">Sign in</h2>
          <p className="fc-subheading">Enter your administrator credentials to continue.</p>

          {error && <div className="fc-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={`fc-field ${focused === "username" ? "is-focused" : ""} ${formData.username ? "has-value" : ""}`}>
              <FaUser className="fc-field-icon" size={13} />
              <input
                type="text"
                name="username"
                id="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused(null)}
                required
                disabled={loading}
              />
              <label htmlFor="username">Username or email</label>
            </div>

            <div className={`fc-field ${focused === "password" ? "is-focused" : ""} ${formData.password ? "has-value" : ""}`}>
              <FaLock className="fc-field-icon" size={13} />
              <input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                disabled={loading}
              />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="fc-submit" disabled={loading}>
              {loading ? <span className="fc-spinner" aria-hidden="true" /> : "Access dashboard"}
            </button>
          </form>

          <p className="fc-footnote">Protected area. Access attempts are logged.</p>
        </div>
      </div>
    </div>
  );
};

const css = `
  .fc-login {
    min-height: 100vh;
    width: 100%;
    display: flex;
    font-family: 'Inter', sans-serif;
    background: #f4f4f2;
  }

  /* ---------- Brand panel ---------- */
  .fc-brand {
    position: relative;
    flex: 0 0 44%;
    background: #10131c;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 4rem 3.5rem;
  }
  .fc-weave { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.5; }
  .fc-thread { stroke: #2a3142; stroke-width: 1; }
  .fc-thread--v { stroke: #232a3a; }
  .fc-shuttle {
    stroke: #14b8a6;
    stroke-width: 2;
    filter: drop-shadow(0 0 6px rgba(20, 184, 166, 0.7));
    animation: fc-shuttle-move 7s linear infinite;
  }
  @keyframes fc-shuttle-move {
    0% { transform: translateX(0); opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { transform: translateX(400px); opacity: 0; }
  }

  .fc-brand-content { position: relative; z-index: 1; color: #e9ebf1; max-width: 360px; }
  .fc-mark {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    color: #14b8a6;
    border: 1px solid rgba(20,184,166,0.35);
    border-radius: 12px;
    margin-bottom: 1.75rem;
  }
  .fc-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    color: #eab308;
    margin: 0 0 0.65rem;
  }
  .fc-wordmark {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 2.6rem;
    line-height: 1.05;
    margin: 0 0 1rem;
    letter-spacing: -0.01em;
  }
  .fc-tagline {
    font-size: 0.94rem;
    line-height: 1.6;
    color: #9aa3b5;
    margin: 0 0 2.75rem;
  }
  .fc-stat-row { display: flex; gap: 2.5rem; padding-top: 1.75rem; border-top: 1px solid rgba(255,255,255,0.08); }
  .fc-stat-row > div { display: flex; flex-direction: column; gap: 0.2rem; }
  .fc-stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; color: #f1f0ec; }
  .fc-stat-label { font-size: 0.72rem; color: #6b7386; }

  /* ---------- Form panel ---------- */
  .fc-form-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2.5rem; }
  .fc-form-wrap { width: 100%; max-width: 360px; }

  .fc-back {
    display: inline-flex; align-items: center; gap: 0.45rem;
    font-size: 0.78rem; color: #6b7280; text-decoration: none;
    margin-bottom: 2.5rem;
    transition: color 0.15s ease;
  }
  .fc-back:hover { color: #14b8a6; }

  .fc-heading {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 1.6rem;
    color: #12151f;
    margin: 0 0 0.4rem;
  }
  .fc-subheading { font-size: 0.88rem; color: #6b7280; margin: 0 0 1.75rem; }

  .fc-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 0.82rem;
    padding: 0.7rem 0.9rem;
    border-radius: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .fc-field {
    position: relative;
    margin-bottom: 1.35rem;
    border-bottom: 1.5px solid #d8d8d4;
    transition: border-color 0.15s ease;
  }
  .fc-field.is-focused { border-color: #14b8a6; }
  .fc-field-icon {
    position: absolute; left: 0; top: 1.15rem;
    color: #9aa0a6;
    transition: color 0.15s ease;
  }
  .fc-field.is-focused .fc-field-icon { color: #14b8a6; }
  .fc-field input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    padding: 1.35rem 0 0.55rem 1.6rem;
    font-size: 0.95rem;
    color: #12151f;
    font-family: 'Inter', sans-serif;
  }
  .fc-field label {
    position: absolute;
    left: 1.6rem;
    top: 1.15rem;
    font-size: 0.95rem;
    color: #9aa0a6;
    pointer-events: none;
    transition: all 0.15s ease;
  }
  .fc-field.is-focused label,
  .fc-field.has-value label {
    top: 0;
    font-size: 0.72rem;
    color: #14b8a6;
    letter-spacing: 0.02em;
  }

  .fc-submit {
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.85rem;
    border: none;
    border-radius: 0.7rem;
    background: #12151f;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.92rem;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s ease, transform 0.1s ease;
  }
  .fc-submit:hover:not(:disabled) { background: #14b8a6; }
  .fc-submit:active:not(:disabled) { transform: scale(0.99); }
  .fc-submit:disabled { opacity: 0.7; cursor: not-allowed; }

  .fc-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: fc-spin 0.7s linear infinite;
  }
  @keyframes fc-spin { to { transform: rotate(360deg); } }

  .fc-footnote { margin-top: 1.75rem; font-size: 0.72rem; color: #9aa0a6; text-align: center; }

  @media (max-width: 860px) {
    .fc-brand { display: none; }
    .fc-form-panel { padding: 1.5rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fc-shuttle { animation: none; opacity: 0.6; }
  }
`;

export default AdminLogin;

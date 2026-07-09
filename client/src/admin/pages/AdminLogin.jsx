import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    const id = "fabricare-admin-fonts-v2";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
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
    <div className="fc2-page">
      <style>{css}</style>

      <div className="fc2-card">
        {/* registration marks — corner notches like a cutting pattern */}
        <span className="fc2-notch fc2-notch--tl" />
        <span className="fc2-notch fc2-notch--tr" />
        <span className="fc2-notch fc2-notch--bl" />
        <span className="fc2-notch fc2-notch--br" />

        <div className="fc2-ruler">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={i % 4 === 0 ? "fc2-tick fc2-tick--major" : "fc2-tick"} />
          ))}
        </div>

        <div className="fc2-body">
          <div className="fc2-head">
            <div className="fc2-badge">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 4v3M10 13v3M4 10h3M13 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="fc2-eyebrow">PATTERN&nbsp;NO. FC—ADM—01</p>
              <h1 className="fc2-title">Fabricare</h1>
            </div>
          </div>

          <p className="fc2-sub">Admin console — sign in to adjust cut, care, and delivery specs.</p>

          {error && <div className="fc2-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className={`fc2-field ${focused === "username" ? "is-focused" : ""}`}>
              <label htmlFor="username"><FaUser size={10} /> Username or email</label>
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
                placeholder="admin@fabricare.com"
              />
            </div>

            <div className={`fc2-field ${focused === "password" ? "is-focused" : ""}`}>
              <label htmlFor="password"><FaLock size={10} /> Password</label>
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
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="fc2-submit" disabled={loading}>
              {loading ? <span className="fc2-spinner" aria-hidden="true" /> : "Access dashboard"}
              <span className="fc2-submit-mark">×</span>
            </button>
          </form>

          <div className="fc2-foot">
            <a href="/" className="fc2-back">← Back to storefront</a>
            <span className="fc2-scale">SCALE 1:1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const css = `
  .fc2-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background:
      linear-gradient(#dfe2e8 1px, transparent 1px) 0 0 / 24px 24px,
      linear-gradient(90deg, #dfe2e8 1px, transparent 1px) 0 0 / 24px 24px,
      #f2f3f5;
    font-family: 'IBM Plex Sans', sans-serif;
  }

  .fc2-card {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: #fcfcfb;
    border: 1.4px solid #232733;
    box-shadow: 6px 6px 0 rgba(35,39,51,0.08);
  }

  .fc2-notch {
    position: absolute;
    width: 9px; height: 9px;
    border: 1.4px solid #232733;
    background: #f2f3f5;
    transform: rotate(45deg);
  }
  .fc2-notch--tl { top: -5.5px; left: -5.5px; }
  .fc2-notch--tr { top: -5.5px; right: -5.5px; }
  .fc2-notch--bl { bottom: -5.5px; left: -5.5px; }
  .fc2-notch--br { bottom: -5.5px; right: -5.5px; }

  .fc2-ruler {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0 1.5rem;
    height: 16px;
    border-bottom: 1px solid #d8dae0;
  }
  .fc2-tick { width: 1px; height: 5px; background: #c3c6cd; }
  .fc2-tick--major { height: 9px; background: #8a8f9c; }

  .fc2-body { padding: 2rem 2rem 1.5rem; }

  .fc2-head { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.1rem; }
  .fc2-badge {
    width: 38px; height: 38px;
    flex: 0 0 38px;
    border: 1.4px solid #232733;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #e23744;
  }
  .fc2-eyebrow {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.06em;
    color: #8a8f9c;
    margin: 0 0 0.15rem;
  }
  .fc2-title {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1.4rem;
    color: #232733;
    margin: 0;
    letter-spacing: -0.01em;
  }
  .fc2-sub { font-size: 0.84rem; color: #5a5f6b; line-height: 1.5; margin: 0 0 1.5rem; }

  .fc2-alert {
    background: #fdecec;
    border: 1px solid #e23744;
    color: #a4222b;
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 1.1rem;
  }

  .fc2-field { margin-bottom: 1.1rem; }
  .fc2-field label {
    display: flex; align-items: center; gap: 0.4rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    color: #5a5f6b;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }
  .fc2-field.is-focused label { color: #e23744; }
  .fc2-field input {
    width: 100%;
    box-sizing: border-box;
    border: 1.4px solid #c3c6cd;
    background: #fff;
    padding: 0.65rem 0.75rem;
    font-size: 0.9rem;
    font-family: 'IBM Plex Sans', sans-serif;
    color: #232733;
    outline: none;
    transition: border-color 0.12s ease;
  }
  .fc2-field input::placeholder { color: #b7bac2; }
  .fc2-field.is-focused input { border-color: #e23744; }

  .fc2-submit {
    width: 100%;
    margin-top: 0.4rem;
    padding: 0.75rem;
    border: 1.4px solid #232733;
    background: #232733;
    color: #fcfcfb;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.12s ease;
  }
  .fc2-submit:hover:not(:disabled) { background: #e23744; border-color: #e23744; }
  .fc2-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .fc2-submit-mark { position: absolute; right: 0.9rem; font-size: 0.9rem; opacity: 0.6; }

  .fc2-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: fc2-spin 0.7s linear infinite;
  }
  @keyframes fc2-spin { to { transform: rotate(360deg); } }

  .fc2-foot {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px dashed #d8dae0;
  }
  .fc2-back { font-size: 0.76rem; color: #5a5f6b; text-decoration: none; }
  .fc2-back:hover { color: #e23744; }
  .fc2-scale {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.66rem;
    color: #b7bac2;
    letter-spacing: 0.04em;
  }

  @media (max-width: 460px) {
    .fc2-page { padding: 1rem; }
    .fc2-body { padding: 1.5rem 1.25rem 1.25rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .fc2-spinner { animation: none; }
  }
`;

export default AdminLogin;

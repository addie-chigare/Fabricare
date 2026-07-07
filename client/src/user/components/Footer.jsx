import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const styles = {
  footer: {
    background: "#0f172a",
    color: "#94a3b8",
  },
  newsletter: {
    background: "linear-gradient(90deg, #1e293b, #0f172a)",
    padding: "2.25rem 0",
    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
  },
  newsletterHeading: {
    color: "#fff",
    marginBottom: "0.25rem",
  },
  input: {
    flex: 1,
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#e2e8f0",
    fontSize: "0.85rem",
    outline: "none",
  },
  subscribeBtn: {
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  brandName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "1.05rem",
    letterSpacing: "0.02em",
  },
  heading: {
    color: "#fff",
    textTransform: "uppercase",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    marginBottom: "1rem",
    display: "inline-block",
  },
  headingUnderline: {
    width: "24px",
    height: "2px",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    borderRadius: "2px",
    marginTop: "6px",
  },
  link: {
    color: "#94a3b8",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
  socialIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.06)",
    color: "#e2e8f0",
    fontSize: "0.8rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "background 0.2s ease, transform 0.2s ease",
  },
  contactIcon: {
    color: "#8b5cf6",
    flexShrink: 0,
  },
  bottomBar: {
    borderTop: "1px solid rgba(148, 163, 184, 0.15)",
    fontSize: "0.8rem",
  },
};

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to load settings in Footer:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener("settings-updated", fetchSettings);
    return () => window.removeEventListener("settings-updated", fetchSettings);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setEmail("");
  };

  const linkStyle = (key) => ({
    ...styles.link,
    color: hoveredLink === key ? "#fff" : "#94a3b8",
    paddingLeft: hoveredLink === key ? "4px" : "0px",
  });

  const socialStyle = (key) => ({
    ...styles.socialIcon,
    background: hoveredSocial === key ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : "rgba(255, 255, 255, 0.06)",
    transform: hoveredSocial === key ? "translateY(-2px)" : "translateY(0)",
  });

  const socialLinks = [
    { label: "F", href: settings?.facebook || "#" },
    { label: "I", href: settings?.instagram || "#" },
    { label: "X", href: settings?.twitter || "#" },
  ];

  return (
    <footer style={{ ...styles.footer, position: "relative" }}>
      <div style={styles.newsletter}>
        <Container>
          <Row className="align-items-center gy-3">
            <Col md={6}>
              <h5 style={styles.newsletterHeading}>Stay in the loop</h5>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                Offers, updates and laundry tips — straight to your inbox.
              </p>
            </Col>
            <Col md={6}>
              <form style={{ display: "flex", gap: "0.5rem" }} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
                <button type="submit" style={styles.subscribeBtn}>
                  Subscribe
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </div>

      <div style={{ paddingTop: "3rem", paddingBottom: "1.5rem" }}>
        <Container>
          <Row className="gy-4 mb-4">
            <Col lg={4} md={12}>
              <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img
                  src={
                    settings?.logo
                      ? settings.logo.startsWith("http") || settings.logo.startsWith("/")
                        ? settings.logo
                        : `/${settings.logo}`
                      : "/logo.png"
                  }
                  alt={`${settings?.brandName || "Fabricare"} Logo`}
                  height="34"
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x100?text=Logo";
                  }}
                />
                <span style={styles.brandName}>{settings?.brandName || "Fabricare"}</span>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  maxWidth: "300px",
                  lineHeight: "1.7",
                  marginBottom: "1.5rem",
                }}
              >
                {settings?.footerAbout ||
                  "Your ultimate destination for premium clothing and professional laundry services."}
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {socialLinks.map((s, i) => {
                  const anchorStyle = socialStyle(i);
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      style={anchorStyle}
                      onMouseEnter={() => setHoveredSocial(i)}
                      onMouseLeave={() => setHoveredSocial(null)}
                    >
                      {s.label}
                    </a>
                  );
                })}
              </div>
            </Col>

            <Col lg={2} md={4} sm={6}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={styles.heading}>Quick Links</span>
                <span style={styles.headingUnderline}></span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "0.85rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/"
                    style={linkStyle("home")}
                    onMouseEnter={() => setHoveredLink("home")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Home
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/products"
                    style={linkStyle("products")}
                    onMouseEnter={() => setHoveredLink("products")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    style={linkStyle("cart")}
                    onMouseEnter={() => setHoveredLink("cart")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    My Cart
                  </Link>
                </li>
              </ul>
            </Col>

            <Col lg={2} md={4} sm={6}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={styles.heading}>Company</span>
                <span style={styles.headingUnderline}></span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "0.85rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/about"
                    style={linkStyle("about")}
                    onMouseEnter={() => setHoveredLink("about")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    About Us
                  </Link>
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <Link
                    to="/careers"
                    style={linkStyle("careers")}
                    onMouseEnter={() => setHoveredLink("careers")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    style={linkStyle("contact")}
                    onMouseEnter={() => setHoveredLink("contact")}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </Col>

            <Col lg={4} md={4} sm={12}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={styles.heading}>Customer Support</span>
                <span style={styles.headingUnderline}></span>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "0.85rem",
                  marginTop: "1rem",
                  color: "#cbd5e1",
                }}
              >
                <li style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <span style={styles.contactIcon}>✉</span>
                  <span>{settings?.footerEmail || "hello@fabricare.com"}</span>
                </li>
                <li style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem" }}>
                  <span style={styles.contactIcon}>☎</span>
                  <span>{settings?.footerPhone || "+1 (555) 000-1234"}</span>
                </li>
                <li style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={styles.contactIcon}>⚲</span>
                  <span>
                    {settings?.footerAddress ||
                      "123 Fabricare Towers, Fashion District, Mumbai, India"}
                  </span>
                </li>
              </ul>
            </Col>
          </Row>

          <div
            style={{
              ...styles.bottomBar,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "1.5rem",
            }}
            className="flex-md-row"
          >
            <p style={{ margin: 0, marginBottom: "0.5rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              © {new Date().getFullYear()} {settings?.brandName || "Fabricare"}. Crafted with ✨ for you.
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span style={{ color: "#94a3b8", cursor: "pointer" }}>Privacy Policy</span>
              <span style={{ color: "#94a3b8", cursor: "pointer" }}>Terms of Service</span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;

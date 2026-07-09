import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import API from "../../services/api";
import { FaEye, FaRocket, FaHandshake } from "react-icons/fa";

const About = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings on About page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted small">Loading company details...</p>
      </div>
    );
  }

  const brandName = settings?.brandName || "Fabricare";
  const aboutTitle = settings?.aboutTitle || "About Our Brand";
  const aboutDescription = settings?.aboutDescription || "We are dedicated to providing the highest quality products and laundry services. Our garments are sourced with care and designed for modern life, and our garment care services use state-of-the-art eco-friendly technologies to keep your wardrobe fresh.";
  const aboutMission = settings?.aboutMission || "To deliver exceptional apparel quality and convenient, smart fabric care solutions that enrich daily lives.";
  const aboutVision = settings?.aboutVision || "To build a sustainable, trusted lifestyle brand bridging retail and convenience services.";
  const aboutImageUrl = settings?.aboutImageUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="pb-5">
      {/* 🚀 HERO SECTION */}
      <section 
        className="py-5 text-center position-relative overflow-hidden mb-5"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)",
          borderRadius: "0 0 2rem 2rem",
          borderBottom: "1px solid var(--border-light)"
        }}
      >
        <div className="position-absolute rounded-circle bg-primary opacity-10" style={{ width: "250px", height: "250px", right: "-50px", top: "-50px", filter: "blur(60px)", zIndex: 0 }}></div>
        <div className="position-absolute rounded-circle bg-secondary opacity-10" style={{ width: "200px", height: "200px", left: "-50px", bottom: "-50px", filter: "blur(50px)", zIndex: 0 }}></div>
        
        <Container className="position-relative z-1 py-4">
          <Badge bg="primary" className="px-3 py-2 text-uppercase fw-bold mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
            Our Story
          </Badge>
          <h1 className="display-4 fw-bold text-dark mb-3 text-capitalize">{aboutTitle}</h1>
          <p className="text-muted max-width-600 mx-auto lead fs-6">
            Discover who we are, what drives us, and how we care for your garments.
          </p>
        </Container>
      </section>

      {/* 📖 BRAND STORY SECTION */}
      <Container className="mb-5">
        <Row className="align-items-center gy-4">
          <Col lg={6}>
            <div className="pe-lg-4">
              <h2 className="fw-bold text-dark mb-4 fs-3">Crafting Quality, Tailoring Care</h2>
              <p className="text-muted mb-4" style={{ lineHeight: "1.8", fontSize: "0.95rem" }}>
                {aboutDescription}
              </p>
              <div className="d-flex align-items-center gap-3 p-3 bg-white border rounded-4 shadow-sm">
                <div className="bg-light-blue p-3 rounded-circle text-primary flex-shrink-0">
                  <FaHandshake size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1 text-dark">Our Promise to You</h6>
                  <p className="text-muted small mb-0">Uncompromising quality in every stitch and a fresh clean on every delivery.</p>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={6}>
            <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{ maxHeight: "400px" }}>
              <img 
                src={aboutImageUrl} 
                alt={`${brandName} Workspace`} 
                className="w-100 h-100 object-fit-cover"
                style={{ transition: "var(--transition)", minHeight: "350px" }}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* 🎯 MISSION & VISION SECTION */}
      <section className="py-5 bg-white border-top border-bottom mb-5">
        <Container>
          <Row className="gy-4 justify-content-center">
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-light h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
                <div className="text-primary mb-3"><FaRocket size={32} /></div>
                <h4 className="fw-bold text-dark mb-3">Our Mission</h4>
                <p className="text-muted small mb-0" style={{ lineHeight: "1.7", fontSize: "0.9rem" }}>
                  {aboutMission}
                </p>
              </Card>
            </Col>
            
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-sm p-4 rounded-4 bg-light h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
                <div className="text-success mb-3"><FaEye size={32} /></div>
                <h4 className="fw-bold text-dark mb-3">Our Vision</h4>
                <p className="text-muted small mb-0" style={{ lineHeight: "1.7", fontSize: "0.9rem" }}>
                  {aboutVision}
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 🏆 CORE VALUES BANNER */}
      <Container className="text-center py-4">
        <h3 className="fw-bold text-dark mb-5 fs-4">What Sets Us Apart</h3>
        <Row className="g-4">
          <Col sm={6} md={3}>
            <div className="p-3">
              <h5 className="fw-bold text-primary mb-2">100%</h5>
              <h6 className="fw-bold text-dark mb-1">Organic Cotton</h6>
              <p className="text-muted small mb-0">Hypoallergenic & soft fabrics</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <h5 className="fw-bold text-primary mb-2">Eco-Friendly</h5>
              <h6 className="fw-bold text-dark mb-1">Laundry Solvents</h6>
              <p className="text-muted small mb-0">Zero toxic waste on clothes</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <h5 className="fw-bold text-primary mb-2">24 Hours</h5>
              <h6 className="fw-bold text-dark mb-1">Fast Delivery</h6>
              <p className="text-muted small mb-0">Doorstep pickup & drop-off</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <h5 className="fw-bold text-primary mb-2">Secure</h5>
              <h6 className="fw-bold text-dark mb-1">Payments</h6>
              <p className="text-muted small mb-0">Worry-free online checkout</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;

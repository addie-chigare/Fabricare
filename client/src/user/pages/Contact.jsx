import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from "react-bootstrap";
import API from "../../services/api";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get("/settings");
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to load settings on Contact page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    // Simulate sending message
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(`Thank you, ${name}! Your message has been received. We will get back to you shortly.`);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1200);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted small">Loading contact details...</p>
      </div>
    );
  }

  const brandName = settings?.brandName || "Fabricare";
  const contactEmail = settings?.footerEmail || "hello@fabricare.com";
  const contactPhone = settings?.footerPhone || "+1 (555) 000-1234";
  const contactAddress = settings?.footerAddress || "123 Fabricare Towers, Fashion District, Mumbai, India";
  
  // Clean map embed: if it starts with <iframe, we extract the src, otherwise use it directly
  let mapSrc = settings?.contactMapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8258359287313!2d72.8253163153835!3d19.07139198708817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c91130392c07%3A0x1102e50d53c7a3!2sBandra%20Kurla%20Complex%2C%20Bandra%20East%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1655000000000!5m2!1sen!2sin";
  if (mapSrc.includes("<iframe")) {
    const match = mapSrc.match(/src="([^"]+)"/);
    if (match && match[1]) {
      mapSrc = match[1];
    }
  }

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
          <span className="text-primary text-uppercase tracking-wider fw-bold smaller mb-2 d-inline-block" style={{ letterSpacing: "0.1em" }}>
            Reach Out
          </span>
          <h1 className="display-4 fw-bold text-dark mb-3">Contact Us</h1>
          <p className="text-muted max-width-600 mx-auto lead fs-6">
            Have questions about our clothing collection or laundry services? We're here to help!
          </p>
        </Container>
      </section>

      <Container className="mb-5">
        {/* ℹ️ CONTACT CARDS */}
        <Row className="gy-4 mb-5 text-center">
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
              <div className="text-primary mb-3"><FaPhoneAlt size={30} /></div>
              <h5 className="fw-bold text-dark mb-2">Phone Number</h5>
              <p className="text-muted small mb-0 font-monospace">{contactPhone}</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
              <div className="text-primary mb-3"><FaEnvelope size={30} /></div>
              <h5 className="fw-bold text-dark mb-2">Email Address</h5>
              <p className="text-muted small mb-0 font-monospace">{contactEmail}</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4 rounded-4 bg-white h-100 product-card-hover" style={{ transition: "var(--transition)" }}>
              <div className="text-primary mb-3"><FaMapMarkerAlt size={30} /></div>
              <h5 className="fw-bold text-dark mb-2">Our Store</h5>
              <p className="text-muted small mb-0">{contactAddress}</p>
            </Card>
          </Col>
        </Row>

        <Row className="gy-5 align-items-stretch">
          {/* 📝 INTERACTIVE CONTACT FORM */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
              <h3 className="fw-bold text-dark mb-4 fs-4">Send Us a Message</h3>
              
              {successMsg && <Alert variant="success" className="py-2.5 small mb-4">{successMsg}</Alert>}
              {errorMsg && <Alert variant="danger" className="py-2.5 small mb-4">{errorMsg}</Alert>}

              <Form onSubmit={handleFormSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted text-uppercase">Full Name</Form.Label>
                      <Form.Control 
                        type="text" 
                        required 
                        placeholder="Your Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-muted text-uppercase">Email Address</Form.Label>
                      <Form.Control 
                        type="email" 
                        required 
                        placeholder="name@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Subject</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    placeholder="Inquiry Subject" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Your Message</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    required 
                    placeholder="Write details of your question or request..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={submitting} 
                  className="w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  style={{ borderRadius: "10px" }}
                >
                  {submitting ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FaPaperPlane size={14} />
                  )}
                  <span>{submitting ? "Sending Message..." : "Send Message"}</span>
                </Button>
              </Form>
            </Card>
          </Col>

          {/* 🗺️ GOOGLE MAPS EMBED */}
          <Col lg={6}>
            <Card className="border-0 shadow-sm overflow-hidden rounded-4 h-100 bg-white">
              <iframe
                title="Google Maps Location"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;

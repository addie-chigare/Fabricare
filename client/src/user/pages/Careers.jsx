import { useState } from "react";
import { Container, Row, Col, Card, Badge, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaPaperPlane } from "react-icons/fa";

const Careers = () => {
  // Application Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const jobOpenings = [
    {
      id: "job-1",
      title: "Garment Care & Laundry Specialist",
      department: "Operations",
      location: "Mumbai, India",
      type: "Full-Time",
      description: "Supervise washing, dry cleaning, and finishing of premium garments using eco-friendly solvents and modern steam press systems."
    },
    {
      id: "job-2",
      title: "Store Manager",
      department: "Retail Management",
      location: "Mumbai, India",
      type: "Full-Time",
      description: "Oversee storefront operations, customer relations, inventory coordination, and laundry pickup scheduling."
    },
    {
      id: "job-3",
      title: "Delivery & Logistics Associate",
      department: "Logistics",
      location: "Mumbai, India",
      type: "Part-Time / Full-Time",
      description: "Handle secure doorstep pickup and fresh delivery of customer garments with a customer-first attitude."
    }
  ];

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(`Thank you, ${name}! Your application for the ${position || "selected"} position has been received. We will review your profile and reach out soon.`);
      setName("");
      setEmail("");
      setPhone("");
      setPosition("");
      setResumeUrl("");
      setMessage("");
    }, 1200);
  };

  const handleApplyClick = (jobTitle) => {
    setPosition(jobTitle);
    const formElement = document.getElementById("application-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            Join Fabricare
          </Badge>
          <h1 className="display-4 fw-bold text-dark mb-3">Careers at Fabricare</h1>
          <p className="text-muted max-width-600 mx-auto lead fs-6">
            Build your career with India's leading integrated clothing and smart laundry brand. Explore our open positions below.
          </p>
        </Container>
      </section>

      <Container className="mb-5">
        <Row className="gy-5">
          {/* 💼 JOB LISTINGS */}
          <Col lg={7}>
            <h3 className="fw-bold text-dark mb-4 fs-4">Current Openings</h3>
            <div className="d-flex flex-column gap-4">
              {jobOpenings.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm p-4 rounded-4 bg-white product-card-hover" style={{ transition: "var(--transition)" }}>
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">{job.title}</h5>
                      <span className="text-primary small fw-semibold">{job.department}</span>
                    </div>
                    <Badge bg="light" text="dark" className="border px-2.5 py-1.5 rounded-pill smaller">
                      {job.type}
                    </Badge>
                  </div>
                  <p className="text-muted small mb-3">{job.description}</p>
                  
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
                    <div className="d-flex gap-3 text-muted smaller">
                      <span><FaMapMarkerAlt className="me-1 text-primary" /> {job.location}</span>
                      <span><FaClock className="me-1 text-primary" /> {job.type}</span>
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleApplyClick(job.title)}
                      style={{ borderRadius: "8px", fontSize: "0.75rem", fontWeight: "600" }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* 📝 APPLICATION FORM */}
          <Col lg={5} id="application-form-section">
            <Card className="border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white sticky-top" style={{ top: "100px", zIndex: 1 }}>
              <h3 className="fw-bold text-dark mb-4 fs-4">Submit Application</h3>
              
              {successMsg && <Alert variant="success" className="py-2.5 small mb-4">{successMsg}</Alert>}
              {errorMsg && <Alert variant="danger" className="py-2.5 small mb-4">{errorMsg}</Alert>}

              <Form onSubmit={handleApplySubmit}>
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

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    required 
                    placeholder="Your Phone Number" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Select Position</Form.Label>
                  <Form.Select 
                    required 
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="py-2"
                  >
                    <option value="">-- Choose Position --</option>
                    {jobOpenings.map(job => (
                      <option key={job.id} value={job.title}>{job.title}</option>
                    ))}
                    <option value="General Application">General / Other Positions</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Resume Link (Google Drive/Dropbox)</Form.Label>
                  <Form.Control 
                    type="url" 
                    required 
                    placeholder="https://drive.google.com/file/..." 
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted text-uppercase">Brief Cover Letter / Message</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Tell us why you are a great fit for Fabricare..." 
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
                  <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Careers;

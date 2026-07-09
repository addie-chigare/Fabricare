import React, { useState, useEffect } from 'react';
import { getCustomerSupport } from '../../services/api';
import './Laundry.css';

const LaundrySupport = () => {
  const [supportInfo, setSupportInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    try {
      const response = await getCustomerSupport();
      setSupportInfo(response.data);
    } catch (error) {
      console.error('Error fetching support info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    alert('Your message has been sent! We\'ll get back to you soon.');
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading support information...</div>;
  }

  return (
    <div className="laundry-container">
      <div className="laundry-header">
        <h1>Customer Support</h1>
        <p>We're here to help with your laundry needs</p>
      </div>

      <div className="support-sections">
        <div className="support-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h4>Phone Support</h4>
                <p>{supportInfo.phone || '+91 98765 43210'}</p>
                <small>Monday to Saturday, 9 AM to 8 PM</small>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div>
                <h4>Email Support</h4>
                <p>{supportInfo.email || 'support@fabricare.com'}</p>
                <small>Response within 24 hours</small>
              </div>
            </div>
            
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h4>Office Address</h4>
                <p>{supportInfo.address || '123 Fashion Street, Mumbai, Maharashtra 400001'}</p>
                <small>Visit us during office hours</small>
              </div>
            </div>
          </div>
        </div>

        <div className="support-section">
          <h2>FAQs</h2>
          <div className="faq-list">
            {supportInfo.faqs?.map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            )) || (
              <>
                <div className="faq-item">
                  <h4>What are your pickup timings?</h4>
                  <p>We offer pickup slots from 9 AM to 7 PM, Monday to Saturday.</p>
                </div>
                <div className="faq-item">
                  <h4>How long does laundry take?</h4>
                  <p>Standard service takes 24-48 hours. Express service is available for 12-hour delivery.</p>
                </div>
                <div className="faq-item">
                  <h4>What payment methods do you accept?</h4>
                  <p>We accept cash on delivery, credit/debit cards, UPI, and net banking.</p>
                </div>
                <div className="faq-item">
                  <h4>Can I cancel my order?</h4>
                  <p>Yes, you can cancel orders within 1 hour of booking or before pickup.</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="support-section">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                rows="4"
                required
                placeholder="How can we help you?"
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LaundrySupport;
import React, { useState, useEffect } from 'react';
import { getLaundryServices, getLaundryPricing } from '../../services/api';
import { Link } from 'react-router-dom';
import './Laundry.css';

const LaundryServices = () => {
  const [services, setServices] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, pricingRes] = await Promise.all([
        getLaundryServices(),
        getLaundryPricing()
      ]);
      setServices(servicesRes.data);
      setPricing(pricingRes.data);
    } catch (error) {
      console.error('Error fetching laundry data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading laundry services...</div>;
  }

  return (
    <div className="laundry-container">
      <div className="laundry-header">
        <h1>Laundry Services</h1>
        <p>Professional laundry services at your doorstep</p>
      </div>

      <div className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon || '🧺'}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {service.features?.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-section">
        <h2>Pricing</h2>
        <div className="pricing-table">
          <table>
            <thead>
              <tr>
                <th>Service Type</th>
                <th>Item</th>
                <th>Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((item) => (
                <tr key={item.id}>
                  <td>{item.service_type}</td>
                  <td>{item.item_name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.delivery_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Book?</h2>
        <p>Schedule a pickup at your convenience</p>
        <Link to="/laundry/book" className="book-btn">
          Book Pickup Now
        </Link>
      </div>
    </div>
  );
};

export default LaundryServices;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLaundryServices, bookLaundryPickup } from '../../services/api';
import './Laundry.css';

const BookLaundry = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup_date: '',
    pickup_time: '',
    address: '',
    contact_number: '',
    special_instructions: '',
    services: []
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await getLaundryServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const newServices = prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services: newServices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await bookLaundryPickup(formData);
      alert('Pickup booked successfully!');
      navigate('/laundry/orders');
    } catch (error) {
      console.error('Error booking pickup:', error);
      alert('Failed to book pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="laundry-container">
      <div className="laundry-header">
        <h1>Book Laundry Pickup</h1>
        <p>Schedule a pickup at your convenience</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Pickup Details</h3>
          
          <div className="form-group">
            <label>Pickup Date *</label>
            <input
              type="date"
              name="pickup_date"
              value={formData.pickup_date}
              onChange={handleInputChange}
              min={today}
              required
            />
          </div>

          <div className="form-group">
            <label>Pickup Time *</label>
            <select
              name="pickup_time"
              value={formData.pickup_time}
              onChange={handleInputChange}
              required
            >
              <option value="">Select time</option>
              <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
              <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</option>
              <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
              <option value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              required
              placeholder="Enter your complete address"
            />
          </div>

          <div className="form-group">
            <label>Contact Number *</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Select Services</h3>
          <div className="services-checkbox">
            {services.map(service => (
              <div key={service.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`service-${service.id}`}
                  checked={formData.services.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                />
                <label htmlFor={`service-${service.id}`}>
                  <span className="service-name">{service.name}</span>
                  <span className="service-desc">{service.description}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Special Instructions</h3>
          <div className="form-group">
            <textarea
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special instructions for our team..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/laundry/services')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || formData.services.length === 0}
          >
            {loading ? 'Booking...' : 'Book Pickup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookLaundry;
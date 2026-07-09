import React, { useState, useEffect } from 'react';
import { getLaundryOrders } from '../../services/api';
import './Laundry.css';

const LaundryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getLaundryOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'picked_up': return 'status-pickedup';
      case 'washing': return 'status-washing';
      case 'ironing': return 'status-ironing';
      case 'ready_for_delivery': return 'status-ready';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  return (
    <div className="laundry-container">
      <div className="laundry-header">
        <h1>My Laundry Orders</h1>
        <p>Track your laundry orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You don't have any laundry orders yet.</p>
          <button 
            className="book-btn"
            onClick={() => window.location.href = '/laundry/services'}
          >
            Book Your First Order
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <h3>Order #{order.order_number}</h3>
                  <span className="order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Pickup Date:</span>
                  <span className="detail-value">{formatDate(order.pickup_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Pickup Time:</span>
                  <span className="detail-value">{order.pickup_time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{order.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Services:</span>
                  <span className="detail-value">
                    {order.services?.map(s => s.name).join(', ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₹{order.total_amount}</span>
                </div>
              </div>

              <div className="order-timeline">
                <h4>Order Timeline</h4>
                <div className="timeline">
                  {order.timeline?.map((event, index) => (
                    <div key={index} className="timeline-event">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-date">{formatDate(event.date)}</span>
                        <span className="timeline-description">{event.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-actions">
                <button className="action-btn view-details">
                  View Details
                </button>
                {order.status === 'pending' && (
                  <button className="action-btn cancel-order">
                    Cancel Order
                  </button>
                )}
                {order.status === 'ready_for_delivery' && (
                  <button className="action-btn track-delivery">
                    Track Delivery
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaundryOrders;
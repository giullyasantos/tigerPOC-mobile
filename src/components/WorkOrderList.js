import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { offlineService } from '../services/offlineService';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';

function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('assigned');
  const { user } = useAuth();
  const { isOnline } = useOffline();

  useEffect(() => {
    loadWorkOrders();
  }, [user, isOnline]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      let orders = [];

      if (isOnline) {
        try {
          const response = await apiService.getWorkOrders({
            assignedTo: user?.id,
            status: filter === 'all' ? undefined : filter
          });
          orders = response.data.workOrders || response.data;
          await offlineService.saveWorkOrders(orders);
        } catch (apiError) {
          console.error('API error, falling back to offline data:', apiError);
          orders = await offlineService.getWorkOrders();
        }
      } else {
        orders = await offlineService.getWorkOrders();
      }

      if (filter !== 'all') {
        orders = orders.filter(order =>
          order.status === filter ||
          (filter === 'assigned' && (order.status === 'assigned' || order.status === 'in-progress'))
        );
      }

      setWorkOrders(orders);
      setError('');
    } catch (err) {
      console.error('Error loading work orders:', err);
      setError('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'assigned': 'status-assigned',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-assigned'}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '18px' }}>Loading work orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          overflow: 'auto',
          padding: '2px'
        }}>
          {['assigned', 'completed', 'all'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`btn ${filter === filterOption ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                minWidth: 'auto',
                padding: '8px 16px',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {filterOption === 'assigned' ? 'Active' : filterOption}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--error-color)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {workOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--gray-500)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No work orders found</h3>
          <p>No {filter === 'assigned' ? 'active' : filter} work orders available.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {workOrders.map((order) => (
            <Link
              key={order.id}
              to={`/workorders/${order.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      WO #{order.workOrderNumber || order.id}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: 'var(--gray-600)',
                      fontSize: '14px'
                    }}>
                      {order.customer?.name || order.customerName || 'Customer'}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--gray-700)'
                  }}>
                    Service Details:
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: 'var(--gray-600)',
                    lineHeight: '1.4'
                  }}>
                    {order.description || order.serviceDetails || 'No description available'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'var(--gray-500)'
                }}>
                  <span>
                    📍 {order.address || order.location || 'Location TBD'}
                  </span>
                  <span>
                    📅 {order.scheduledDate ? formatDate(order.scheduledDate) : 'TBD'}
                  </span>
                </div>

                {order.priority === 'high' && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '4px 8px',
                    background: 'var(--error-color)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    🔥 HIGH PRIORITY
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkOrderList;
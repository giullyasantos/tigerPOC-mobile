import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { offlineService } from '../services/offlineService';
import { syncService } from '../services/syncService';
import { useOffline } from '../contexts/OfflineContext';
import TaskCompletionForm from './TaskCompletionForm';

function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const { isOnline } = useOffline();

  useEffect(() => {
    loadWorkOrder();
  }, [id, isOnline]);

  const loadWorkOrder = async () => {
    try {
      setLoading(true);
      let order = null;

      if (isOnline) {
        try {
          const response = await apiService.getWorkOrder(id);
          order = response.data;
          await offlineService.saveWorkOrder(order);
        } catch (apiError) {
          console.error('API error, falling back to offline data:', apiError);
          order = await offlineService.getWorkOrder(id);
        }
      } else {
        order = await offlineService.getWorkOrder(id);
      }

      if (!order) {
        setError('Work order not found');
        return;
      }

      setWorkOrder(order);
      setError('');
    } catch (err) {
      console.error('Error loading work order:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      const updatedOrder = {
        ...workOrder,
        status: 'in-progress',
        startedAt: new Date().toISOString()
      };

      if (isOnline) {
        await apiService.updateWorkOrder(id, { status: 'in-progress' });
      } else {
        await syncService.queueForSync('status_update', id, { status: 'in-progress' });
      }

      await offlineService.saveWorkOrder(updatedOrder);
      setWorkOrder(updatedOrder);
    } catch (err) {
      console.error('Error starting work:', err);
      alert('Failed to update work order status');
    }
  };

  const handleCompleteWork = () => {
    setShowCompletionForm(true);
  };

  const handleCompletionSubmit = async (completionData) => {
    try {
      const updatedOrder = {
        ...workOrder,
        status: 'completed',
        completedAt: new Date().toISOString(),
        completionNotes: completionData.notes,
        beforePhotos: completionData.beforePhotos,
        afterPhotos: completionData.afterPhotos
      };

      if (isOnline) {
        await apiService.submitTaskCompletion(id, completionData);
      } else {
        await syncService.queueForSync('task_completion', id, completionData);
      }

      await offlineService.saveWorkOrder(updatedOrder);
      setWorkOrder(updatedOrder);
      setShowCompletionForm(false);

      alert('Work order completed successfully!');
      navigate('/workorders');
    } catch (err) {
      console.error('Error completing work order:', err);
      alert('Failed to complete work order. It will be synced when online.');
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
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div style={{ fontSize: '18px' }}>Loading work order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          background: 'var(--error-color)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button onClick={() => navigate('/workorders')} className="btn btn-secondary">
          Back to Work Orders
        </button>
      </div>
    );
  }

  if (showCompletionForm) {
    return (
      <TaskCompletionForm
        workOrder={workOrder}
        onSubmit={handleCompletionSubmit}
        onCancel={() => setShowCompletionForm(false)}
      />
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/workorders')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0',
            marginBottom: '1rem'
          }}
        >
          ← Back to Work Orders
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              WO #{workOrder.workOrderNumber || workOrder.id}
            </h1>
            <p style={{
              margin: 0,
              color: 'var(--gray-600)',
              fontSize: '16px'
            }}>
              {workOrder.customer?.name || workOrder.customerName || 'Customer'}
            </p>
          </div>
          {getStatusBadge(workOrder.status)}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Service Information</h3>
        <p style={{
          margin: '0 0 1rem 0',
          lineHeight: '1.5',
          color: 'var(--gray-700)'
        }}>
          {workOrder.description || workOrder.serviceDetails || 'No description available'}
        </p>

        <div style={{
          display: 'grid',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div>
            <strong style={{ color: 'var(--gray-700)' }}>Location:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-600)' }}>
              {workOrder.address || workOrder.location || 'Location TBD'}
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--gray-700)' }}>Scheduled Date:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-600)' }}>
              {formatDate(workOrder.scheduledDate)}
            </p>
          </div>

          {workOrder.customerPhone && (
            <div>
              <strong style={{ color: 'var(--gray-700)' }}>Customer Phone:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-600)' }}>
                <a href={`tel:${workOrder.customerPhone}`} style={{ color: 'var(--primary-color)' }}>
                  {workOrder.customerPhone}
                </a>
              </p>
            </div>
          )}

          {workOrder.priority === 'high' && (
            <div style={{
              padding: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: 'var(--error-color)'
            }}>
              <strong>🔥 HIGH PRIORITY</strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px' }}>
                This work order requires immediate attention.
              </p>
            </div>
          )}
        </div>
      </div>

      {workOrder.notes && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Notes</h3>
          <p style={{
            margin: 0,
            lineHeight: '1.5',
            color: 'var(--gray-700)',
            whiteSpace: 'pre-wrap'
          }}>
            {workOrder.notes}
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Work Progress</h3>

        {workOrder.startedAt && (
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--gray-700)' }}>Started:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-600)' }}>
              {formatDate(workOrder.startedAt)}
            </p>
          </div>
        )}

        {workOrder.completedAt && (
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--gray-700)' }}>Completed:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-600)' }}>
              {formatDate(workOrder.completedAt)}
            </p>
          </div>
        )}

        {workOrder.status === 'assigned' && (
          <button
            onClick={handleStartWork}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Start Work
          </button>
        )}

        {workOrder.status === 'in-progress' && (
          <button
            onClick={handleCompleteWork}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            Complete Work
          </button>
        )}

        {workOrder.status === 'completed' && (
          <div style={{
            padding: '1rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: 'var(--success-color)',
            textAlign: 'center'
          }}>
            <strong>✅ Work Completed</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkOrderDetails;
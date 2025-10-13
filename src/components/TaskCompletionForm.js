import React, { useState } from 'react';
import PhotoUpload from './PhotoUpload';

function TaskCompletionForm({ workOrder, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    status: 'completed',
    notes: '',
    beforePhotos: [],
    afterPhotos: []
  });
  const [submitting, setSubmitting] = useState(false);

  const handleNotesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const handlePhotosUpdate = (type, photos) => {
    setFormData(prev => ({
      ...prev,
      [type]: photos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.notes.trim()) {
      alert('Please add completion notes before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting completion form:', error);
      alert('Failed to submit completion form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={onCancel}
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
          ← Back to Details
        </button>

        <h1 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Complete Work Order
        </h1>
        <p style={{
          margin: 0,
          color: 'var(--gray-600)',
          fontSize: '16px'
        }}>
          WO #{workOrder.workOrderNumber || workOrder.id}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Completion Status</h3>

          <div className="form-group">
            <label className="form-label">
              Status
            </label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="completed">Completed Successfully</option>
              <option value="completed-with-issues">Completed with Issues</option>
              <option value="requires-follow-up">Requires Follow-up</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">
              Completion Notes *
            </label>
            <textarea
              id="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Describe the work completed, any issues encountered, materials used, etc."
              required
            />
            <small style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Provide detailed notes about the work performed and any relevant observations.
            </small>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Before Photos</h3>
          <p style={{
            margin: '0 0 1rem 0',
            fontSize: '14px',
            color: 'var(--gray-600)'
          }}>
            Take photos showing the condition before starting work.
          </p>
          <PhotoUpload
            photos={formData.beforePhotos}
            onPhotosUpdate={(photos) => handlePhotosUpdate('beforePhotos', photos)}
            maxPhotos={5}
          />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>After Photos</h3>
          <p style={{
            margin: '0 0 1rem 0',
            fontSize: '14px',
            color: 'var(--gray-600)'
          }}>
            Take photos showing the completed work and final results.
          </p>
          <PhotoUpload
            photos={formData.afterPhotos}
            onPhotosUpdate={(photos) => handlePhotosUpdate('afterPhotos', photos)}
            maxPhotos={5}
          />
        </div>

        <div style={{
          position: 'sticky',
          bottom: '1rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--gray-200)',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              style={{ flex: 2 }}
              disabled={submitting || !formData.notes.trim()}
            >
              {submitting ? 'Submitting...' : 'Complete Work Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TaskCompletionForm;
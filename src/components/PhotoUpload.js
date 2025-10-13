import React, { useRef } from 'react';
import { compressAndProcessPhoto } from '../utils/photoUtils';

function PhotoUpload({ photos, onPhotosUpdate, maxPhotos = 5 }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    try {
      const processedPhotos = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressAndProcessPhoto(file);
          return {
            id: Date.now() + Math.random(),
            file: compressed.file,
            preview: compressed.preview,
            timestamp: new Date().toISOString(),
            size: compressed.file.size
          };
        })
      );

      onPhotosUpdate([...photos, ...processedPhotos]);
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Failed to process some photos. Please try again.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePhoto = (photoId) => {
    onPhotosUpdate(photos.filter(photo => photo.id !== photoId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {photos.length < maxPhotos && (
        <div
          className="photo-upload"
          onClick={handleCameraCapture}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '1rem',
            color: 'var(--gray-400)'
          }}>
            📷
          </div>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '16px',
            fontWeight: '500',
            color: 'var(--gray-700)'
          }}>
            Take Photo
          </p>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--gray-500)'
          }}>
            Tap to open camera or select from gallery
          </p>
          {maxPhotos > 1 && (
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '12px',
              color: 'var(--gray-400)'
            }}>
              {photos.length}/{maxPhotos} photos
            </p>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                background: 'var(--gray-100)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <img
                src={photo.preview}
                alt="Uploaded"
                className="photo-preview"
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover'
                }}
              />
              <button
                onClick={() => removePhoto(photo.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              <div style={{
                padding: '0.5rem',
                fontSize: '12px',
                color: 'var(--gray-600)',
                background: 'white'
              }}>
                <div style={{ marginBottom: '2px' }}>
                  {formatFileSize(photo.size)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--gray-500)' }}>
                  {new Date(photo.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {photos.length < maxPhotos && (
            <div
              onClick={handleCameraCapture}
              style={{
                border: '2px dashed var(--gray-300)',
                borderRadius: '8px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'var(--gray-50)',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.backgroundColor = 'var(--gray-100)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--gray-300)';
                e.target.style.backgroundColor = 'var(--gray-50)';
              }}
            >
              <div style={{
                fontSize: '24px',
                color: 'var(--gray-400)',
                marginBottom: '4px'
              }}>
                +
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--gray-500)',
                textAlign: 'center'
              }}>
                Add Photo
              </div>
            </div>
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'var(--gray-50)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--gray-600)'
        }}>
          <strong>{photos.length}</strong> photo{photos.length !== 1 ? 's' : ''} selected
          {photos.length > 0 && (
            <span style={{ marginLeft: '1rem' }}>
              Total size: {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
import React from 'react';
import { useOffline } from '../contexts/OfflineContext';

function OfflineIndicator() {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      📱 You're working offline. Changes will sync when connection is restored.
    </div>
  );
}

export default OfflineIndicator;
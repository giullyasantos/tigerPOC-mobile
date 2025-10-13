import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="header">
      <div>
        <h2 style={{ margin: 0, fontSize: '18px' }}>
          {user?.username || 'Worker'}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Work Orders
        </p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default Header;
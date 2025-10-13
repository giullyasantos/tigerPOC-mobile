import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { syncService } from './services/syncService';
import Login from './components/Login';
import WorkOrderList from './components/WorkOrderList';
import WorkOrderDetails from './components/WorkOrderDetails';
import Header from './components/Header';
import OfflineIndicator from './components/OfflineIndicator';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_TRIGGERED') {
          syncService.syncWhenOnline();
        }
      });
    }
  }, []);

  return (
    <AuthProvider>
      <OfflineProvider>
        <Router>
          <div className="container">
            <OfflineIndicator />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/workorders"
                element={
                  <ProtectedRoute>
                    <Header />
                    <WorkOrderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workorders/:id"
                element={
                  <ProtectedRoute>
                    <Header />
                    <WorkOrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/workorders" replace />} />
            </Routes>
          </div>
        </Router>
      </OfflineProvider>
    </AuthProvider>
  );
}

export default App;
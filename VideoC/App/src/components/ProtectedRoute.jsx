import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Usage:
// <ProtectedRoute>               -> requires auth only
// <ProtectedRoute requiredRole="admin" fallbackTo="/home"> -> requires admin role
const ProtectedRoute = ({ children, requiredRole, fallbackTo = '/home' }) => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  if (!authToken) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, message: 'You must login to access this page.' }}
      />
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    // Logged in but not allowed for this role
    return (
      <Navigate
        to={fallbackTo}
        replace
        state={{ from: location, message: 'You do not have permission to access this page.' }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;

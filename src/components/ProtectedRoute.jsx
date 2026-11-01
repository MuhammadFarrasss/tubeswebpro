import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const roleRedirectMap = {
  Admin: '/admin/login',
  Driver: '/driver/login',
  Mekanik: '/mekanik/login',
};

export default function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{ background: 'var(--color-bg)' }}
      >
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={roleRedirectMap[allowedRole] || '/'} replace />;
  }

  if (user.role !== allowedRole) {
    const dashboardMap = {
      Admin: '/admin/dashboard',
      Driver: '/driver/dashboard',
      Mekanik: '/mekanik/dashboard',
    };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return <Outlet />;
}

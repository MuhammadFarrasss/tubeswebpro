import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Box, Drawer, IconButton, Typography, Tooltip, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import AppSidebar from './AppSidebar';

const DRAWER_WIDTH = 256;

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || 'Admin';

  const handleLogout = () => {
    logout();
    toast.info('Logout berhasil');
    navigate(`/${role.toLowerCase()}/login`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: 'rgba(13,17,23,0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            zIndex: (t) => t.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Buka menu navigasi"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: '#F1F5F9' }}>
              Sagara Daily Checkup
            </Typography>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} aria-label="Logout">
                <LogoutIcon sx={{ color: '#EF4444' }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        aria-label="Sidebar navigation"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
          >
            <AppSidebar
              user={user}
              role={role}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', position: 'relative' } }}
          >
            <AppSidebar user={user} role={role} onLogout={handleLogout} />
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          pt: isMobile ? '64px' : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// [Commit 8/15] Konstanta lebar sidebar navigasi desktop (pixel)
export const SIDEBAR_WIDTH_DESKTOP = 256;

// [Commit 9/15] Helper pengecekan rute aktif untuk styling highlight menu navigasi
export const isRouteActive = (currentPath, targetPath) => currentPath === targetPath;

// [Commit 10/15] Pesan toast konfirmasi saat pengguna berhasil logout dari aplikasi
export const LOGOUT_TOAST_MESSAGE = 'Anda telah berhasil logout';

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Box, Drawer, List, ListItem, ListItemIcon,
  ListItemText, ListItemButton, IconButton, Typography, Avatar,
  Divider, Tooltip, useMediaQuery, useTheme, Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import KeyIcon from '@mui/icons-material/Key';
import BuildIcon from '@mui/icons-material/Build';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import ReportIcon from '@mui/icons-material/Report';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { toast } from 'react-toastify';

const DRAWER_WIDTH = 256;

const navConfig = {
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Kendaraan', path: '/admin/kendaraan', icon: <DirectionsCarIcon /> },
    { label: 'Generate Key', path: '/admin/generate-key', icon: <KeyIcon /> },
    { label: 'Pengajuan Perbaikan', path: '/admin/pengajuan-perbaikan', icon: <BuildIcon /> },
    { label: 'Laporan Biaya', path: '/admin/laporan-biaya', icon: <ReceiptIcon /> },
  ],
  Driver: [
    { label: 'Dashboard', path: '/driver/dashboard', icon: <DashboardIcon /> },
    { label: 'Laporan Kerusakan', path: '/driver/report', icon: <ReportIcon /> },
    { label: 'Struk Bensin', path: '/driver/struk-bensin', icon: <LocalGasStationIcon /> },
    { label: 'Request Towing', path: '/driver/towing', icon: <TireRepairIcon /> },
  ],
  Mekanik: [
    { label: 'Dashboard', path: '/mekanik/dashboard', icon: <DashboardIcon /> },
  ],
};

const roleColors = {
  Admin: { bg: 'rgba(170,43,29,0.15)', text: '#FF6B6B', border: 'rgba(170,43,29,0.4)' },
  Driver: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA', border: 'rgba(59,130,246,0.4)' },
  Mekanik: { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', border: 'rgba(245,158,11,0.4)' },
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || 'Admin';
  const nav = navConfig[role] || [];
  const colors = roleColors[role] || roleColors.Admin;

  const handleLogout = () => {
    logout();
    toast.info('Logout berhasil');
    navigate(`/${role.toLowerCase()}/login`);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0D1117 0%, #080B14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #AA2B1D, #E84545)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <DirectionsCarIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9', lineHeight: 1.2 }}>
            Sagara
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', letterSpacing: '0.05em' }}>
            Daily Checkup
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* User info */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${colors.text}, #fff)`,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#0D1117',
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box overflow="hidden">
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ color: 'var(--color-text-primary)' }}
            >
              {user?.username || 'User'}
            </Typography>
            <Box
              component="span"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                px: 1,
                py: 0.25,
                borderRadius: '99px',
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                letterSpacing: '0.05em',
              }}
            >
              {role}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List component="nav" aria-label="Main navigation" sx={{ px: 1.5, flex: 1 }}>
        {nav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 1.5,
                  background: isActive ? 'rgba(170,43,29,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(170,43,29,0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#FF6B6B' : '#64748B',
                    transition: 'color 0.2s',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F1F5F9' : '#94A3B8',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: '2px',
                      background: 'linear-gradient(180deg, #AA2B1D, #E84545)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            py: 1.2,
            px: 1.5,
            color: '#EF4444',
            '&:hover': { background: 'rgba(239,68,68,0.08)' },
          }}
          aria-label="Logout dari aplikasi"
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#EF4444' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: '#EF4444' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

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
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', position: 'relative' } }}
          >
            {drawerContent}
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

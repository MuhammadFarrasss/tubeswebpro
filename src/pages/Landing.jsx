import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Grid, Card, CardActionArea } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';

const ROLES = [
  {
    key: 'Admin',
    label: 'Admin',
    desc: 'System Management',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 36 }} />,
    path: '/admin/login',
    gradient: 'linear-gradient(135deg, #AA2B1D 0%, #E84545 100%)',
    shadow: 'rgba(170,43,29,0.3)',
  },
  {
    key: 'Mekanik',
    label: 'Mekanik',
    desc: 'Repair & Maintenance',
    icon: <BuildIcon sx={{ fontSize: 36 }} />,
    path: '/mekanik/login',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    shadow: 'rgba(245,158,11,0.3)',
  },
  {
    key: 'Driver',
    label: 'Driver',
    desc: 'Vehicle Operations',
    icon: <DirectionsCarIcon sx={{ fontSize: 36 }} />,
    path: '/driver/login',
    gradient: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    shadow: 'rgba(59,130,246,0.3)',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const map = { Admin: '/admin/dashboard', Driver: '/driver/dashboard', Mekanik: '/mekanik/dashboard' };
      if (map[user.role]) navigate(map[user.role], { replace: true });
    }
  }, [user, navigate]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, rgba(170,43,29,0.12) 0%, transparent 60%), var(--color-bg)',
        px: { xs: 2, sm: 4 },
        py: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(170,43,29,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Box textAlign="center" mb={6} className="animate-fadeInUp">
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3,
            px: 2,
            py: 1,
            borderRadius: '99px',
            background: 'rgba(170,43,29,0.1)',
            border: '1px solid rgba(170,43,29,0.2)',
          }}
        >
          <DirectionsCarIcon sx={{ color: '#E84545', fontSize: 18 }} aria-hidden="true" />
          <Typography
            component="span"
            sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#E84545', textTransform: 'uppercase' }}
          >
            Sagara Daily Checkup
          </Typography>
        </Box>

        <Typography
          component="h1"
          variant="h2"
          fontWeight={900}
          className="glow-text"
          sx={{
            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem' },
            lineHeight: 1.1,
            mb: 2,
          }}
        >
          Kelompok Sagara
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'var(--color-text-secondary)', fontWeight: 400, maxWidth: 480, mx: 'auto' }}
        >
          Sistem manajemen kendaraan harian — pilih role untuk masuk
        </Typography>
      </Box>

      {/* Role cards */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        sx={{ maxWidth: 860, width: '100%' }}
        component="section"
        aria-label="Pilih role login"
      >
        {ROLES.map((role, idx) => (
          <Grid item xs={12} sm={6} md={4} key={role.key}>
            <Card
              className="card-hover animate-fadeInUp"
              sx={{
                background: 'rgba(13,17,23,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(20px)',
                animationDelay: `${idx * 0.1}s`,
                overflow: 'hidden',
              }}
            >
              <CardActionArea
                onClick={() => navigate(role.path)}
                aria-label={`Login sebagai ${role.label}`}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  '&:hover .role-icon-box': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 16px 40px ${role.shadow}`,
                  },
                  '&:hover .role-divider': { width: 64 },
                }}
              >
                <Box
                  className="role-icon-box"
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    background: role.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: `0 8px 24px ${role.shadow}`,
                  }}
                  aria-hidden="true"
                >
                  {role.icon}
                </Box>

                <Box textAlign="center">
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 0.5 }}>
                    {role.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {role.desc}
                  </Typography>
                </Box>

                <Box
                  className="role-divider"
                  sx={{
                    width: 32,
                    height: 2,
                    borderRadius: '99px',
                    background: role.gradient,
                    transition: 'width 0.3s ease',
                  }}
                  aria-hidden="true"
                />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Box mt={8} textAlign="center" component="footer">
        <Typography variant="caption" sx={{ color: '#334155' }}>
          © 2025 Sagara Daily Checkup · Kelompok Sagara · Tugas Besar Web Programming
        </Typography>
      </Box>
    </Box>
  );
}

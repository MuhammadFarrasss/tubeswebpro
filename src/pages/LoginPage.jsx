import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, Alert, CircularProgress, Card,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BuildIcon from '@mui/icons-material/Build';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';

const roleConfig = {
  Admin: {
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #AA2B1D, #E84545)',
    shadow: 'rgba(170,43,29,0.4)',
    dashboardPath: '/admin/dashboard',
    hint: 'Demo: username = admin_sagara, key = ADM12345',
  },
  Driver: {
    icon: <DirectionsCarIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
    shadow: 'rgba(59,130,246,0.4)',
    dashboardPath: '/driver/dashboard',
    hint: 'Demo: username = budi_driver, key = DRV98765',
  },
  Mekanik: {
    icon: <BuildIcon sx={{ fontSize: 28 }} />,
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    shadow: 'rgba(245,158,11,0.4)',
    dashboardPath: '/mekanik/dashboard',
    hint: 'Demo: username = rizki_mekanik, key = MEK22222',
  },
};

// Client-side form validation
function validate(username, key) {
  const errors = {};
  if (!username.trim()) {
    errors.username = 'Username tidak boleh kosong';
  } else if (username.length < 3) {
    errors.username = 'Username minimal 3 karakter';
  }
  if (!key.trim()) {
    errors.key = 'Key tidak boleh kosong';
  } else if (key.length !== 8) {
    errors.key = 'Key harus tepat 8 karakter';
  }
  return errors;
}

export default function LoginPage({ role }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const config = roleConfig[role];

  const [username, setUsername] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const map = { Admin: '/admin/dashboard', Driver: '/driver/dashboard', Mekanik: '/mekanik/dashboard' };
      navigate(map[user.role] || '/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Client-side validation
    const validationErrors = validate(username, key);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await login(role, username, key.toUpperCase());
      toast.success(`Selamat datang, ${username}!`);
      navigate(config.dashboardPath, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(ellipse at 30% 20%, ${config.shadow.replace('0.4', '0.08')} 0%, transparent 60%), var(--color-bg)`,
        px: { xs: 2, sm: 4 },
        py: 4,
      }}
    >
      {/* Back button */}
      <Box sx={{ position: 'absolute', top: { xs: 16, md: 32 }, left: { xs: 16, md: 32 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ color: 'var(--color-text-secondary)', '&:hover': { color: '#fff' } }}
          aria-label="Kembali ke halaman utama"
        >
          Kembali
        </Button>
      </Box>

      <Card
        className="animate-fadeInUp"
        sx={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(13,17,23,0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-xl)',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top gradient accent */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: config.gradient,
          }}
        />

        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: config.gradient,
              boxShadow: `0 12px 32px ${config.shadow}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              mx: 'auto',
              mb: 2.5,
            }}
            aria-hidden="true"
          >
            {config.icon}
          </Box>
          <Typography component="h1" variant="h5" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
            Login {role}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Sagara Daily Checkup
          </Typography>
        </Box>

        {/* Demo hint */}
        <Alert
          severity="info"
          sx={{
            mb: 3,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: '#93C5FD',
            fontSize: '0.78rem',
            borderRadius: 'var(--radius-md)',
            '& .MuiAlert-icon': { color: '#60A5FA' },
          }}
        >
          {config.hint}
        </Alert>

        {/* API Error */}
        {apiError && (
          <Alert
            severity="error"
            onClose={() => setApiError('')}
            sx={{
              mb: 3,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#FCA5A5',
              borderRadius: 'var(--radius-md)',
            }}
            role="alert"
          >
            {apiError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate aria-label={`Form login ${role}`}>
          <Box mb={2.5}>
            <TextField
              fullWidth
              id="username"
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: '' })); }}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
              autoComplete="username"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#475569', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ 'aria-required': true, 'aria-describedby': errors.username ? 'username-error' : undefined }}
              FormHelperTextProps={{ id: 'username-error', role: 'alert' }}
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              id="key"
              label="Key (8 karakter)"
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => { setKey(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, key: '' })); }}
              error={!!errors.key}
              helperText={errors.key}
              disabled={loading}
              inputProps={{
                maxLength: 8,
                style: { fontFamily: 'monospace', letterSpacing: '0.15em' },
                'aria-required': true,
                'aria-describedby': errors.key ? 'key-error' : undefined,
              }}
              FormHelperTextProps={{ id: 'key-error', role: 'alert' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon sx={{ color: '#475569', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowKey(!showKey)}
                      edge="end"
                      size="small"
                      aria-label={showKey ? 'Sembunyikan key' : 'Tampilkan key'}
                    >
                      {showKey ? <VisibilityOff sx={{ fontSize: 18, color: '#475569' }} /> : <Visibility sx={{ fontSize: 18, color: '#475569' }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            aria-label={`Masuk sebagai ${role}`}
            sx={{
              py: 1.5,
              background: loading ? 'rgba(170,43,29,0.5)' : config.gradient,
              boxShadow: `0 8px 24px ${config.shadow}`,
              fontSize: '1rem',
              fontWeight: 700,
              '&:hover': {
                background: config.gradient,
                boxShadow: `0 12px 32px ${config.shadow}`,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} aria-label="Memproses login" />
            ) : (
              'Masuk'
            )}
          </Button>
        </Box>

        <Box mt={3} textAlign="center">
          <Typography variant="caption" sx={{ color: '#334155' }}>
            © 2025 Sagara Daily Checkup
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

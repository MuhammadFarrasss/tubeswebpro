import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import LoginCard from './LoginCard';

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

  useEffect(() => {
    if (user) {
      const map = { Admin: '/admin/dashboard', Driver: '/driver/dashboard', Mekanik: '/mekanik/dashboard' };
      navigate(map[user.role] || '/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

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

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setErrors((previous) => ({ ...previous, username: '' }));
  };

  const handleKeyChange = (e) => {
    setKey(e.target.value.toUpperCase());
    setErrors((previous) => ({ ...previous, key: '' }));
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

      <LoginCard
        role={role}
        config={config}
        username={username}
        keyValue={key}
        showKey={showKey}
        errors={errors}
        apiError={apiError}
        loading={loading}
        onUsernameChange={handleUsernameChange}
        onKeyChange={handleKeyChange}
        onToggleKey={() => setShowKey((visible) => !visible)}
        onDismissApiError={() => setApiError('')}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}

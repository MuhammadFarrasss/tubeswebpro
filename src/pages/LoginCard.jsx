import React from 'react';
import {
  Alert, Box, Button, Card, CircularProgress, IconButton, InputAdornment, TextField, Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginCard({
  role,
  config,
  username,
  keyValue,
  showKey,
  errors,
  apiError,
  loading,
  onUsernameChange,
  onKeyChange,
  onToggleKey,
  onDismissApiError,
  onSubmit,
}) {
  return (
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

      {apiError && (
        <Alert
          severity="error"
          onClose={onDismissApiError}
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

      <Box component="form" onSubmit={onSubmit} noValidate aria-label={`Form login ${role}`}>
        <Box mb={2.5}>
          <TextField
            fullWidth
            id="username"
            label="Username"
            value={username}
            onChange={onUsernameChange}
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
            value={keyValue}
            onChange={onKeyChange}
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
                    onClick={onToggleKey}
                    edge="end"
                    size="small"
                    aria-label={showKey ? 'Sembunyikan key' : 'Tampilkan key'}
                  >
                    {showKey
                      ? <VisibilityOff sx={{ fontSize: 18, color: '#475569' }} />
                      : <Visibility sx={{ fontSize: 18, color: '#475569' }} />}
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
          {loading
            ? <CircularProgress size={22} sx={{ color: '#fff' }} aria-label="Memproses login" />
            : 'Masuk'}
        </Button>
      </Box>

      <Box mt={3} textAlign="center">
        <Typography variant="caption" sx={{ color: '#334155' }}>
          © 2025 Sagara Daily Checkup
        </Typography>
      </Box>
    </Card>
  );
}

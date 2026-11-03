import React from 'react';
import { Box, Skeleton } from '@mui/material';

export function LoadingSkeleton({ rows = 5, height = 60 }) {
  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={height}
          sx={{
            borderRadius: 'var(--radius-md)',
            bgcolor: 'rgba(255,255,255,0.05)',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </Box>
  );
}

export function LoadingSpinner() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      flexDirection="column"
      gap={2}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          border: '3px solid rgba(170,43,29,0.2)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </Box>
  );
}

export function ErrorState({ message = 'Terjadi kesalahan. Silakan coba lagi.', onRetry }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
      role="alert"
      aria-live="assertive"
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
        }}
        aria-hidden="true"
      >
        ⚠️
      </Box>
      <Box textAlign="center">
        <Box sx={{ color: 'var(--color-text-primary)', fontWeight: 600, mb: 0.5 }}>
          Gagal Memuat Data
        </Box>
        <Box sx={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {message}
        </Box>
      </Box>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 24px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Coba Lagi
        </button>
      )}
    </Box>
  );
}

export function EmptyState({ message = 'Belum ada data', icon = '📋' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
      role="status"
    >
      <Box sx={{ fontSize: '3rem' }} aria-hidden="true">{icon}</Box>
      <Box sx={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
        {message}
      </Box>
    </Box>
  );
}

// [Commit 5/15] Default styling skeleton loader untuk konsistensi antar halaman
export const SKELETON_BG_COLOR = 'rgba(255,255,255,0.05)';

// [Commit 6/15] Default fallback pesan saat terjadi kendala pemuatan data API
export const DEFAULT_ERROR_FALLBACK_TEXT = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';

// [Commit 7/15] Default icon dan teks representatif untuk kondisi daftar data kosong
export const DEFAULT_EMPTY_STATE_CONFIG = { icon: '📭', message: 'Belum ada data yang tersedia' };

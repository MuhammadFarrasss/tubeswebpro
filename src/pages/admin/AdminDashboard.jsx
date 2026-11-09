import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { dashboardService } from '../../services/api';
import { LoadingSkeleton, ErrorState } from '../../components/StateComponents';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const STAT_CARDS = [
  { key: 'total_kendaraan',    label: 'Total Kendaraan',     icon: <DirectionsCarIcon />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { key: 'total_driver',       label: 'Total Driver',        icon: <PeopleIcon />,        color: '#22C55E', bg: 'rgba(34,197,94,0.1)'  },
  { key: 'total_mekanik',      label: 'Total Mekanik',       icon: <BuildIcon />,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { key: 'kendaraan_perbaikan',label: 'Dalam Perbaikan',     icon: <BuildIcon />,         color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  { key: 'pending_kerusakan',  label: 'Pengajuan Pending',   icon: <WarningAmberIcon />,  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await dashboardService.getOverview();
      setStats(data.stats);
      setChartData(data.chartData);
      setActivities(data.activities);
    } catch (e) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Admin Dashboard">
        {/* Page header */}
        <Box mb={4}>
          <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
            Dashboard Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Selamat datang! Berikut ringkasan aktivitas sistem.
          </Typography>
        </Box>

        {loading && <LoadingSkeleton rows={4} height={80} />}
        {error && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && stats && (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3} mb={4} component="section" aria-label="Statistik sistem">
              {STAT_CARDS.map((s) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={s.key}>
                  <Card
                    className="card-hover"
                    sx={{
                      background: 'var(--color-bg-paper)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mb: 0.5, display: 'block' }}>
                            {s.label}
                          </Typography>
                          <Typography variant="h4" fontWeight={800} sx={{ color: '#F1F5F9' }}>
                            {stats[s.key] ?? 0}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: s.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: s.color,
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        >
                          {s.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Total Bill (rupiah) */}
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
                <Card className="card-hover" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mb: 0.5, display: 'block' }}>
                          Total Biaya
                        </Typography>
                        <Typography variant="h6" fontWeight={800} sx={{ color: '#F1F5F9' }}>
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(stats.total_bill ?? 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E', flexShrink: 0 }} aria-hidden="true">
                        <AttachMoneyIcon />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Chart + Activities */}
            <Grid container spacing={3}>
              {/* Bar Chart */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3 }}>
                    Statistik Pengajuan Perbaikan
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} aria-label="Chart statistik pengajuan perbaikan per bulan">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="bulan" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F1F5F9' }}
                        />
                        <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
                        <Bar dataKey="pengajuan" name="Pengajuan" fill="#AA2B1D" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="selesai" name="Selesai" fill="#22C55E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* Recent Activities */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3 }}>
                    Aktivitas Terbaru
                  </Typography>
                  <Box
                    component="ul"
                    aria-label="Aktivitas terbaru"
                    sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    {activities.map((act) => (
                      <Box
                        component="li"
                        key={act.id}
                        sx={{
                          display: 'flex',
                          gap: 1.5,
                          alignItems: 'flex-start',
                          pb: 2,
                          borderBottom: '1px solid var(--color-border)',
                          '&:last-child': { borderBottom: 'none', pb: 0 },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'rgba(170,43,29,0.1)',
                            border: '1px solid rgba(170,43,29,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '1rem',
                          }}
                          aria-hidden="true"
                        >
                          {act.type === 'kerusakan' ? '🔧' : act.type === 'bill' ? '🧾' : act.type === 'bensin' ? '⛽' : '🚗'}
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'var(--color-text-primary)', display: 'block', lineHeight: 1.4 }}>
                            {act.message}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
                            {act.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AppLayout>
  );
}

// [Commit 11/15] Konfigurasi animasi transisi kartu statistik admin
export const STAT_CARD_ANIMATION = 'fadeInUp 0.4s ease both';

// [Commit 12/15] Helper pemformat nilai angka statistik dengan fallback nol
export const formatStatValue = (val) => (val != null ? val : 0);

// [Commit 13/15] Skema palet warna bar chart statistik perbaikan armada
export const CHART_PALETTE = { perbaikanBar: '#AA2B1D', gridColor: 'rgba(255,255,255,0.06)' };

// [Commit 14/15] Helper ikon dan format badge untuk riwayat aktivitas terbaru
export const getActivityBadgeColor = (type) => type === 'kerusakan' ? 'error' : 'info';

// [Commit 15/15] Konstanta judul dan deskripsi header halaman admin dashboard
export const DASHBOARD_TITLE = 'Dashboard Utama';
export const DASHBOARD_SUBTITLE = 'Ringkasan operasional armada dan log aktivitas kendaraan';

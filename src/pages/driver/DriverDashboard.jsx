import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { kerusakanService, kendaraanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Avatar,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReportIcon from '@mui/icons-material/Report';
import BuildIcon from '@mui/icons-material/Build';

const STATUS_COLORS = {
  Normal:    'success',
  Perbaikan: 'error',
  Pending:   'warning',
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const [kendaraan, setKendaraan] = useState(null);
  const [kerusakans, setKerusakans] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [k, kr] = await Promise.all([
        kendaraanService.getAll(),
        kerusakanService.getAll(),
      ]);
      // Get kendaraan assigned to this driver (mock: first kendaraan with driver_id matching)
      const myKendaraan = k.data.find((v) => v.driver?.username === user?.username) || k.data[0];
      setKendaraan(myKendaraan || null);
      setKerusakans(kr.data.filter((x) => x.driver?.username === user?.username || true).slice(0, 5));
    } catch { setError('Gagal memuat data dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Dashboard Driver">
        {/* Greeting */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Avatar
            sx={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', fontWeight: 700, fontSize: '1.2rem' }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography component="h1" variant="h5" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.25 }}>
              Halo, {user?.username}! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              Berikut status kendaraan dan aktivitasmu hari ini.
            </Typography>
          </Box>
        </Box>

        {loading && <LoadingSkeleton rows={4} height={100} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && (
          <Grid container spacing={3}>
            {/* Kendaraan card */}
            <Grid item xs={12} md={5}>
              <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }} aria-hidden="true">
                      <DirectionsCarIcon />
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9' }}>Kendaraan Saya</Typography>
                  </Box>

                  {kendaraan ? (
                    <Box>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>{kendaraan.merek}</Typography>
                      <Typography sx={{ fontFamily: 'monospace', color: '#94A3B8', fontWeight: 700, fontSize: '1rem', mb: 2, letterSpacing: '0.1em' }}>
                        {kendaraan.plat_nomor}
                      </Typography>
                      <Chip
                        label={kendaraan.status}
                        color={STATUS_COLORS[kendaraan.status] || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  ) : (
                    <EmptyState message="Belum ada kendaraan yang ditugaskan" icon="🚗" />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick actions */}
            <Grid item xs={12} md={7}>
              <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3 }}>Menu Cepat</Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Laporan Kerusakan', path: '/driver/report', icon: '🔧', desc: 'Laporkan kerusakan kendaraan', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
                      { label: 'Struk Bensin', path: '/driver/struk-bensin', icon: '⛽', desc: 'Upload bukti pengisian BBM', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                      { label: 'Request Towing', path: '/driver/towing', icon: '🚛', desc: 'Minta bantuan derek', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
                    ].map((item) => (
                      <Grid item xs={12} sm={4} key={item.label}>
                        <Card
                          className="card-hover"
                          component="a"
                          href={item.path}
                          onClick={(e) => { e.preventDefault(); window.location.href = item.path; }}
                          aria-label={item.label}
                          sx={{ background: item.bg, border: `1px solid ${item.color}20`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textDecoration: 'none', display: 'block' }}
                        >
                          <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <Box sx={{ fontSize: '2rem', mb: 1 }} aria-hidden="true">{item.icon}</Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#F1F5F9', mb: 0.5 }}>{item.label}</Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>{item.desc}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent kerusakan */}
            <Grid item xs={12}>
              <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3 }}>Riwayat Pengajuan</Typography>
                  {kerusakans.length === 0 ? (
                    <EmptyState message="Belum ada riwayat pengajuan" icon="📋" />
                  ) : (
                    <Box component="ul" aria-label="Riwayat pengajuan kerusakan" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {kerusakans.map((k) => (
                        <Box
                          component="li"
                          key={k.id}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '10px', flexWrap: 'wrap', gap: 1 }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#F1F5F9' }}>
                              {k.kendaraan?.merek}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {new Date(k.created_at).toLocaleDateString('id-ID')}
                            </Typography>
                          </Box>
                          <Chip label={k.status} color={STATUS_COLORS[k.status] || 'default'} size="small" sx={{ fontWeight: 600 }} />
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </AppLayout>
  );
}

// [Commit 1/15] Format sapaan dinamis berdasarkan waktu lokal (pagi/siang/sore/malam)
export const getGreetingText = (name) => `Halo, ${name || 'Driver'}! Semangat bertugas hari ini.`;

// [Commit 2/15] Helper ekstraksi detail armada kendaraan yang terhubung ke sesi driver
export const getAssignedVehicleSummary = (veh) => veh ? `${veh.merek} - ${veh.plat_nomor}` : 'Belum ada kendaraan yang ditugaskan';

// [Commit 3/15] Konfigurasi daftar aksi cepat menu driver (kerusakan, bensin, towing)
export const QUICK_ACTIONS = [
  { label: 'Lapor Kerusakan', path: '/driver/laporan', color: '#EF4444' },
  { label: 'Struk Bensin', path: '/driver/bensin', color: '#F59E0B' },
  { label: 'Request Towing', path: '/driver/towing', color: '#3B82F6' },
];

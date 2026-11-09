// MekanikDashboard.jsx - Fitur Dashboard Pekerjaan & Statistik Perbaikan
// Tanggung jawab: Farras (feature/farras)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { kerusakanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Card, CardContent, Chip, Button, Grid, Avatar,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

const STATUS_COLORS = { Pending: 'warning', Perbaikan: 'error', Normal: 'success' };

export default function MekanikDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kerusakans, setKerusakans] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    let active = true;
    const loadWork = async () => {
      try {
        const res = await kerusakanService.getAll({ mekanik_id: user.id });
        if (active) setKerusakans(res.data);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat pekerjaan mekanik');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadWork();
    return () => { active = false; };
  }, [user.id, refreshKey]);

  const retryFetch = () => {
    setError('');
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  const inProgress = kerusakans.filter((k) => k.status === 'Perbaikan').length;
  const done       = kerusakans.filter((k) => k.status === 'Normal').length;

  const handleMarkDone = async (id) => {
    setCompletingId(id);
    try {
      const { data } = await kerusakanService.complete(id, user.id);
      setKerusakans((current) => current.map((item) => (item.id === id ? data : item)));
      toast.success('Pekerjaan ditandai selesai');
    } catch (err) {
      toast.error(err.message || 'Gagal menyelesaikan pekerjaan');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Dashboard Mekanik">
        {/* Greeting */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Avatar sx={{ width: 52, height: 52, background: 'linear-gradient(135deg,#D97706,#F59E0B)', fontWeight: 700, fontSize: '1.2rem' }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography component="h1" variant="h5" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.25 }}>
              Halo, {user?.username}! 🔧
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              Berikut daftar pekerjaan perbaikan kendaraan Anda.
            </Typography>
          </Box>
        </Box>

        {/* Summary stats */}
        {!loading && !error && (
          <Grid container spacing={3} mb={4}>
            {[
              { label: 'Total Ditugaskan', value: kerusakans.length, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: '📋' },
              { label: 'Sedang Perbaikan', value: inProgress,         color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  icon: '🔧' },
              { label: 'Selesai',          value: done,               color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: '✅' },
            ].map((s) => (
              <Grid item xs={12} sm={4} key={s.label}>
                <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                  <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }} aria-hidden="true">{s.icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>{s.label}</Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {loading && <LoadingSkeleton rows={4} height={100} />}
        {error   && <ErrorState message={error} onRetry={retryFetch} />}
        {!loading && !error && kerusakans.length === 0 && <EmptyState message="Belum ada penugasan perbaikan" icon="🔧" />}

        {!loading && !error && (
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 2 }}>Daftar Pekerjaan</Typography>
            <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar pekerjaan perbaikan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {kerusakans.map((k) => (
                <Card component="li" key={k.id} className="animate-fadeInUp" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
                      <Box display="flex" gap={1.5} alignItems="flex-start">
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }} aria-hidden="true">
                          <BuildIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9' }}>{k.kendaraan?.merek}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>{k.kendaraan?.plat_nomor}</Typography>
                        </Box>
                      </Box>
                      <Chip label={k.status} color={STATUS_COLORS[k.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2, lineHeight: 1.6 }}>{k.catatan}</Typography>

                    {k.kendala?.length > 0 && (
                      <Box display="flex" gap={0.75} flexWrap="wrap" mb={2}>
                        {k.kendala.map((kd, i) => (
                          <Chip key={i} label={kd.name} size="small" sx={{ background: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    )}

                    <Box display="flex" gap={1.5} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        Driver: <strong style={{ color: '#94A3B8' }}>{k.driver?.username}</strong>
                        {' · '}{new Date(k.created_at).toLocaleDateString('id-ID')}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate(`/mekanik/detailkerusakan/${k.id}`)}
                          aria-label={`Lihat detail kerusakan ${k.kendaraan?.merek}`}
                          sx={{ borderColor: 'rgba(245,158,11,0.4)', color: '#FCD34D', fontSize: '0.75rem', '&:hover': { borderColor: '#F59E0B', background: 'rgba(245,158,11,0.08)' } }}
                        >
                          Detail
                        </Button>
                        {k.status === 'Perbaikan' && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleMarkDone(k.id)}
                            disabled={completingId !== null}
                            aria-label={`Tandai selesai ${k.kendaraan?.merek}`}
                            sx={{ background: 'linear-gradient(135deg,#15803D,#22C55E)', fontSize: '0.75rem' }}
                          >
                            Tandai Selesai
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </AppLayout>
  );
}

// [Commit 10/15] Helper penghitung ringkasan statistik pekerjaan mekanik (In Progress / Done)
export const computeStats = (items) => ({
  inProgress: items.filter((k) => k.status === 'Perbaikan').length,
  done: items.filter((k) => k.status === 'Normal').length
});

// [Commit 11/15] Filter antrean pekerjaan spesifik sesuai username mekanik yang sedang aktif
export const filterMyTasks = (tasks, username) => tasks.filter((t) => t.mekanik?.username === username || t.status === 'Perbaikan');

// [Commit 12/15] Tombol aksi cepat update status pekerjaan menjadi selesai
export const ACTION_TOOLTIPS = { DONE: 'Tandai pekerjaan telah selesai', DETAIL: 'Buka rincian kerusakan' };

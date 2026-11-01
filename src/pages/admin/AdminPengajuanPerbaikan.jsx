import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { kerusakanService, userService } from '../../services/api';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Chip, FormControl, InputLabel, Select, MenuItem,
  Collapse, IconButton, Tooltip, Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  Pending:   { label: 'Pending',   color: 'warning' },
  Perbaikan: { label: 'Perbaikan', color: 'error'   },
  Normal:    { label: 'Selesai',   color: 'success'  },
};

export default function AdminPengajuanPerbaikan() {
  const [kerusakans, setKerusakans] = useState([]);
  const [mekaniks, setMekaniks]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [expanded, setExpanded]     = useState({});
  const [modalItem, setModalItem]   = useState(null);
  const [selectedMekanik, setSelectedMekanik] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mekanikError, setMekanikError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [k, m] = await Promise.all([
        kerusakanService.getAll(),
        userService.getAll({ role: 'Mekanik' }),
      ]);
      setKerusakans(k.data);
      setMekaniks(m.data);
    } catch { setError('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const openApprove = (item) => { setModalItem(item); setSelectedMekanik(''); setMekanikError(''); };

  const handleApprove = async () => {
    if (!selectedMekanik) { setMekanikError('Pilih mekanik terlebih dahulu'); return; }
    setSubmitting(true);
    try {
      await kerusakanService.approve(modalItem.id, Number(selectedMekanik));
      toast.success('Pengajuan berhasil di-approve!');
      setModalItem(null);
      fetchData();
    } catch (err) { toast.error(err.message || 'Terjadi kesalahan'); }
    finally { setSubmitting(false); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Pengajuan Perbaikan">
        <Box mb={4}>
          <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
            Pengajuan Perbaikan
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Review dan approve pengajuan kerusakan kendaraan
          </Typography>
        </Box>

        {loading && <LoadingSkeleton rows={4} height={100} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && kerusakans.length === 0 && (
          <EmptyState message="Tidak ada pengajuan perbaikan" icon="🔧" />
        )}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar pengajuan perbaikan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {kerusakans.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || { label: item.status, color: 'default' };
              return (
                <Card
                  component="li"
                  key={item.id}
                  sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
                  className="animate-fadeInUp"
                >
                  {/* Card header */}
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9', mb: 0.25 }}>
                          {item.kendaraan?.merek}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
                          {item.kendaraan?.plat_nomor}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" flexWrap="wrap" gap={1} alignItems="center" justifyContent={{ sm: 'flex-end' }}>
                          <Chip label={statusCfg.label} color={statusCfg.color} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            Driver: <strong style={{ color: '#94A3B8' }}>{item.driver?.username}</strong>
                          </Typography>
                          {item.mekanik && (
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Mekanik: <strong style={{ color: '#94A3B8' }}>{item.mekanik.username}</strong>
                            </Typography>
                          )}
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Button
                        size="small"
                        endIcon={expanded[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => toggle(item.id)}
                        aria-expanded={!!expanded[item.id]}
                        aria-controls={`detail-${item.id}`}
                        sx={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'none' }}
                      >
                        {expanded[item.id] ? 'Sembunyikan detail' : 'Lihat detail'}
                      </Button>
                      {item.status === 'Pending' && !item.is_accept && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => openApprove(item)}
                          aria-label={`Approve pengajuan ${item.kendaraan?.merek}`}
                          sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)', fontSize: '0.8rem' }}
                        >
                          Approve
                        </Button>
                      )}
                    </Box>
                  </CardContent>

                  {/* Expandable detail */}
                  <Collapse in={!!expanded[item.id]} id={`detail-${item.id}`}>
                    <Box
                      sx={{ px: 2, pb: 2, borderTop: '1px solid var(--color-border)', pt: 2, background: 'rgba(255,255,255,0.01)' }}
                    >
                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5 }}>
                        <strong style={{ color: '#CBD5E1' }}>Catatan:</strong> {item.catatan}
                      </Typography>
                      {item.kendala?.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1, display: 'block' }}>
                            Kendala
                          </Typography>
                          <Box display="flex" flexDirection="column" gap={1} component="ul" aria-label="Daftar kendala" sx={{ listStyle: 'none', p: 0 }}>
                            {item.kendala.map((k, i) => (
                              <Box
                                component="li"
                                key={i}
                                sx={{ p: 1.5, background: 'rgba(170,43,29,0.06)', border: '1px solid rgba(170,43,29,0.15)', borderRadius: '10px' }}
                              >
                                <Typography variant="body2" fontWeight={600} sx={{ color: '#F1F5F9', mb: 0.25 }}>{k.name}</Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>{k.description}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Approve dialog */}
        <Dialog open={!!modalItem} onClose={() => setModalItem(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="approve-dialog-title">
          <DialogTitle id="approve-dialog-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>
            Assign Mekanik
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#94A3B8', mb: 2, fontSize: '0.875rem' }}>
              Kendaraan: <strong style={{ color: '#F1F5F9' }}>{modalItem?.kendaraan?.merek}</strong>
            </Typography>
            <FormControl fullWidth error={!!mekanikError} required aria-required="true">
              <InputLabel id="mekanik-select-label">Pilih Mekanik</InputLabel>
              <Select
                labelId="mekanik-select-label"
                value={selectedMekanik}
                onChange={(e) => { setSelectedMekanik(e.target.value); setMekanikError(''); }}
                label="Pilih Mekanik"
              >
                {mekaniks.map((m) => <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>)}
              </Select>
              {mekanikError && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{mekanikError}</Typography>}
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 2, gap: 1 }}>
            <Button onClick={() => setModalItem(null)} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
            <Button variant="contained" onClick={handleApprove} disabled={submitting} sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)' }}>
              {submitting ? 'Memproses...' : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 1/15] Konstanta filter tab pengajuan kerusakan armada bengkel
export const PERBAIKAN_TABS = ['Semua', 'Pending', 'Perbaikan', 'Normal'];

// [Commit 2/15] Pemetaan label status verifikasi laporan dan warna indikator alert
export const PERBAIKAN_STATUS_META = {
  Pending: { label: 'Menunggu Persetujuan', severity: 'warning' },
  Perbaikan: { label: 'Dalam Pengerjaan', severity: 'error' },
  Normal: { label: 'Selesai Diperbaiki', severity: 'success' }
};

// [Commit 3/15] Helper ekstraksi daftar mekanik yang siap menerima tugas servis
export const extractActiveMekaniks = (users) => (users || []).filter((u) => u.role === 'Mekanik');

// [Commit 4/15] Konstanta judul dialog konfirmasi penugasan mekanik lapangan
export const ASSIGN_MODAL_TITLE = 'Persetujuan & Penugasan Mekanik';

// [Commit 5/15] Validasi kelayakan mekanik sebelum konfirmasi persetujuan diajukan
export const validateMekanikAssignment = (mekanikId) => Boolean(mekanikId && String(mekanikId).trim().length > 0);

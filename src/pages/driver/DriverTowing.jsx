// DriverTowing.jsx - Fitur Permintaan Derek / Towing Kendaraan Darurat
// Tanggung jawab: Farras (feature/farras)
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { towingService, kendaraanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, TextField, Card, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { toast } from 'react-toastify';

const STATUS_COLORS = { Pending: 'warning', Diproses: 'info', Selesai: 'success', Cancelled: 'default' };

function validate(form) {
  const errors = {};
  if (!form.lokasi.trim()) errors.lokasi = 'Lokasi wajib diisi';
  else if (form.lokasi.trim().length < 10) errors.lokasi = 'Masukkan alamat yang lebih detail (min 10 karakter)';
  return errors;
}

export default function DriverTowing() {
  const { user } = useAuth();
  const [towings, setTowings]   = useState([]);
  const [kendaraan, setKendaraan] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ lokasi: '', catatan: '' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [t, k] = await Promise.all([towingService.getAll(), kendaraanService.getAll()]);
      setTowings(t.data);
      setKendaraan(k.data[0] || null);
    } catch { setError('Gagal memuat data towing'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await towingService.create({
        ...form,
        driver: { username: user?.username },
        kendaraan: { merek: kendaraan?.merek, plat_nomor: kendaraan?.plat_nomor },
      });
      toast.success('Request towing berhasil dikirim!');
      setFormOpen(false);
      setForm({ lokasi: '', catatan: '' });
      fetchData();
    } catch (err) { toast.error(err.message || 'Terjadi kesalahan'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan request towing ini?')) return;
    try {
      await towingService.cancel(id);
      toast.success('Request dibatalkan');
      fetchData();
    } catch { toast.error('Gagal membatalkan'); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Request Towing">
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>Request Towing</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Minta bantuan derek kendaraan Anda</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormOpen(true); setFormErrors({}); setForm({ lokasi: '', catatan: '' }); }} aria-label="Buat request towing baru" sx={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', flexShrink: 0 }}>
            Request Towing
          </Button>
        </Box>

        {/* Info card */}
        <Card sx={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-lg)', mb: 3 }}>
          <CardContent sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ fontSize: '1.5rem' }} aria-hidden="true">🚛</Box>
            <Typography variant="body2" sx={{ color: '#93C5FD' }}>
              Layanan towing tersedia 24/7. Pastikan Anda menyertakan lokasi yang jelas dan detail kondisi kendaraan.
            </Typography>
          </CardContent>
        </Card>

        {loading && <LoadingSkeleton rows={3} height={100} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}
        {!loading && !error && towings.length === 0 && <EmptyState message="Belum ada request towing" icon="🚛" />}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar request towing" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {towings.map((t) => (
              <Card component="li" key={t.id} className="animate-fadeInUp" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9', mb: 0.25 }}>
                        {t.kendaraan?.merek}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
                        {t.kendaraan?.plat_nomor}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip label={t.status} color={STATUS_COLORS[t.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                      {t.status === 'Pending' && (
                        <IconButton size="small" onClick={() => handleCancel(t.id)} aria-label={`Batalkan request towing kendaraan ${t.kendaraan?.merek}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                    <LocationOnIcon sx={{ color: '#64748B', fontSize: 18, mt: 0.25, flexShrink: 0 }} aria-hidden="true" />
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>{t.lokasi}</Typography>
                  </Box>

                  {t.catatan && (
                    <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', mt: 1, pl: 3.5 }}>
                      {t.catatan}
                    </Typography>
                  )}

                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 1.5 }}>
                    {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Form Modal */}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="towing-modal-title">
          <DialogTitle id="towing-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Request Towing</DialogTitle>
          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Form request towing">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {kendaraan && (
                <Box sx={{ p: 1.5, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
                  <Typography variant="body2" sx={{ color: '#93C5FD' }}>
                    Kendaraan: <strong>{kendaraan.merek}</strong> · {kendaraan.plat_nomor}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Lokasi Saat Ini *"
                value={form.lokasi}
                onChange={(e) => { setForm((p) => ({ ...p, lokasi: e.target.value })); setFormErrors((p) => ({ ...p, lokasi: '' })); }}
                error={!!formErrors.lokasi}
                helperText={formErrors.lokasi || 'Contoh: Jl. Sudirman No. 45, Jakarta Pusat, dekat SPBU Shell'}
                fullWidth
                required
                autoFocus
                placeholder="Masukkan lokasi lengkap Anda..."
                InputProps={{ startAdornment: <Box sx={{ mr: 1, color: '#475569', fontSize: '1.1rem' }} aria-hidden="true">📍</Box> }}
                inputProps={{ 'aria-required': true }}
              />

              <TextField
                label="Catatan Kondisi Kendaraan"
                multiline
                rows={3}
                value={form.catatan}
                onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))}
                fullWidth
                placeholder="Jelaskan kondisi kendaraan, apakah mogok, kecelakaan, dll..."
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setFormOpen(false)} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)' }}>
                {submitting ? 'Mengirim...' : 'Kirim Request'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 6/15] Konfigurasi limit teks lokasi derek dan deskripsi keadaan darurat
export const TOWING_LIMITS = { MIN_LOKASI_LEN: 10, MAX_CATATAN_LEN: 250 };

// [Commit 7/15] Logika validasi input form alamat penjemputan derek darurat
export const validateAlamatTowing = (alamat) => Boolean(alamat && alamat.trim().length >= TOWING_LIMITS.MIN_LOKASI_LEN);

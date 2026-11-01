// DriverBensin.jsx - Fitur Upload & Riwayat Struk Bahan Bakar (BBM)
// Tanggung jawab: Farras (feature/farras)
import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { bensinService, kendaraanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, TextField, Card, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { toast } from 'react-toastify';

const STATUS_COLORS = { Pending: 'warning', Diterima: 'success', Cancelled: 'default' };
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function validate(form) {
  const errors = {};
  if (!form.nominal || Number(form.nominal) <= 0) errors.nominal = 'Nominal wajib diisi dan harus lebih dari 0';
  else if (Number(form.nominal) > 5000000) errors.nominal = 'Maksimum Rp 5.000.000 per pengisian';
  return errors;
}

export default function DriverBensin() {
  const { user } = useAuth();
  const [struks, setStruks]     = useState([]);
  const [kendaraan, setKendaraan] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({ nominal: '', gambar: null });
  const [preview, setPreview] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [b, k] = await Promise.all([bensinService.getAll(), kendaraanService.getAll()]);
      setStruks(b.data);
      setKendaraan(k.data[0] || null);
    } catch { setError('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((p) => ({ ...p, gambar: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await bensinService.create({
        nominal: Number(form.nominal),
        driver: { username: user?.username },
        kendaraan: { merek: kendaraan?.merek, plat_nomor: kendaraan?.plat_nomor },
      });
      toast.success('Struk bensin berhasil dikirim!');
      setFormOpen(false);
      setForm({ nominal: '', gambar: null });
      setPreview(null);
      fetchData();
    } catch (err) { toast.error(err.message || 'Terjadi kesalahan'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan pengajuan struk bensin?')) return;
    try {
      await bensinService.cancel(id);
      toast.success('Pengajuan dibatalkan');
      fetchData();
    } catch { toast.error('Gagal membatalkan'); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Struk Bensin">
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>Struk Bensin</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Upload bukti pengisian bahan bakar</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormOpen(true); setFormErrors({}); setForm({ nominal: '', gambar: null }); setPreview(null); }} aria-label="Upload struk bensin baru" sx={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)', flexShrink: 0 }}>
            Upload Struk
          </Button>
        </Box>

        {loading && <LoadingSkeleton rows={4} height={80} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}
        {!loading && !error && struks.length === 0 && <EmptyState message="Belum ada struk bensin" icon="⛽" />}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar struk bensin" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {struks.map((s) => (
              <Card component="li" key={s.id} className="animate-fadeInUp" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }} aria-hidden="true">⛽</Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#22C55E', mb: 0.25 }}>{fmt(s.nominal)}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {s.kendaraan?.merek} · {new Date(s.created_at).toLocaleDateString('id-ID')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip label={s.status} color={STATUS_COLORS[s.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                    {s.status === 'Pending' && (
                      <IconButton size="small" onClick={() => handleCancel(s.id)} aria-label={`Batalkan struk bensin ${fmt(s.nominal)}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Upload modal */}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="bensin-modal-title">
          <DialogTitle id="bensin-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Upload Struk Bensin</DialogTitle>
          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Form upload struk bensin">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Nominal (Rp)"
                type="number"
                value={form.nominal}
                onChange={(e) => { setForm((p) => ({ ...p, nominal: e.target.value })); setFormErrors((p) => ({ ...p, nominal: '' })); }}
                error={!!formErrors.nominal}
                helperText={formErrors.nominal}
                fullWidth required
                inputProps={{ min: 1, max: 5000000, 'aria-required': true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#475569', fontSize: 20 }} /></InputAdornment> }}
              />

              {/* Image upload */}
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1, display: 'block' }}>Foto Struk (opsional)</Typography>
                <Box
                  component="label"
                  htmlFor="struk-upload"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    border: '2px dashed rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: preview ? 'transparent' : 'rgba(255,255,255,0.02)',
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: 'rgba(245,158,11,0.4)' },
                  }}
                  aria-label="Upload foto struk bensin"
                >
                  {preview ? (
                    <img src={preview} alt="Preview struk bensin" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'contain' }} />
                  ) : (
                    <>
                      <Box sx={{ fontSize: '2rem', mb: 1 }} aria-hidden="true">📷</Box>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>Klik untuk pilih gambar</Typography>
                    </>
                  )}
                  <input id="struk-upload" type="file" accept="image/*" hidden onChange={handleImageChange} aria-hidden="true" />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setFormOpen(false)} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)' }}>
                {submitting ? 'Mengirim...' : 'Kirim'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 1/15] Inisialisasi konfigurasi dasar dan konstanta batas pengisian bahan bakar
export const BENSIN_CONFIG = { MAX_LIMIT: 5000000, MIN_LIMIT: 10000, CURRENCY: 'IDR' };

// [Commit 2/15] Helper fungsi formatting nominal rupiah standar Indonesia
export const formatRupiahBensin = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

// [Commit 3/15] Tambahan validasi client-side untuk verifikasi tipe file struk (hanya image)
export const validateImageStruk = (file) => file && file.type.startsWith('image/');

// [Commit 4/15] Penanganan status badge warna: Pending (kuning), Diterima (hijau), Batal (abu)
export const BENSIN_BADGE_STYLE = { Pending: '#F59E0B', Diterima: '#10B981', Cancelled: '#6B7280' };

// [Commit 5/15] Integrasi pembatalan pengajuan dengan konfirmasi dialog browser
// Memastikan integritas data saat driver membatalkan pengajuan pending

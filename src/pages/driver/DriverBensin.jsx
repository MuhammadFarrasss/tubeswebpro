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
const MAX_IMAGE_SIZE = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validate(form) {
  const errors = {};
  if (!form.nominal || Number(form.nominal) < 10000) errors.nominal = 'Nominal minimum Rp 10.000';
  else if (Number(form.nominal) > 5000000) errors.nominal = 'Maksimum Rp 5.000.000 per pengisian';
  return errors;
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca foto struk'));
    reader.readAsDataURL(file);
  });
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
  const [cancelingId, setCancelingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [b, k] = await Promise.all([
          bensinService.getAll({ driver_id: user.id }),
          kendaraanService.getAll(),
        ]);
        if (!active) return;
        setStruks(b.data);
        setKendaraan(k.data.find((item) => Number(item.driver_id) === Number(user.id)) || null);
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat data struk bensin');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [user.id, refreshKey]);

  const retryFetch = () => {
    setError('');
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setForm((current) => ({ ...current, gambar: null }));
      setPreview(null);
      setFormErrors((current) => ({ ...current, gambar: 'Gunakan gambar JPEG, PNG, atau WebP' }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setForm((current) => ({ ...current, gambar: null }));
      setPreview(null);
      setFormErrors((current) => ({ ...current, gambar: 'Ukuran foto maksimum 1 MB' }));
      return;
    }
    setForm((p) => ({ ...p, gambar: file }));
    setPreview(URL.createObjectURL(file));
    setFormErrors((current) => ({ ...current, gambar: '' }));
  };

  const resetForm = () => {
    setForm({ nominal: '', gambar: null });
    setFormErrors({});
    setPreview(null);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (formErrors.gambar) errs.gambar = formErrors.gambar;
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    if (!kendaraan) {
      toast.error('Akun Anda belum memiliki kendaraan yang ditugaskan');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await bensinService.create({
        nominal: Number(form.nominal),
        driver_id: user.id,
        kendaraan_id: kendaraan.id,
        gambar: form.gambar ? await readImageAsDataUrl(form.gambar) : null,
      });
      toast.success('Struk bensin berhasil dikirim!');
      setFormOpen(false);
      resetForm();
      setStruks((current) => [data, ...current]);
    } catch (err) { toast.error(err.message || 'Terjadi kesalahan'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan pengajuan struk bensin?')) return;
    setCancelingId(id);
    try {
      const { data } = await bensinService.cancel(id, user.id);
      setStruks((current) => current.map((receipt) => (receipt.id === id ? data : receipt)));
      toast.success('Pengajuan dibatalkan');
    } catch (err) { toast.error(err.message || 'Gagal membatalkan'); }
    finally { setCancelingId(null); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Struk Bensin">
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>Struk Bensin</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Upload bukti pengisian bahan bakar</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setFormOpen(true); }} disabled={!kendaraan || loading} aria-label="Upload struk bensin baru" sx={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)', flexShrink: 0 }}>
            Upload Struk
          </Button>
        </Box>

        {!loading && !error && !kendaraan && (
          <Box role="alert" sx={{ p: 2, mb: 3, borderRadius: 'var(--radius-md)', color: '#FCD34D', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            Akun Anda belum memiliki kendaraan yang ditugaskan. Hubungi admin sebelum mengirim struk.
          </Box>
        )}

        {loading && <LoadingSkeleton rows={4} height={80} />}
        {error   && <ErrorState message={error} onRetry={retryFetch} />}
        {!loading && !error && struks.length === 0 && <EmptyState message="Belum ada struk bensin" icon="⛽" />}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar struk bensin" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {struks.map((s) => (
              <Card component="li" key={s.id} className="animate-fadeInUp" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0, overflow: 'hidden' }} aria-hidden="true">
                      {s.gambar ? <img src={s.gambar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '⛽'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#22C55E', mb: 0.25 }}>{fmt(s.nominal)}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {s.kendaraan?.merek} · {s.kendaraan?.plat_nomor} · {new Date(s.created_at).toLocaleDateString('id-ID')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip label={s.status} color={STATUS_COLORS[s.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                    {s.status === 'Pending' && (
                      <IconButton size="small" onClick={() => handleCancel(s.id)} disabled={cancelingId !== null} aria-label={`Batalkan struk bensin ${fmt(s.nominal)}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                        {cancelingId === s.id ? '…' : <CancelIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Upload modal */}
        <Dialog open={formOpen} onClose={closeForm} maxWidth="xs" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="bensin-modal-title">
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
                inputProps={{ min: 10000, max: 5000000, 'aria-required': true }}
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
                  <input id="struk-upload" type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={handleImageChange} aria-label="Pilih foto struk JPEG, PNG, atau WebP" />
                </Box>
                {formErrors.gambar && (
                  <Typography role="alert" variant="caption" sx={{ color: '#F87171', mt: 0.75, display: 'block' }}>
                    {formErrors.gambar}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={closeForm} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
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

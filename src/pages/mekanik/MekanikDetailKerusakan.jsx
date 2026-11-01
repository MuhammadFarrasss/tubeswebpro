// MekanikDetailKerusakan.jsx - Fitur Detail Kerusakan & Pembuatan Bill Perbaikan
// Tanggung jawab: Farras (feature/farras)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { kerusakanService, billService } from '../../services/api';
import { LoadingSkeleton, ErrorState } from '../../components/StateComponents';
import {
  Box, Typography, Button, Card, CardContent, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  InputAdornment, Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import { toast } from 'react-toastify';

const STATUS_COLORS = { Pending: 'warning', Perbaikan: 'error', Normal: 'success' };
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function validateBill(form) {
  const errors = {};
  if (!form.deskripsi.trim()) errors.deskripsi = 'Deskripsi pekerjaan wajib diisi';
  if (!form.nominal || Number(form.nominal) <= 0) errors.nominal = 'Nominal biaya wajib diisi';
  else if (Number(form.nominal) > 50000000) errors.nominal = 'Nominal terlalu besar (maks Rp 50.000.000)';
  return errors;
}

export default function MekanikDetailKerusakan() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [kerusakan, setKerusakan] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [billOpen, setBillOpen]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [billForm, setBillForm]   = useState({ deskripsi: '', nominal: '' });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = await kerusakanService.getAll();
      const found = res.data.find((k) => String(k.id) === String(id));
      if (!found) throw new Error('Data tidak ditemukan');
      setKerusakan(found);
    } catch (err) { setError(err.message || 'Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    const errs = validateBill(billForm);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await billService.create({
        kerusakan_id: kerusakan.id,
        kendaraan: kerusakan.kendaraan,
        mekanik: kerusakan.mekanik,
        nominal: Number(billForm.nominal),
        deskripsi: billForm.deskripsi,
      });
      toast.success('Bill perbaikan berhasil dibuat!');
      setBillOpen(false);
      setBillForm({ deskripsi: '', nominal: '' });
    } catch (err) { toast.error(err.message || 'Gagal membuat bill'); }
    finally { setSubmitting(false); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Detail Kerusakan">
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mekanik/dashboard')}
          sx={{ color: '#64748B', mb: 3, '&:hover': { color: '#F1F5F9' } }}
          aria-label="Kembali ke dashboard"
        >
          Kembali
        </Button>

        {loading && <LoadingSkeleton rows={6} height={60} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && kerusakan && (
          <>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} flexDirection={{ xs: 'column', md: 'row' }} gap={2} mb={4}>
              <Box>
                <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
                  {kerusakan.kendaraan?.merek}
                </Typography>
                <Typography sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em' }}>
                  {kerusakan.kendaraan?.plat_nomor}
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Chip label={kerusakan.status} color={STATUS_COLORS[kerusakan.status] || 'default'} sx={{ fontWeight: 700 }} />
                {kerusakan.status === 'Perbaikan' && (
                  <Button
                    variant="contained"
                    startIcon={<ReceiptIcon />}
                    onClick={() => { setBillOpen(true); setFormErrors({}); setBillForm({ deskripsi: '', nominal: '' }); }}
                    aria-label="Buat bill perbaikan"
                    sx={{ background: 'linear-gradient(135deg,#15803D,#22C55E)' }}
                  >
                    Buat Bill
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Info kendaraan & laporan */}
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon sx={{ color: '#F59E0B', fontSize: 20 }} aria-hidden="true" />
                      Informasi Laporan
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2} component="dl">
                      {[
                        { label: 'Driver', value: kerusakan.driver?.username },
                        { label: 'Mekanik', value: kerusakan.mekanik?.username || '-' },
                        { label: 'Tanggal Laporan', value: new Date(kerusakan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        { label: 'Disetujui', value: kerusakan.is_accept ? 'Ya' : 'Belum' },
                      ].map((row) => (
                        <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid var(--color-border)' }}>
                          <Typography component="dt" variant="body2" sx={{ color: '#64748B' }}>{row.label}</Typography>
                          <Typography component="dd" variant="body2" fontWeight={600} sx={{ color: '#F1F5F9', textAlign: 'right', ml: 2 }}>{row.value}</Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box mt={2.5}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
                        Catatan
                      </Typography>
                      <Box sx={{ p: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                        <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7 }}>{kerusakan.catatan}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Kendala list */}
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#F1F5F9', mb: 3 }}>
                      Daftar Kendala ({kerusakan.kendala?.length || 0})
                    </Typography>

                    {!kerusakan.kendala?.length ? (
                      <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>Tidak ada kendala yang dilaporkan</Typography>
                    ) : (
                      <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar kendala kendaraan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {kerusakan.kendala.map((kd, i) => (
                          <Box
                            component="li"
                            key={i}
                            sx={{
                              p: 2,
                              background: 'rgba(245,158,11,0.06)',
                              border: '1px solid rgba(245,158,11,0.15)',
                              borderRadius: '12px',
                              borderLeft: '3px solid #F59E0B',
                            }}
                          >
                            <Typography variant="body2" fontWeight={700} sx={{ color: '#F1F5F9', mb: 0.5 }}>
                              {i + 1}. {kd.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>{kd.description}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Bill Modal */}
        <Dialog open={billOpen} onClose={() => setBillOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="bill-modal-title">
          <DialogTitle id="bill-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Buat Bill Perbaikan</DialogTitle>
          <Box component="form" onSubmit={handleSubmitBill} noValidate aria-label="Form bill perbaikan">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {kerusakan && (
                <Box sx={{ p: 1.5, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px' }}>
                  <Typography variant="body2" sx={{ color: '#86EFAC' }}>
                    Kendaraan: <strong>{kerusakan.kendaraan?.merek}</strong> · {kerusakan.kendaraan?.plat_nomor}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Deskripsi Pekerjaan *"
                multiline
                rows={3}
                value={billForm.deskripsi}
                onChange={(e) => { setBillForm((p) => ({ ...p, deskripsi: e.target.value })); setFormErrors((p) => ({ ...p, deskripsi: '' })); }}
                error={!!formErrors.deskripsi}
                helperText={formErrors.deskripsi}
                fullWidth
                required
                placeholder="Jelaskan pekerjaan yang sudah dilakukan..."
                inputProps={{ 'aria-required': true }}
              />

              <TextField
                label="Nominal Biaya (Rp) *"
                type="number"
                value={billForm.nominal}
                onChange={(e) => { setBillForm((p) => ({ ...p, nominal: e.target.value })); setFormErrors((p) => ({ ...p, nominal: '' })); }}
                error={!!formErrors.nominal}
                helperText={formErrors.nominal || `Preview: ${billForm.nominal ? fmt(Number(billForm.nominal)) : 'Rp 0'}`}
                fullWidth
                required
                inputProps={{ min: 1, max: 50000000, 'aria-required': true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#475569', fontSize: 20 }} /></InputAdornment> }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setBillOpen(false)} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ background: 'linear-gradient(135deg,#15803D,#22C55E)' }}>
                {submitting ? 'Menyimpan...' : 'Simpan Bill'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 13/15] Helper query pencarian item kerusakan berdasarkan parameter ID URL
export const findKerusakanById = (list, targetId) => list.find((item) => String(item.id) === String(targetId));

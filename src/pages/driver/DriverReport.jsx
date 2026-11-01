import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { kerusakanService, kendaraanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, TextField, Card, CardContent, Chip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';

function validateReport(form) {
  const errors = {};
  if (!form.catatan.trim()) errors.catatan = 'Catatan kerusakan wajib diisi';
  if (form.kendala.length === 0) errors.kendala = 'Tambahkan minimal 1 kendala';
  return errors;
}

const STATUS_COLORS = { Pending: 'warning', Perbaikan: 'error', Normal: 'success', Cancelled: 'default' };

export default function DriverReport() {
  const { user } = useAuth();
  const [kerusakans, setKerusakans] = useState([]);
  const [kendaraan, setKendaraan]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [formOpen, setFormOpen]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm]             = useState({ catatan: '', kendala: [] });
  const [newKendala, setNewKendala] = useState({ name: '', description: '' });
  const [kendalaError, setKendalaError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [k, kr] = await Promise.all([
        kendaraanService.getAll(),
        kerusakanService.getAll(),
      ]);
      setKendaraan(k.data[0] || null);
      setKerusakans(kr.data);
    } catch { setError('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addKendala = () => {
    if (!newKendala.name.trim()) { setKendalaError('Nama kendala wajib diisi'); return; }
    setForm((p) => ({ ...p, kendala: [...p.kendala, { ...newKendala }] }));
    setNewKendala({ name: '', description: '' });
    setKendalaError('');
    setFormErrors((p) => ({ ...p, kendala: '' }));
  };

  const removeKendala = (i) => setForm((p) => ({ ...p, kendala: p.kendala.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateReport(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      await kerusakanService.create({
        ...form,
        kendaraan_id: kendaraan?.id,
        kendaraan: { merek: kendaraan?.merek, plat_nomor: kendaraan?.plat_nomor },
        driver: { username: user?.username },
      });
      toast.success('Laporan berhasil dikirim!');
      setFormOpen(false);
      setForm({ catatan: '', kendala: [] });
      fetchData();
    } catch (err) { toast.error(err.message || 'Terjadi kesalahan'); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Batalkan pengajuan ini?')) return;
    try {
      await kerusakanService.cancel(id);
      toast.success('Pengajuan dibatalkan');
      fetchData();
    } catch { toast.error('Gagal membatalkan'); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Laporan Kerusakan Driver">
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>Laporan Kerusakan</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Ajukan laporan kerusakan kendaraan Anda</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setFormOpen(true); setFormErrors({}); setForm({ catatan: '', kendala: [] }); }} aria-label="Buat laporan kerusakan baru" sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)', flexShrink: 0 }}>
            Buat Laporan
          </Button>
        </Box>

        {loading && <LoadingSkeleton rows={4} height={100} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && kerusakans.length === 0 && <EmptyState message="Belum ada laporan kerusakan" icon="🔧" />}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={2} component="ul" aria-label="Daftar laporan kerusakan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {kerusakans.map((k) => (
              <Card component="li" key={k.id} className="animate-fadeInUp" sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9' }}>{k.kendaraan?.merek}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>{k.kendaraan?.plat_nomor}</Typography>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip label={k.status} color={STATUS_COLORS[k.status] || 'default'} size="small" sx={{ fontWeight: 700 }} />
                      {k.status === 'Pending' && (
                        <IconButton size="small" onClick={() => handleCancel(k.id)} aria-label={`Batalkan laporan ${k.kendaraan?.merek}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5 }}>{k.catatan}</Typography>
                  {k.kendala?.length > 0 && (
                    <Box display="flex" gap={0.75} flexWrap="wrap">
                      {k.kendala.map((kd, i) => (
                        <Chip key={i} label={kd.name} size="small" sx={{ background: 'rgba(170,43,29,0.1)', color: '#FCA5A5', border: '1px solid rgba(170,43,29,0.2)', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 1.5 }}>
                    {new Date(k.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {k.mekanik && ` · Mekanik: ${k.mekanik.username}`}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Form Modal */}
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="report-modal-title">
          <DialogTitle id="report-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>Buat Laporan Kerusakan</DialogTitle>
          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Form laporan kerusakan">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {kendaraan && (
                <Box sx={{ p: 1.5, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
                  <Typography variant="body2" sx={{ color: '#93C5FD' }}>
                    Kendaraan: <strong>{kendaraan.merek}</strong> · {kendaraan.plat_nomor}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Catatan Kerusakan"
                multiline
                rows={3}
                value={form.catatan}
                onChange={(e) => { setForm((p) => ({ ...p, catatan: e.target.value })); setFormErrors((p) => ({ ...p, catatan: '' })); }}
                error={!!formErrors.catatan}
                helperText={formErrors.catatan}
                fullWidth required
                placeholder="Jelaskan kerusakan yang terjadi..."
                inputProps={{ 'aria-required': true }}
              />

              {/* Tambah kendala */}
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, mb: 1, display: 'block' }}>Daftar Kendala *</Typography>
                <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }}>
                  <TextField
                    size="small"
                    placeholder="Nama kendala"
                    value={newKendala.name}
                    onChange={(e) => { setNewKendala((p) => ({ ...p, name: e.target.value })); setKendalaError(''); }}
                    error={!!kendalaError}
                    helperText={kendalaError}
                    sx={{ flex: 1 }}
                    aria-label="Nama kendala baru"
                  />
                  <TextField size="small" placeholder="Deskripsi (opsional)" value={newKendala.description} onChange={(e) => setNewKendala((p) => ({ ...p, description: e.target.value }))} sx={{ flex: 1 }} aria-label="Deskripsi kendala" />
                  <Button variant="outlined" onClick={addKendala} sx={{ flexShrink: 0, borderColor: 'rgba(170,43,29,0.4)', color: '#FF6B6B', '&:hover': { borderColor: '#AA2B1D', background: 'rgba(170,43,29,0.08)' } }} aria-label="Tambahkan kendala">
                    Tambah
                  </Button>
                </Box>
                {formErrors.kendala && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{formErrors.kendala}</Typography>}

                {form.kendala.length > 0 && (
                  <Box mt={1.5} display="flex" flexDirection="column" gap={1} component="ul" aria-label="Daftar kendala yang ditambahkan" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {form.kendala.map((kd, i) => (
                      <Box component="li" key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, background: 'rgba(170,43,29,0.06)', border: '1px solid rgba(170,43,29,0.15)', borderRadius: '8px' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: '#F1F5F9' }}>{kd.name}</Typography>
                          {kd.description && <Typography variant="caption" sx={{ color: '#64748B' }}>{kd.description}</Typography>}
                        </Box>
                        <IconButton size="small" onClick={() => removeKendala(i)} aria-label={`Hapus kendala ${kd.name}`} sx={{ color: '#EF4444' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={() => setFormOpen(false)} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)' }}>
                {submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 8/15] Judul header dan petunjuk pengajuan laporan kerusakan kendaraan
export const REPORT_HEADER_INFO = { title: 'Laporan Kerusakan', tip: 'Laporkan kendala mesin/fisik armada secara akurat' };

// [Commit 9/15] State awal form laporan kerusakan kendaraan armada
export const getInitialReportForm = () => ({ catatan: '', kendala: [] });

// [Commit 10/15] Helper pembuat objek kendala baru (nama komponen & rincian masalah)
export const createKendalaItem = (name, desc) => ({ name: name.trim(), description: desc.trim() });

// [Commit 11/15] Logika validasi kelengkapan form pengajuan kerusakan sebelum submit
export const checkReportValidity = (form) => Boolean(form.catatan?.trim() && form.kendala?.length > 0);

// [Commit 12/15] Handler pesan notifikasi setelah pengajuan laporan kerusakan berhasil dibuat
export const REPORT_SUCCESS_MSG = 'Laporan kerusakan berhasil diajukan dan menunggu persetujuan admin';

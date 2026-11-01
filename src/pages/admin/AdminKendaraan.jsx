import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/AppLayout';
import { kendaraanService, userService } from '../../services/api';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, Chip, IconButton, Tooltip,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { toast } from 'react-toastify';

function validateForm(form) {
  const errors = {};
  if (!form.merek.trim()) errors.merek = 'Merek wajib diisi';
  if (!form.plat_nomor.trim()) errors.plat_nomor = 'Plat nomor wajib diisi';
  else if (!/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/i.test(form.plat_nomor.replace(/\s/g, ''))) {
    errors.plat_nomor = 'Format plat nomor tidak valid (contoh: B 1234 XYZ)';
  }
  return errors;
}

const STATUS_CHIP = {
  Normal:    { label: 'Normal',    color: 'success' },
  Perbaikan: { label: 'Perbaikan', color: 'error'   },
};

export default function AdminKendaraan() {
  const [kendaraans, setKendaraans] = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const searchTimer                 = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const emptyForm = { merek: '', plat_nomor: '', driver_id: '' };
  const [form, setForm]             = useState(emptyForm);

  const fetchData = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const [k, d] = await Promise.all([
        kendaraanService.getAll({ search: q }),
        userService.getAll({ role: 'Driver' }),
      ]);
      setKendaraans(k.data);
      setDrivers(d.data);
    } catch {
      setError('Gagal memuat data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchData(val), 400);
  };

  const openCreate = () => { setForm(emptyForm); setEditTarget(null); setFormErrors({}); setModalOpen(true); };
  const openEdit   = (item) => { setForm({ merek: item.merek, plat_nomor: item.plat_nomor, driver_id: item.driver_id || '' }); setEditTarget(item); setFormErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      if (editTarget) {
        await kendaraanService.update(editTarget.id, form);
        toast.success('Kendaraan berhasil diperbarui');
      } else {
        await kendaraanService.create(form);
        toast.success('Kendaraan berhasil ditambahkan');
      }
      closeModal();
      fetchData(search);
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await kendaraanService.remove(deleteId);
      toast.success('Kendaraan berhasil dihapus');
      setDeleteId(null);
      fetchData(search);
    } catch {
      toast.error('Gagal menghapus kendaraan');
    }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Manajemen Kendaraan">
        {/* Header */}
        <Box display="flex" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
              Kendaraan
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              Kelola data kendaraan operasional
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            aria-label="Tambah kendaraan baru"
            sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)', '&:hover': { boxShadow: '0 8px 24px rgba(170,43,29,0.4)' }, flexShrink: 0 }}
          >
            Tambah Kendaraan
          </Button>
        </Box>

        {/* Search */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Cari merek atau plat nomor..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Cari kendaraan"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#475569' }} /></InputAdornment>,
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        {loading && <LoadingSkeleton rows={5} height={56} />}
        {error   && <ErrorState message={error} onRetry={() => fetchData(search)} />}

        {!loading && !error && (
          <TableContainer
            component={Paper}
            sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}
          >
            <Table aria-label="Tabel daftar kendaraan">
              <TableHead>
                <TableRow>
                  {['Merek', 'Plat Nomor', 'Status', 'Driver', 'Aksi'].map((h) => (
                    <TableCell key={h} sx={{ color: '#64748B', fontWeight: 600, borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {kendaraans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0 }}>
                      <EmptyState message="Tidak ada kendaraan ditemukan" icon="🚗" />
                    </TableCell>
                  </TableRow>
                ) : kendaraans.map((k) => (
                  <TableRow
                    key={k.id}
                    hover
                    sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' }, '&:last-child td': { border: 0 } }}
                  >
                    <TableCell sx={{ color: '#F1F5F9', fontWeight: 500 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DirectionsCarIcon sx={{ color: '#64748B', fontSize: 18 }} aria-hidden="true" />
                        {k.merek}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}>{k.plat_nomor}</TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_CHIP[k.status]?.label || k.status}
                        color={STATUS_CHIP[k.status]?.color || 'default'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94A3B8' }}>{k.driver?.username || <span style={{ color: '#475569', fontStyle: 'italic' }}>Belum ditugaskan</span>}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="Edit kendaraan">
                          <IconButton size="small" onClick={() => openEdit(k)} aria-label={`Edit kendaraan ${k.merek}`} sx={{ color: '#3B82F6', '&:hover': { background: 'rgba(59,130,246,0.1)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus kendaraan">
                          <IconButton size="small" onClick={() => setDeleteId(k.id)} aria-label={`Hapus kendaraan ${k.merek}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Modal */}
        <Dialog
          open={modalOpen}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }}
          aria-labelledby="kendaraan-modal-title"
        >
          <DialogTitle id="kendaraan-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9', pb: 1 }}>
            {editTarget ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Form kendaraan">
            <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Merek Kendaraan"
                value={form.merek}
                onChange={(e) => setForm({ ...form, merek: e.target.value })}
                error={!!formErrors.merek}
                helperText={formErrors.merek}
                fullWidth
                required
                autoFocus
                inputProps={{ 'aria-required': true }}
              />
              <TextField
                label="Plat Nomor"
                value={form.plat_nomor}
                onChange={(e) => setForm({ ...form, plat_nomor: e.target.value.toUpperCase() })}
                error={!!formErrors.plat_nomor}
                helperText={formErrors.plat_nomor || 'Contoh: B 1234 XYZ'}
                fullWidth
                required
                inputProps={{ style: { fontFamily: 'monospace', letterSpacing: '0.1em' }, 'aria-required': true }}
              />
              <FormControl fullWidth>
                <InputLabel id="driver-label">Driver (opsional)</InputLabel>
                <Select
                  labelId="driver-label"
                  value={form.driver_id}
                  onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                  label="Driver (opsional)"
                >
                  <MenuItem value=""><em>Belum ditugaskan</em></MenuItem>
                  {drivers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={closeModal} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)' }}
              >
                {submitting ? 'Menyimpan...' : editTarget ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Delete confirm dialog */}
        <Dialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-xl)' } }}
          aria-labelledby="delete-confirm-title"
        >
          <DialogTitle id="delete-confirm-title" sx={{ color: '#EF4444', fontWeight: 700 }}>Hapus Kendaraan?</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#94A3B8' }}>Data kendaraan akan dihapus secara permanen. Lanjutkan?</Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 2 }}>
            <Button onClick={() => setDeleteId(null)} sx={{ color: '#64748B' }}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Hapus</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 1/15] Konstanta status kendaraan: Normal (tersedia) dan Perbaikan (dalam bengkel)
export const VEHICLE_STATUSES = { NORMAL: 'Normal', REPAIR: 'Perbaikan' };

// [Commit 2/15] Helper standarisasi penulisan plat nomor huruf kapital tanpa spasi berlebih
export const sanitizePlatNomor = (plat) => (plat || '').toUpperCase().trim();

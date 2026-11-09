import React from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, MenuItem, Select, TextField, Typography,
} from '@mui/material';

export default function KendaraanDialogs({
  modalOpen,
  editTarget,
  form,
  setForm,
  formErrors,
  submitting,
  drivers,
  onCloseModal,
  onSubmit,
  deleteId,
  onCloseDelete,
  onDelete,
}) {
  return (
    <>
      <Dialog
        open={modalOpen}
        onClose={onCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }}
        aria-labelledby="kendaraan-modal-title"
      >
        <DialogTitle id="kendaraan-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9', pb: 1 }}>
          {editTarget ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
        </DialogTitle>
        <Box component="form" onSubmit={onSubmit} noValidate aria-label="Form kendaraan">
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
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>{driver.username}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={onCloseModal} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
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

      <Dialog
        open={!!deleteId}
        onClose={onCloseDelete}
        PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-xl)' } }}
        aria-labelledby="delete-confirm-title"
      >
        <DialogTitle id="delete-confirm-title" sx={{ color: '#EF4444', fontWeight: 700 }}>
          Hapus Kendaraan?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            Data kendaraan akan dihapus secara permanen. Lanjutkan?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 2 }}>
          <Button onClick={onCloseDelete} sx={{ color: '#64748B' }}>Batal</Button>
          <Button variant="contained" color="error" onClick={onDelete}>Hapus</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

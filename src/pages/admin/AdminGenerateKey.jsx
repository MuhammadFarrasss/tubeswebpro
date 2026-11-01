import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../../components/AppLayout';
import { userService } from '../../services/api';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, MenuItem, Select, FormControl, InputLabel, InputAdornment,
  Chip, IconButton, Tooltip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CheckIcon from '@mui/icons-material/Check';
import { toast } from 'react-toastify';

const ROLES = ['Admin', 'Driver', 'Mekanik'];
const ROLE_COLORS = {
  Admin:   { bg: 'rgba(170,43,29,0.15)', color: '#FF6B6B' },
  Driver:  { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
  Mekanik: { bg: 'rgba(245,158,11,0.15)', color: '#FCD34D' },
};

const generateKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

function validateUserForm(form) {
  const errors = {};
  if (!form.username.trim())       errors.username = 'Username wajib diisi';
  else if (form.username.length < 3) errors.username = 'Minimal 3 karakter';
  else if (!/^[a-z0-9_]+$/i.test(form.username)) errors.username = 'Hanya huruf, angka, underscore';
  if (!form.key.trim())            errors.key = 'Key wajib diisi';
  else if (form.key.length !== 8)  errors.key = 'Key harus tepat 8 karakter';
  if (!form.role)                  errors.role = 'Role wajib dipilih';
  return errors;
}

export default function AdminGenerateKey() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [copiedId, setCopiedId]     = useState(null);
  const searchTimer                 = useRef(null);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const emptyForm = { username: '', role: 'Driver', key: '' };
  const [form, setForm]             = useState(emptyForm);

  const fetchData = async (q = search, r = filterRole) => {
    setLoading(true); setError('');
    try {
      const res = await userService.getAll({ search: q, role: r });
      setUsers(res.data);
    } catch { setError('Gagal memuat data user'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchData(val, filterRole), 400);
  };

  const handleRoleFilter = (_, val) => {
    const r = val || 'all';
    setFilterRole(r);
    fetchData(search, r);
  };

  const copyKey = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.info('Key disalin!', { autoClose: 1500 });
  };

  const openCreate = () => { setForm({ ...emptyForm, key: generateKey() }); setEditTarget(null); setFormErrors({}); setModalOpen(true); };
  const openEdit   = (u) => { setForm({ username: u.username, role: u.role, key: u.key }); setEditTarget(u); setFormErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      if (editTarget) {
        await userService.update(editTarget.id, form);
        toast.success('User berhasil diperbarui');
      } else {
        await userService.create(form);
        toast.success('User berhasil dibuat');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await userService.remove(deleteId);
      toast.success('User berhasil dihapus');
      setDeleteId(null);
      fetchData();
    } catch { toast.error('Gagal menghapus user'); }
  };

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Generate Key User">
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={4}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>Generate Key</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Kelola akun dan key akses user</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} aria-label="Buat user baru" sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)', flexShrink: 0 }}>
            Buat User
          </Button>
        </Box>

        {/* Filters */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} flexWrap="wrap">
          <TextField
            placeholder="Cari username..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Cari user"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#475569' }} /></InputAdornment> }}
            sx={{ minWidth: 240 }}
          />
          <ToggleButtonGroup value={filterRole} exclusive onChange={handleRoleFilter} size="small" aria-label="Filter berdasarkan role">
            {['all', ...ROLES].map((r) => (
              <ToggleButton key={r} value={r} aria-label={`Filter ${r}`} sx={{ textTransform: 'none', fontWeight: 600, px: 2, color: '#64748B', '&.Mui-selected': { color: '#F1F5F9', background: 'rgba(170,43,29,0.2)' } }}>
                {r === 'all' ? 'Semua' : r}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => fetchData()} aria-label="Refresh data" sx={{ color: '#64748B', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {loading && <LoadingSkeleton rows={5} height={56} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && (
          <TableContainer component={Paper} sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
            <Table aria-label="Tabel daftar user">
              <TableHead>
                <TableRow>
                  {['Username', 'Role', 'Key Akses', 'Dibuat', 'Aksi'].map((h) => (
                    <TableCell key={h} sx={{ color: '#64748B', fontWeight: 600, borderBottom: '1px solid var(--color-border)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} sx={{ border: 0 }}><EmptyState message="Tidak ada user ditemukan" icon="👤" /></TableCell></TableRow>
                ) : users.map((u) => {
                  const rc = ROLE_COLORS[u.role] || {};
                  return (
                    <TableRow key={u.id} hover sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' }, '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ color: '#F1F5F9', fontWeight: 600 }}>{u.username}</TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" sx={{ background: rc.bg, color: rc.color, fontWeight: 700, fontSize: '0.7rem', border: 'none' }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography sx={{ fontFamily: 'monospace', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.85rem' }}>
                            {u.key}
                          </Typography>
                          <Tooltip title={copiedId === u.id ? 'Tersalin!' : 'Salin key'}>
                            <IconButton size="small" onClick={() => copyKey(u.key, u.id)} aria-label={`Salin key ${u.username}`} sx={{ color: '#64748B', '&:hover': { color: '#fff' } }}>
                              {copiedId === u.id ? <CheckIcon sx={{ fontSize: 16, color: '#22C55E' }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: '0.8rem' }}>{u.created_at}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Edit user"><IconButton size="small" onClick={() => openEdit(u)} aria-label={`Edit user ${u.username}`} sx={{ color: '#3B82F6', '&:hover': { background: 'rgba(59,130,246,0.1)' } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Hapus user"><IconButton size="small" onClick={() => setDeleteId(u.id)} aria-label={`Hapus user ${u.username}`} sx={{ color: '#EF4444', '&:hover': { background: 'rgba(239,68,68,0.1)' } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="user-modal-title">
          <DialogTitle id="user-modal-title" sx={{ fontWeight: 700, color: '#F1F5F9' }}>{editTarget ? 'Edit User' : 'Buat User Baru'}</DialogTitle>
          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Form user">
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                error={!!formErrors.username}
                helperText={formErrors.username}
                fullWidth required autoFocus
                disabled={!!editTarget}
                inputProps={{ 'aria-required': true }}
              />
              <FormControl fullWidth error={!!formErrors.role} required>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select labelId="role-select-label" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} label="Role">
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </Select>
              </FormControl>
              <Box>
                <TextField
                  label="Key Akses (8 karakter)"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase().slice(0, 8) })}
                  error={!!formErrors.key}
                  helperText={formErrors.key}
                  fullWidth required
                  inputProps={{ maxLength: 8, style: { fontFamily: 'monospace', letterSpacing: '0.2em', fontWeight: 700 }, 'aria-required': true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate key acak">
                          <IconButton onClick={() => setForm({ ...form, key: generateKey() })} edge="end" aria-label="Generate key acak">
                            <ShuffleIcon sx={{ color: '#AA2B1D' }} />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" sx={{ color: '#475569', mt: 0.5, display: 'block' }}>
                  {form.key.length}/8 karakter · Klik 🔀 untuk generate otomatis
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button onClick={closeModal} sx={{ color: '#64748B' }} disabled={submitting}>Batal</Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ background: 'linear-gradient(135deg,#AA2B1D,#E84545)' }}>
                {submitting ? 'Menyimpan...' : editTarget ? 'Perbarui' : 'Buat User'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* Delete dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { background: '#111827', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-xl)' } }} aria-labelledby="del-user-title">
          <DialogTitle id="del-user-title" sx={{ color: '#EF4444', fontWeight: 700 }}>Hapus User?</DialogTitle>
          <DialogContent><Typography sx={{ color: '#94A3B8' }}>User ini akan dihapus secara permanen.</Typography></DialogContent>
          <DialogActions sx={{ pb: 2, px: 2 }}>
            <Button onClick={() => setDeleteId(null)} sx={{ color: '#64748B' }}>Batal</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>Hapus</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
}

// [Commit 9/15] Prefix unik untuk generate token key akses otomatis per role akun
export const ROLE_KEY_PREFIX = { Admin: 'ADM', Driver: 'DRV', Mekanik: 'MEK' };

// [Commit 10/15] Fungsi pembantu pembuat string acak alfanumerik untuk token key akses
export const generateRandomToken = (len = 5) => Math.random().toString(36).substring(2, 2 + len).toUpperCase();

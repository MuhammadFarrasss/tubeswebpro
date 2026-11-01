import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { billService } from '../../services/api';
import { LoadingSkeleton, ErrorState, EmptyState } from '../../components/StateComponents';
import {
  Box, Typography, Card, CardContent, Grid, Divider, Chip,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function AdminLaporanBiaya() {
  const [bills, setBills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const res = await billService.getAll();
      setBills(res.data);
    } catch { setError('Gagal memuat laporan biaya'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const total = bills.reduce((s, b) => s + (b.nominal || 0), 0);

  return (
    <AppLayout>
      <Box component="section" className="content-area" aria-label="Laporan Biaya">
        <Box mb={4}>
          <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: '#F1F5F9', mb: 0.5 }}>
            Laporan Biaya
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Rekapitulasi biaya perbaikan kendaraan
          </Typography>
        </Box>

        {/* Summary card */}
        {!loading && !error && (
          <Card sx={{ background: 'linear-gradient(135deg, rgba(170,43,29,0.15), rgba(232,69,69,0.1))', border: '1px solid rgba(170,43,29,0.25)', borderRadius: 'var(--radius-lg)', mb: 4 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: 'linear-gradient(135deg,#AA2B1D,#E84545)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }} aria-hidden="true">
                <AttachMoneyIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Biaya Perbaikan</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#F1F5F9' }}>{fmt(total)}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>{bills.length} transaksi</Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {loading && <LoadingSkeleton rows={3} height={120} />}
        {error   && <ErrorState message={error} onRetry={fetchData} />}

        {!loading && !error && bills.length === 0 && <EmptyState message="Belum ada laporan biaya" icon="🧾" />}

        {!loading && !error && (
          <Box display="flex" flexDirection="column" gap={3} component="ul" aria-label="Daftar laporan biaya" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {bills.map((bill) => (
              <Card
                component="li"
                key={bill.id}
                className="card-hover animate-fadeInUp"
                sx={{ background: 'var(--color-bg-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} sm={8}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E', flexShrink: 0 }} aria-hidden="true">
                          <ReceiptIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#F1F5F9' }}>
                            {bill.kendaraan?.merek}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace', fontWeight: 600 }}>
                            {bill.kendaraan?.plat_nomor}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5, lineHeight: 1.6 }}>
                        {bill.deskripsi}
                      </Typography>

                      <Box display="flex" flexWrap="wrap" gap={2}>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Mekanik: <strong style={{ color: '#CBD5E1' }}>{bill.mekanik?.username}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569' }}>
                          {new Date(bill.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: { sm: 'right' } }}>
                        <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.5 }}>
                          Total Biaya
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#22C55E' }}>
                          {fmt(bill.nominal)}
                        </Typography>
                        <Chip label="Lunas" color="success" size="small" sx={{ mt: 1, fontWeight: 700 }} />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </AppLayout>
  );
}

// [Commit 9/15] Header judul dan subjudul modul laporan pengeluaran bengkel
export const LAPORAN_HEADER = { title: 'Laporan Biaya Perbaikan', subtitle: 'Rekapitulasi total pengeluaran servis armada' };

// [Commit 10/15] Helper format rupiah presisi tanpa digit desimal (akuntansi IDR)
export const formatCurrencyIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

// Mock data for Sagara Daily Checkup
// Sesuai spesifikasi: data harus di-fetch, bukan langsung di-render

export const mockUsers = [
  { id: 1, username: 'admin_sagara', role: 'Admin', key: 'ADM12345', gambar: null, created_at: '2025-01-10' },
  { id: 2, username: 'budi_driver', role: 'Driver', key: 'DRV98765', gambar: null, created_at: '2025-01-12' },
  { id: 3, username: 'andi_driver', role: 'Driver', key: 'DRV11111', gambar: null, created_at: '2025-01-15' },
  { id: 4, username: 'rizki_mekanik', role: 'Mekanik', key: 'MEK22222', gambar: null, created_at: '2025-01-18' },
  { id: 5, username: 'sani_mekanik', role: 'Mekanik', key: 'MEK33333', gambar: null, created_at: '2025-02-01' },
  { id: 6, username: 'deni_driver', role: 'Driver', key: 'DRV44444', gambar: null, created_at: '2025-02-05' },
];

export const mockKendaraans = [
  { id: 1, merek: 'Toyota Avanza', plat_nomor: 'B 1234 XYZ', status: 'Normal', driver_id: 2, driver: { username: 'budi_driver' }, gambar: null, created_at: '2025-01-20' },
  { id: 2, merek: 'Honda HRV', plat_nomor: 'D 5678 ABC', status: 'Perbaikan', driver_id: 3, driver: { username: 'andi_driver' }, gambar: null, created_at: '2025-01-22' },
  { id: 3, merek: 'Mitsubishi Pajero', plat_nomor: 'B 9012 DEF', status: 'Normal', driver_id: 6, driver: { username: 'deni_driver' }, gambar: null, created_at: '2025-01-25' },
  { id: 4, merek: 'Isuzu Panther', plat_nomor: 'F 3456 GHI', status: 'Normal', driver_id: null, driver: null, gambar: null, created_at: '2025-02-01' },
];

export const mockKerusakans = [
  {
    id: 1,
    kendaraan_id: 1,
    kendaraan: { merek: 'Toyota Avanza', plat_nomor: 'B 1234 XYZ' },
    driver: { username: 'budi_driver' },
    mekanik_id: 4,
    mekanik: { username: 'rizki_mekanik' },
    status: 'Perbaikan',
    is_accept: true,
    catatan: 'Mesin overheat, perlu penggantian thermostat dan radiator flush',
    kendala: [
      { name: 'Overheating', description: 'Suhu mesin melebihi normal' },
      { name: 'Radiator bocor', description: 'Terdapat kebocoran kecil di selang radiator' },
    ],
    gambar: null,
    created_at: '2025-10-15T08:30:00Z',
  },
  {
    id: 2,
    kendaraan_id: 2,
    kendaraan: { merek: 'Honda HRV', plat_nomor: 'D 5678 ABC' },
    driver: { username: 'andi_driver' },
    mekanik_id: null,
    mekanik: null,
    status: 'Pending',
    is_accept: false,
    catatan: 'Ban kempes dan lampu sein kanan mati',
    kendala: [
      { name: 'Ban kempes', description: 'Ban belakang kiri bocor' },
      { name: 'Lampu sein mati', description: 'Lampu sein kanan depan tidak berfungsi' },
    ],
    gambar: null,
    created_at: '2025-10-28T09:15:00Z',
  },
  {
    id: 3,
    kendaraan_id: 3,
    kendaraan: { merek: 'Mitsubishi Pajero', plat_nomor: 'B 9012 DEF' },
    driver: { username: 'deni_driver' },
    mekanik_id: 5,
    mekanik: { username: 'sani_mekanik' },
    status: 'Normal',
    is_accept: true,
    catatan: 'AC tidak dingin',
    kendala: [
      { name: 'AC rusak', description: 'Kompresor AC bermasalah' },
    ],
    gambar: null,
    created_at: '2025-10-20T14:00:00Z',
  },
];

export const mockBillPerbaikan = [
  {
    id: 1,
    kerusakan_id: 1,
    kendaraan: { merek: 'Toyota Avanza', plat_nomor: 'B 1234 XYZ' },
    mekanik: { username: 'rizki_mekanik' },
    nominal: 2500000,
    deskripsi: 'Penggantian thermostat + radiator flush + jasa servis',
    gambar: null,
    created_at: '2025-10-18T10:00:00Z',
  },
  {
    id: 2,
    kerusakan_id: 3,
    kendaraan: { merek: 'Mitsubishi Pajero', plat_nomor: 'B 9012 DEF' },
    mekanik: { username: 'sani_mekanik' },
    nominal: 1800000,
    deskripsi: 'Service kompresor AC + pengisian freon',
    gambar: null,
    created_at: '2025-10-22T11:30:00Z',
  },
];

export const mockStruKBensin = [
  {
    id: 1,
    driver: { username: 'budi_driver' },
    kendaraan: { merek: 'Toyota Avanza', plat_nomor: 'B 1234 XYZ' },
    nominal: 300000,
    status: 'Pending',
    gambar: null,
    created_at: '2025-10-30T07:45:00Z',
  },
  {
    id: 2,
    driver: { username: 'deni_driver' },
    kendaraan: { merek: 'Mitsubishi Pajero', plat_nomor: 'B 9012 DEF' },
    nominal: 450000,
    status: 'Diterima',
    gambar: null,
    created_at: '2025-10-29T08:00:00Z',
  },
];

export const mockTowings = [
  {
    id: 1,
    driver: { username: 'andi_driver' },
    kendaraan: { merek: 'Honda HRV', plat_nomor: 'D 5678 ABC' },
    lokasi: 'Jl. Sudirman No. 45, Jakarta Pusat',
    status: 'Pending',
    catatan: 'Kendaraan mogok tidak bisa distarter',
    created_at: '2025-10-28T10:00:00Z',
  },
];

export const mockDashboardStats = {
  total_kendaraan: 4,
  total_driver: 3,
  total_mekanik: 2,
  kendaraan_normal: 3,
  kendaraan_perbaikan: 1,
  pending_kerusakan: 1,
  total_bill: 4300000,
};

export const mockChartData = [
  { bulan: 'Jul', pengajuan: 2, selesai: 1 },
  { bulan: 'Agu', pengajuan: 3, selesai: 3 },
  { bulan: 'Sep', pengajuan: 1, selesai: 1 },
  { bulan: 'Okt', pengajuan: 4, selesai: 2 },
  { bulan: 'Nov', pengajuan: 2, selesai: 0 },
];

export const mockRecentActivities = [
  { id: 1, type: 'kerusakan', message: 'andi_driver mengajukan perbaikan Honda HRV', time: '2 jam lalu', icon: 'warning' },
  { id: 2, type: 'bill', message: 'rizki_mekanik submit bill Rp 2.500.000', time: '1 hari lalu', icon: 'receipt' },
  { id: 3, type: 'bensin', message: 'budi_driver upload struk bensin', time: '1 hari lalu', icon: 'local_gas_station' },
  { id: 4, type: 'kendaraan', message: 'Kendaraan Pajero selesai perbaikan', time: '3 hari lalu', icon: 'directions_car' },
];

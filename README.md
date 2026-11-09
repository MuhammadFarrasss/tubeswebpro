# 🚗 Sagara Daily Checkup

Sistem manajemen kendaraan harian berbasis web untuk pengelolaan operasional kendaraan, driver, dan mekanik.

> **Tugas Besar UTS – Web Programming | Kelompok Sagara**

---

## 📸 Screenshots

| Halaman | Deskripsi |
|---------|-----------|
| Landing Page | Pilih role login (Admin / Driver / Mekanik) |
| Login | Autentikasi per role dengan validasi form |
| Admin Dashboard | Statistik sistem, chart perbaikan, aktivitas terbaru |
| Admin Kendaraan | CRUD data kendaraan + pencarian |
| Admin Generate Key | Manajemen user & key akses |
| Admin Pengajuan Perbaikan | Approve/assign mekanik ke pengajuan |
| Admin Laporan Biaya | Rekap bill perbaikan |
| Driver Dashboard | Status kendaraan & menu cepat |
| Driver Laporan Kerusakan | Buat & lihat laporan kerusakan |
| Driver Struk Bensin | Upload & manage struk BBM |
| Driver Request Towing | Ajukan permintaan derek |
| Mekanik Dashboard | Daftar pekerjaan perbaikan |
| Mekanik Detail Kerusakan | Detail + submit bill perbaikan |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | React 19 + Vite |
| **Routing** | React Router DOM v7 |
| **UI Library** | Material UI (MUI) v9 |
| **HTTP Client** | Axios (Dummy API) + Mock data |
| **Charts** | Recharts |
| **Notifications** | React Toastify |
| **Styling** | MUI + Custom CSS (Flexbox, Grid, Media Queries) |
| **State** | React Context API + useState/useEffect |
| **Linter** | Oxlint |

---

## 📁 Struktur Folder

```
src/
├── components/
│   ├── AppLayout.jsx       # Sidebar + AppBar layout (responsive)
│   ├── ProtectedRoute.jsx  # Route guard berdasarkan role
│   └── StateComponents.jsx # LoadingSkeleton, ErrorState, EmptyState
├── contexts/
│   └── AuthContext.jsx     # Global auth state (Context API)
├── data/
│   └── mockData.js         # Mock data (di-fetch via service layer)
├── pages/
│   ├── Landing.jsx         # Role selection page
│   ├── LoginPage.jsx       # Login form (dengan validasi)
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminKendaraan.jsx
│   │   ├── AdminGenerateKey.jsx
│   │   ├── AdminPengajuanPerbaikan.jsx
│   │   └── AdminLaporanBiaya.jsx
│   ├── driver/
│   │   ├── DriverDashboard.jsx
│   │   ├── DriverReport.jsx
│   │   ├── DriverBensin.jsx
│   │   └── DriverTowing.jsx
│   └── mekanik/
│       ├── MekanikDashboard.jsx
│       └── MekanikDetailKerusakan.jsx
├── services/
│   └── api.js              # Service layer (semua data di-fetch)
├── App.jsx                 # Routes + ProtectedRoute setup
├── main.jsx                # Entry point + MUI Theme + ToastContainer
└── index.css               # Global CSS, design tokens, animasi
```

---

## 🚀 Setup & Menjalankan Proyek

### Prerequisites
- Node.js >= 18
- npm >= 9

### Instalasi

```bash
# Clone repository
git clone https://github.com/[your-org]/sagara-fe.git
cd sagara-fe

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Di terminal terpisah, jalankan API dummy
npm run api
```

Aplikasi akan berjalan di: **http://localhost:5173**
Dummy API akun berjalan di **http://localhost:3001/api/users**, kendaraan di **http://localhost:3001/api/kendaraans**, laporan kerusakan di **http://localhost:3001/api/kerusakan**, bill perbaikan di **http://localhost:3001/api/bills**, struk bensin di **http://localhost:3001/api/bensin**, dan towing di **http://localhost:3001/api/towing**. Data disimpan di `db.json`.

Router HTTP ada di `api-server.js`; handler endpoint dipisah ke `api/vehicles.js`, `api/fuel.js`, dan `api/towing.js`. Helper database dan HTTP ada di `api/database.js` serta `api/http.js`.
Endpoint struk bensin: `GET /api/bensin?driver_id=<id>`, `POST /api/bensin`, dan `PATCH /api/bensin/<id>/cancel?driver_id=<id>`. Foto struk menerima JPEG, PNG, atau WebP hingga 1 MB.
Endpoint towing: `GET /api/towing?driver_id=<id>`, `POST /api/towing`, dan `PATCH /api/towing/<id>/cancel?driver_id=<id>`. Lokasi harus 10–300 karakter dan catatan maksimal 250 karakter.
Workflow perbaikan: `GET /api/kerusakan` (opsional `driver_id`, `mekanik_id`, `status`), `POST /api/kerusakan`, `PATCH /api/kerusakan/<id>/approve`, dan `PATCH /api/kerusakan/<id>/complete?mekanik_id=<id>`. Laporan Pending dapat dibatalkan dengan `PATCH /api/kerusakan/<id>/cancel?driver_id=<id>`. Bill menggunakan `GET /api/bills` dan `POST /api/bills`.
Manajemen akun menggunakan `GET /api/users` (opsional `search` dan `role`), `POST /api/users`, `PUT /api/users/<id>`, dan `DELETE /api/users/<id>`. Username harus unik (3–32 karakter), role harus Admin/Driver/Mekanik, dan key harus unik dengan 8 karakter alfanumerik. User yang masih terhubung dengan data operasional tidak dapat dihapus atau berpindah role.

Untuk konfigurasi lain, salin `.env.example` ke `.env` lalu ubah `VITE_API_BASE_URL` atau `VITE_API_TARGET` sesuai kebutuhan.

### Build Production

```bash
npm run build
npm run preview
```

---

## 🔑 Akun Demo

| Role | Username | Key |
|------|----------|-----|
| Admin | `admin_sagara` | `ADM12345` |
| Driver | `budi_driver` | `DRV98765` |
| Driver | `andi_driver` | `DRV11111` |
| Mekanik | `rizki_mekanik` | `MEK22222` |
| Mekanik | `sani_mekanik` | `MEK33333` |

---

## ✅ Fitur & Spesifikasi

### Halaman (13 halaman terkoneksi)
- ✅ Landing page dengan role selector
- ✅ Login page per role (Admin, Driver, Mekanik)
- ✅ 5 halaman Admin (Dashboard, Kendaraan, Generate Key, Pengajuan Perbaikan, Laporan Biaya)
- ✅ 4 halaman Driver (Dashboard, Laporan Kerusakan, Struk Bensin, Towing)
- ✅ 2 halaman Mekanik (Dashboard, Detail Kerusakan)

### Technical Requirements
- ✅ React 19 + Vite (modern JS framework)
- ✅ React Router DOM v7 (navigasi antar halaman)
- ✅ Axios + Mock Fetch (semua data di-fetch, tidak hardcoded langsung di render)
- ✅ Material UI v9 (modern CSS component library)
- ✅ Custom CSS: Flexbox, Grid, Media Queries, CSS Variables
- ✅ Responsive Design (mobile-first, breakpoints xs/sm/md/lg)
- ✅ Semantic HTML5 (section, main, nav, article, ul/li, form, label)
- ✅ Accessibility: aria-label, aria-current, aria-live, role="alert", keyboard navigation
- ✅ Form validation client-side (login, tambah kendaraan, dll.)
- ✅ Loading state (Skeleton, Spinner)
- ✅ Error state (ErrorState component + try-catch di semua fetch)
- ✅ Empty state (EmptyState component)
- ✅ Protected routes berdasarkan role
- ✅ Toast notifications (react-toastify)
- ✅ Context API untuk global auth state
- ✅ Recharts untuk visualisasi data

---

## 👥 Kontribusi Tim

| Anggota | Branch | Tanggung Jawab |
|---------|--------|----------------|
| Reza | `feature/reza` | Landing Page + Login Page + Auth System |
| Nadya | `feature/nadya` | Admin Dashboard + Chart + Recent Activities |
| Bintang | `feature/bintang` | Admin Kendaraan + Admin Generate Key |
| Delvin | `feature/delvin` | Admin Pengajuan Perbaikan + Admin Laporan Biaya |
| Duhan | `feature/duhan` | Driver Dashboard + Driver Laporan Kerusakan |
| Farras | `feature/farras` | Driver Struk Bensin + Driver Towing + Mekanik Dashboard + Mekanik Detail Kerusakan |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik — Tugas Besar UTS Web Programming.

© 2025 Kelompok Sagara

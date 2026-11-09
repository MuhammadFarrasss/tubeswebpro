import { respond } from './http.js';

export const dashboardRoute = /^\/api\/dashboard$/;

const MONTH_LABELS = new Intl.DateTimeFormat('id-ID', { month: 'short' });
const ACTIVITY_DATE = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildStats(database) {
  return {
    total_kendaraan: database.kendaraans.length,
    total_driver: database.users.filter((user) => user.role === 'Driver').length,
    total_mekanik: database.users.filter((user) => user.role === 'Mekanik').length,
    kendaraan_normal: database.kendaraans.filter((vehicle) => vehicle.status === 'Normal').length,
    kendaraan_perbaikan: database.kendaraans.filter((vehicle) => vehicle.status === 'Perbaikan').length,
    pending_kerusakan: database.kerusakans.filter((report) => report.status === 'Pending').length,
    total_bill: database.bills.reduce((total, bill) => total + (Number(bill.nominal) || 0), 0),
  };
}

function buildChartData(database, now) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: monthKey(date),
      bulan: MONTH_LABELS.format(date),
      pengajuan: 0,
      selesai: 0,
    };
  });
  const monthByKey = new Map(months.map((month) => [month.key, month]));

  database.kerusakans.forEach((report) => {
    const date = new Date(report.created_at);
    if (Number.isNaN(date.getTime())) return;
    const month = monthByKey.get(monthKey(date));
    if (!month) return;
    month.pengajuan += 1;
    if (report.status === 'Normal') month.selesai += 1;
  });

  return months.map(({ bulan, pengajuan, selesai }) => ({ bulan, pengajuan, selesai }));
}

function buildActivities(database) {
  const usersById = new Map(database.users.map((user) => [user.id, user]));
  const vehiclesById = new Map(database.kendaraans.map((vehicle) => [vehicle.id, vehicle]));
  const activities = [
    ...database.kerusakans.map((report) => ({
      id: `kerusakan-${report.id}`,
      type: 'kerusakan',
      message: `${usersById.get(report.driver_id)?.username || 'Driver'} mengajukan perbaikan ${vehiclesById.get(report.kendaraan_id)?.merek || 'kendaraan'}`,
      created_at: report.created_at,
    })),
    ...database.bills.map((bill) => ({
      id: `bill-${bill.id}`,
      type: 'bill',
      message: `${usersById.get(bill.mekanik_id)?.username || 'Mekanik'} submit bill ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bill.nominal)}`,
      created_at: bill.created_at,
    })),
    ...database.bensin.map((receipt) => ({
      id: `bensin-${receipt.id}`,
      type: 'bensin',
      message: `${usersById.get(receipt.driver_id)?.username || 'Driver'} upload struk bensin`,
      created_at: receipt.created_at,
    })),
    ...database.towing.map((request) => ({
      id: `towing-${request.id}`,
      type: 'towing',
      message: `${usersById.get(request.driver_id)?.username || 'Driver'} mengajukan towing`,
      created_at: request.created_at,
    })),
  ];

  return activities
    .filter((activity) => !Number.isNaN(new Date(activity.created_at).getTime()))
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 5)
    .map((activity) => ({
      id: activity.id,
      type: activity.type,
      message: activity.message,
      time: ACTIVITY_DATE.format(new Date(activity.created_at)),
    }));
}

export function handleDashboardRequest(request, response, _url, database) {
  if (request.method !== 'GET') {
    respond(response, 405, { message: 'Method tidak diizinkan' });
    return;
  }

  const now = new Date();
  respond(response, 200, {
    stats: buildStats(database),
    chartData: buildChartData(database, now),
    activities: buildActivities(database),
  });
}

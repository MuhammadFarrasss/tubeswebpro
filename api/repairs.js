import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';

export const repairRoute = /^\/api\/kerusakan(?:\/(\d+)(?:\/(approve|complete|cancel))?)?$/;

function withRelations(database, report) {
  return {
    ...report,
    driver: database.users.find((user) => user.id === report.driver_id) || null,
    mekanik: database.users.find((user) => user.id === report.mekanik_id) || null,
    kendaraan: database.kendaraans.find((vehicle) => vehicle.id === report.kendaraan_id) || null,
  };
}

export async function handleRepairRequest(request, response, url, database, match) {
  const [, id, action] = match;

  if (request.method === 'GET' && !id) {
    const driverIdParam = url.searchParams.get('driver_id');
    const mechanicIdParam = url.searchParams.get('mekanik_id');
    const driverId = driverIdParam === null ? null : Number(driverIdParam);
    const mechanicId = mechanicIdParam === null ? null : Number(mechanicIdParam);
    const status = url.searchParams.get('status');
    let reports = database.kerusakans;

    if ((driverIdParam !== null && !Number.isInteger(driverId))
      || (mechanicIdParam !== null && !Number.isInteger(mechanicId))) {
      respond(response, 400, { message: 'ID driver atau mekanik tidak valid' });
      return;
    }

    if (driverId !== null) reports = reports.filter((report) => report.driver_id === driverId);
    if (mechanicId !== null) reports = reports.filter((report) => report.mekanik_id === mechanicId);
    if (status) reports = reports.filter((report) => report.status === status);

    respond(response, 200, reports.map((report) => withRelations(database, report)));
    return;
  }

  if (request.method === 'POST' && !id) {
    const payload = await readObjectBody(request);
    const driverId = Number(payload.driver_id);
    const vehicleId = Number(payload.kendaraan_id);
    const catatan = typeof payload.catatan === 'string' ? payload.catatan.trim() : '';
    const kendala = payload.kendala;
    const driver = database.users.find((user) => user.id === driverId && user.role === 'Driver');
    const vehicle = database.kendaraans.find((item) => item.id === vehicleId && item.driver_id === driverId);

    if (!driver) {
      respond(response, 400, { message: 'Driver tidak ditemukan' });
      return;
    }
    if (!vehicle) {
      respond(response, 400, { message: 'Kendaraan tidak ditemukan atau bukan milik driver ini' });
      return;
    }
    if (!catatan || catatan.length > 1000) {
      respond(response, 400, { message: 'Catatan wajib diisi dan maksimal 1000 karakter' });
      return;
    }
    if (!Array.isArray(kendala) || kendala.length === 0
      || kendala.some((item) => !item || typeof item.name !== 'string' || !item.name.trim())) {
      respond(response, 400, { message: 'Tambahkan minimal satu kendala dengan nama yang valid' });
      return;
    }

    const report = {
      id: Math.max(0, ...database.kerusakans.map((item) => item.id)) + 1,
      driver_id: driverId,
      kendaraan_id: vehicleId,
      mekanik_id: null,
      status: 'Pending',
      is_accept: false,
      catatan,
      kendala: kendala.map((item) => ({
        name: item.name.trim(),
        description: typeof item.description === 'string' ? item.description.trim() : '',
      })),
      gambar: null,
      created_at: new Date().toISOString(),
    };
    database.kerusakans.push(report);
    await writeDatabase(database);
    respond(response, 201, withRelations(database, report));
    return;
  }

  const report = database.kerusakans.find((item) => item.id === Number(id));
  if (!report) {
    respond(response, 404, { message: 'Laporan kerusakan tidak ditemukan' });
    return;
  }

  if (request.method === 'PATCH' && action === 'cancel') {
    const driverIdParam = url.searchParams.get('driver_id');
    const driverId = Number(driverIdParam);
    if (driverIdParam === null || !Number.isInteger(driverId) || report.driver_id !== driverId) {
      respond(response, 403, { message: 'Tidak dapat membatalkan laporan milik driver lain' });
      return;
    }
    if (report.status !== 'Pending') {
      respond(response, 409, { message: 'Hanya laporan berstatus Pending yang dapat dibatalkan' });
      return;
    }
    report.status = 'Cancelled';
    await writeDatabase(database);
    respond(response, 200, withRelations(database, report));
    return;
  }

  if (request.method === 'PATCH' && action === 'approve') {
    const payload = await readObjectBody(request);
    const mechanicId = Number(payload.mekanik_id);
    const mechanic = database.users.find((user) => user.id === mechanicId && user.role === 'Mekanik');
    if (report.status !== 'Pending') {
      respond(response, 409, { message: 'Hanya laporan Pending yang dapat ditugaskan' });
      return;
    }
    if (!mechanic) {
      respond(response, 400, { message: 'Mekanik tidak ditemukan' });
      return;
    }

    report.mekanik_id = mechanicId;
    report.status = 'Perbaikan';
    report.is_accept = true;
    const vehicle = database.kendaraans.find((item) => item.id === report.kendaraan_id);
    if (vehicle) vehicle.status = 'Perbaikan';
    await writeDatabase(database);
    respond(response, 200, withRelations(database, report));
    return;
  }

  if (request.method === 'PATCH' && action === 'complete') {
    const mechanicIdParam = url.searchParams.get('mekanik_id');
    const mechanicId = Number(mechanicIdParam);
    if (mechanicIdParam === null || !Number.isInteger(mechanicId) || report.mekanik_id !== mechanicId) {
      respond(response, 403, { message: 'Laporan ini bukan tugas mekanik tersebut' });
      return;
    }
    if (report.status !== 'Perbaikan') {
      respond(response, 409, { message: 'Hanya laporan berstatus Perbaikan yang dapat diselesaikan' });
      return;
    }

    report.status = 'Normal';
    const vehicle = database.kendaraans.find((item) => item.id === report.kendaraan_id);
    if (vehicle) vehicle.status = 'Normal';
    await writeDatabase(database);
    respond(response, 200, withRelations(database, report));
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

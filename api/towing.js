import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';
import { addDriverAndVehicle } from './relations.js';

export const towingRoute = /^\/api\/towing(?:\/(\d+))?(?:\/(cancel))?$/;

export async function handleTowingRequest(request, response, url, database, match) {
  const [, id, action] = match;

  if (request.method === 'GET' && !id && !action) {
    const driverIdParam = url.searchParams.get('driver_id');
    const driverId = Number(driverIdParam);
    if (driverIdParam === null || !Number.isInteger(driverId)) {
      respond(response, 400, { message: 'driver_id wajib diisi' });
      return;
    }

    respond(response, 200, database.towing
      .filter((item) => item.driver_id === driverId)
      .map((item) => addDriverAndVehicle(database, item)));
    return;
  }

  if (request.method === 'POST' && !id && !action) {
    const payload = await readObjectBody(request);
    const driverId = Number(payload.driver_id);
    const vehicleId = Number(payload.kendaraan_id);
    const lokasi = typeof payload.lokasi === 'string' ? payload.lokasi.trim() : '';
    const catatan = typeof payload.catatan === 'string' ? payload.catatan.trim() : '';
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
    if (lokasi.length < 10 || lokasi.length > 300) {
      respond(response, 400, { message: 'Lokasi harus terdiri dari 10 sampai 300 karakter' });
      return;
    }
    if (catatan.length > 250) {
      respond(response, 400, { message: 'Catatan maksimal 250 karakter' });
      return;
    }

    const towing = {
      id: Math.max(0, ...database.towing.map((item) => item.id)) + 1,
      driver_id: driverId,
      kendaraan_id: vehicleId,
      lokasi,
      catatan,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    database.towing.push(towing);
    await writeDatabase(database);
    respond(response, 201, addDriverAndVehicle(database, towing));
    return;
  }

  const towing = database.towing.find((item) => item.id === Number(id));
  if (!towing) {
    respond(response, 404, { message: 'Request towing tidak ditemukan' });
    return;
  }

  if (request.method === 'PATCH' && action === 'cancel') {
    const driverId = Number(url.searchParams.get('driver_id'));
    if (!Number.isInteger(driverId) || towing.driver_id !== driverId) {
      respond(response, 403, { message: 'Tidak dapat membatalkan request towing milik driver lain' });
      return;
    }
    if (towing.status !== 'Pending') {
      respond(response, 409, { message: 'Hanya request berstatus Pending yang dapat dibatalkan' });
      return;
    }

    towing.status = 'Cancelled';
    await writeDatabase(database);
    respond(response, 200, addDriverAndVehicle(database, towing));
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

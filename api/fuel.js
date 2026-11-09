import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';
import { addDriverAndVehicle } from './relations.js';

export const fuelRoute = /^\/api\/bensin(?:\/(\d+))?(?:\/(cancel))?$/;

export async function handleFuelRequest(request, response, url, database, match) {
  const [, id, action] = match;

  if (request.method === 'GET' && !id && !action) {
    const driverIdParam = url.searchParams.get('driver_id');
    const driverId = Number(driverIdParam);
    if (driverIdParam === null || !Number.isInteger(driverId)) {
      respond(response, 400, { message: 'driver_id wajib diisi' });
      return;
    }

    respond(response, 200, database.bensin
      .filter((receipt) => receipt.driver_id === driverId)
      .map((receipt) => addDriverAndVehicle(database, receipt)));
    return;
  }

  if (request.method === 'POST' && !id && !action) {
    const payload = await readObjectBody(request);
    const driverId = Number(payload.driver_id);
    const vehicleId = Number(payload.kendaraan_id);
    const nominal = Number(payload.nominal);
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
    if (!Number.isFinite(nominal) || nominal < 10000 || nominal > 5000000) {
      respond(response, 400, { message: 'Nominal harus antara Rp 10.000 dan Rp 5.000.000' });
      return;
    }
    if (payload.gambar != null
      && (typeof payload.gambar !== 'string'
        || payload.gambar.length > 1400000
        || !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(payload.gambar))) {
      respond(response, 400, { message: 'Foto struk harus berupa gambar JPEG, PNG, atau WebP' });
      return;
    }

    const receipt = {
      id: Math.max(0, ...database.bensin.map((item) => item.id)) + 1,
      driver_id: driverId,
      kendaraan_id: vehicleId,
      nominal,
      gambar: payload.gambar || null,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    database.bensin.push(receipt);
    await writeDatabase(database);
    respond(response, 201, addDriverAndVehicle(database, receipt));
    return;
  }

  const receipt = database.bensin.find((item) => item.id === Number(id));
  if (!receipt) {
    respond(response, 404, { message: 'Struk bensin tidak ditemukan' });
    return;
  }

  if (request.method === 'PATCH' && action === 'cancel') {
    const driverId = Number(url.searchParams.get('driver_id'));
    if (!Number.isInteger(driverId) || receipt.driver_id !== driverId) {
      respond(response, 403, { message: 'Tidak dapat membatalkan struk milik driver lain' });
      return;
    }
    if (receipt.status !== 'Pending') {
      respond(response, 409, { message: 'Hanya struk berstatus Pending yang dapat dibatalkan' });
      return;
    }

    receipt.status = 'Cancelled';
    await writeDatabase(database);
    respond(response, 200, addDriverAndVehicle(database, receipt));
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

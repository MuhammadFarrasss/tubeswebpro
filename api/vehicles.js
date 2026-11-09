import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';

export const vehicleRoute = /^\/api\/kendaraans(?:\/(\d+))?$/;

function findDriver(database, driverId) {
  return database.users.find((user) => user.id === driverId && user.role === 'Driver');
}

function withDriver(database, vehicle) {
  return {
    ...vehicle,
    driver: findDriver(database, vehicle.driver_id) || null,
  };
}

function validateVehicle(payload, database) {
  if (typeof payload.merek !== 'string' || !payload.merek.trim()
    || typeof payload.plat_nomor !== 'string' || !payload.plat_nomor.trim()) {
    return { error: 'Merek dan plat nomor wajib diisi' };
  }

  const driverId = payload.driver_id ? Number(payload.driver_id) : null;
  if (driverId !== null && !findDriver(database, driverId)) {
    return { error: 'Driver tidak ditemukan' };
  }

  return { values: {
    merek: payload.merek.trim(),
    plat_nomor: payload.plat_nomor.trim(),
    driver_id: driverId,
  } };
}

export async function handleVehicleRequest(request, response, url, database, match) {
  const [, id] = match;

  if (request.method === 'GET' && !id) {
    const query = (url.searchParams.get('search') || '').toLocaleLowerCase();
    const vehicles = database.kendaraans
      .filter((vehicle) => (
        vehicle.merek.toLocaleLowerCase().includes(query)
        || vehicle.plat_nomor.toLocaleLowerCase().includes(query)
      ))
      .map((vehicle) => withDriver(database, vehicle));
    respond(response, 200, vehicles);
    return;
  }

  if (request.method === 'POST' && !id) {
    const payload = await readObjectBody(request);
    const result = validateVehicle(payload, database);
    if (result.error) {
      respond(response, 400, { message: result.error });
      return;
    }

    const vehicle = {
      id: Math.max(0, ...database.kendaraans.map((item) => item.id)) + 1,
      ...result.values,
      status: 'Normal',
      gambar: null,
      created_at: new Date().toISOString(),
    };
    database.kendaraans.push(vehicle);
    await writeDatabase(database);
    respond(response, 201, withDriver(database, vehicle));
    return;
  }

  const index = database.kendaraans.findIndex((vehicle) => vehicle.id === Number(id));
  if (index === -1) {
    respond(response, 404, { message: 'Kendaraan tidak ditemukan' });
    return;
  }

  if (request.method === 'PUT') {
    const payload = await readObjectBody(request);
    const result = validateVehicle(payload, database);
    if (result.error) {
      respond(response, 400, { message: result.error });
      return;
    }

    database.kendaraans[index] = { ...database.kendaraans[index], ...result.values };
    await writeDatabase(database);
    respond(response, 200, withDriver(database, database.kendaraans[index]));
    return;
  }

  if (request.method === 'DELETE') {
    database.kendaraans.splice(index, 1);
    await writeDatabase(database);
    respond(response, 200, { message: 'Kendaraan berhasil dihapus' });
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

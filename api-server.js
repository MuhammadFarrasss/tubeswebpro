import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dbPath = fileURLToPath(new URL('./db.json', import.meta.url));
const port = Number(process.env.API_PORT || 3001);

async function readDatabase() {
  return JSON.parse(await readFile(dbPath, 'utf8'));
}

async function writeDatabase(database) {
  await writeFile(dbPath, `${JSON.stringify(database, null, 2)}\n`);
}

function respond(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

async function readRequestBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1024 * 1024) {
      const error = new Error('Ukuran request terlalu besar');
      error.status = 413;
      throw error;
    }
  }
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('Body harus berupa JSON yang valid');
    error.status = 400;
    throw error;
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const route = url.pathname.match(/^\/api\/kendaraans(?:\/(\d+))?$/);
    if (!route) {
      respond(response, 404, { message: 'Endpoint tidak ditemukan' });
      return;
    }

    const [, id] = route;
    const database = await readDatabase();

    if (request.method === 'GET' && !id) {
      const query = (url.searchParams.get('search') || '').toLocaleLowerCase();
      const data = database.kendaraans
        .filter((vehicle) => (
          vehicle.merek.toLocaleLowerCase().includes(query)
          || vehicle.plat_nomor.toLocaleLowerCase().includes(query)
        ))
        .map((vehicle) => ({
          ...vehicle,
          driver: database.users.find((user) => user.id === vehicle.driver_id) || null,
        }));
      respond(response, 200, data);
      return;
    }

    if (request.method === 'POST' && !id) {
      const payload = await readRequestBody(request);
      if (typeof payload.merek !== 'string' || !payload.merek.trim()
        || typeof payload.plat_nomor !== 'string' || !payload.plat_nomor.trim()) {
        respond(response, 400, { message: 'Merek dan plat nomor wajib diisi' });
        return;
      }

      const driverId = payload.driver_id ? Number(payload.driver_id) : null;
      if (driverId !== null && !database.users.some((user) => user.id === driverId && user.role === 'Driver')) {
        respond(response, 400, { message: 'Driver tidak ditemukan' });
        return;
      }

      const vehicle = {
        id: Math.max(0, ...database.kendaraans.map((item) => item.id)) + 1,
        merek: payload.merek.trim(),
        plat_nomor: payload.plat_nomor.trim(),
        status: 'Normal',
        driver_id: driverId,
        gambar: null,
        created_at: new Date().toISOString(),
      };
      database.kendaraans.push(vehicle);
      await writeDatabase(database);
      respond(response, 201, {
        ...vehicle,
        driver: database.users.find((user) => user.id === vehicle.driver_id) || null,
      });
      return;
    }

    const index = database.kendaraans.findIndex((vehicle) => vehicle.id === Number(id));
    if (index === -1) {
      respond(response, 404, { message: 'Kendaraan tidak ditemukan' });
      return;
    }

    if (request.method === 'PUT') {
      const payload = await readRequestBody(request);
      if (typeof payload.merek !== 'string' || !payload.merek.trim()
        || typeof payload.plat_nomor !== 'string' || !payload.plat_nomor.trim()) {
        respond(response, 400, { message: 'Merek dan plat nomor wajib diisi' });
        return;
      }

      const driverId = payload.driver_id ? Number(payload.driver_id) : null;
      if (driverId !== null && !database.users.some((user) => user.id === driverId && user.role === 'Driver')) {
        respond(response, 400, { message: 'Driver tidak ditemukan' });
        return;
      }

      database.kendaraans[index] = {
        ...database.kendaraans[index],
        merek: payload.merek.trim(),
        plat_nomor: payload.plat_nomor.trim(),
        driver_id: driverId,
      };
      await writeDatabase(database);
      respond(response, 200, {
        ...database.kendaraans[index],
        driver: database.users.find((user) => user.id === driverId) || null,
      });
      return;
    }

    if (request.method === 'DELETE') {
      database.kendaraans.splice(index, 1);
      await writeDatabase(database);
      respond(response, 200, { message: 'Kendaraan berhasil dihapus' });
      return;
    }

    respond(response, 405, { message: 'Method tidak diizinkan' });
  } catch (error) {
    console.error('API error:', error);
    respond(response, error.status || 500, { message: error.status ? error.message : 'Terjadi kesalahan pada server API' });
  }
});

server.listen(port, () => {
  console.log(`Dummy API berjalan di http://localhost:${port}/api`);
});

import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';

export const userRoute = /^\/api\/users(?:\/(\d+))?$/;

const ROLES = ['Admin', 'Driver', 'Mekanik'];

function validateUser(payload, database, currentId = null) {
  const username = typeof payload.username === 'string' ? payload.username.trim() : '';
  const role = payload.role;
  const key = typeof payload.key === 'string' ? payload.key.trim().toUpperCase() : '';

  if (!/^[a-z0-9_]{3,32}$/i.test(username)) {
    return { error: 'Username harus 3–32 karakter dan hanya berisi huruf, angka, atau underscore' };
  }
  if (!ROLES.includes(role)) {
    return { error: 'Role harus Admin, Driver, atau Mekanik' };
  }
  if (!/^[A-Z0-9]{8}$/.test(key)) {
    return { error: 'Key harus terdiri dari 8 karakter alfanumerik' };
  }

  const duplicateUsername = database.users.some((user) => (
    user.id !== currentId && user.username.toLowerCase() === username.toLowerCase()
  ));
  if (duplicateUsername) return { error: 'Username sudah digunakan' };

  const duplicateKey = database.users.some((user) => user.id !== currentId && user.key === key);
  if (duplicateKey) return { error: 'Key sudah digunakan' };

  return { values: { username, role, key } };
}

function hasReferences(database, userId) {
  return database.kendaraans.some((vehicle) => vehicle.driver_id === userId)
    || database.bensin.some((receipt) => receipt.driver_id === userId)
    || database.towing.some((request) => request.driver_id === userId)
    || database.kerusakans.some((report) => (
      report.driver_id === userId || report.mekanik_id === userId
    ))
    || database.bills.some((bill) => bill.mekanik_id === userId);
}

export async function handleUserRequest(request, response, url, database, match) {
  const [, id] = match;

  if (request.method === 'GET' && !id) {
    const query = (url.searchParams.get('search') || '').toLocaleLowerCase();
    const role = url.searchParams.get('role');
    if (role && role !== 'all' && !ROLES.includes(role)) {
      respond(response, 400, { message: 'Role tidak valid' });
      return;
    }

    const users = database.users.filter((user) => (
      user.username.toLocaleLowerCase().includes(query)
      && (!role || role === 'all' || user.role === role)
    ));
    respond(response, 200, users);
    return;
  }

  if (request.method === 'POST' && !id) {
    const payload = await readObjectBody(request);
    const result = validateUser(payload, database);
    if (result.error) {
      respond(response, 400, { message: result.error });
      return;
    }

    const user = {
      id: Math.max(0, ...database.users.map((item) => item.id)) + 1,
      ...result.values,
      gambar: null,
      created_at: new Date().toISOString(),
    };
    database.users.push(user);
    await writeDatabase(database);
    respond(response, 201, user);
    return;
  }

  const index = database.users.findIndex((user) => user.id === Number(id));
  if (index === -1) {
    respond(response, 404, { message: 'User tidak ditemukan' });
    return;
  }

  if (request.method === 'PUT') {
    const payload = await readObjectBody(request);
    const result = validateUser(payload, database, database.users[index].id);
    if (result.error) {
      respond(response, 400, { message: result.error });
      return;
    }

    const currentUser = database.users[index];
    if (currentUser.role !== result.values.role && hasReferences(database, currentUser.id)) {
      respond(response, 409, { message: 'Role tidak dapat diubah karena user masih terhubung dengan data operasional' });
      return;
    }

    database.users[index] = { ...currentUser, ...result.values };
    await writeDatabase(database);
    respond(response, 200, database.users[index]);
    return;
  }

  if (request.method === 'DELETE') {
    const user = database.users[index];
    if (user.role === 'Admin' && database.users.filter((item) => item.role === 'Admin').length === 1) {
      respond(response, 409, { message: 'Admin terakhir tidak dapat dihapus' });
      return;
    }
    if (hasReferences(database, user.id)) {
      respond(response, 409, { message: 'User tidak dapat dihapus karena masih terhubung dengan data operasional' });
      return;
    }

    database.users.splice(index, 1);
    await writeDatabase(database);
    respond(response, 200, { message: 'User berhasil dihapus' });
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

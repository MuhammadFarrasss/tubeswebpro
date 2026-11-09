import { readObjectBody, respond } from './http.js';

export const authRoute = /^\/api\/auth\/login$/;

export async function handleAuthRequest(request, response, _url, database) {
  if (request.method !== 'POST') {
    respond(response, 405, { message: 'Method tidak diizinkan' });
    return;
  }

  const payload = await readObjectBody(request);
  const username = typeof payload.username === 'string' ? payload.username.trim() : '';
  const key = typeof payload.key === 'string' ? payload.key.trim().toUpperCase() : '';
  const user = database.users.find((item) => (
    item.username.toLowerCase() === username.toLowerCase()
      && item.key === key
      && item.role === payload.role
  ));

  if (!user) {
    respond(response, 401, { message: 'Username, key, atau role salah' });
    return;
  }

  const { id, role, gambar, created_at } = user;
  respond(response, 200, { id, username: user.username, role, gambar, created_at });
}

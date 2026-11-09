export function respond(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

export async function readObjectBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 2 * 1024 * 1024) {
      const error = new Error('Ukuran request terlalu besar');
      error.status = 413;
      throw error;
    }
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    const error = new Error('Body harus berupa JSON yang valid');
    error.status = 400;
    throw error;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const error = new Error('Body harus berupa object JSON');
    error.status = 400;
    throw error;
  }

  return payload;
}

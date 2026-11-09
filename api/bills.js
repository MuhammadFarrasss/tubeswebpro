import { readObjectBody, respond } from './http.js';
import { writeDatabase } from './database.js';
import { addDriverAndVehicle } from './relations.js';

export const billRoute = /^\/api\/bills(?:\/(\d+))?$/;

function withRelations(database, bill) {
  const report = database.kerusakans.find((item) => item.id === bill.kerusakan_id);
  const mechanic = database.users.find((user) => user.id === bill.mekanik_id) || null;
  return {
    ...bill,
    mekanik: mechanic,
    kerusakan: report ? {
      ...report,
      ...addDriverAndVehicle(database, report),
    } : null,
    kendaraan: report ? addDriverAndVehicle(database, report).kendaraan : null,
  };
}

export async function handleBillRequest(request, response, _url, database, match) {
  const [, id] = match;

  if (request.method === 'GET' && !id) {
    respond(response, 200, database.bills.map((bill) => withRelations(database, bill)));
    return;
  }

  if (request.method === 'POST' && !id) {
    const payload = await readObjectBody(request);
    const repairId = Number(payload.kerusakan_id);
    const mechanicId = Number(payload.mekanik_id);
    const nominal = Number(payload.nominal);
    const deskripsi = typeof payload.deskripsi === 'string' ? payload.deskripsi.trim() : '';
    const report = database.kerusakans.find((item) => item.id === repairId);

    if (!report || report.mekanik_id !== mechanicId) {
      respond(response, 403, { message: 'Laporan ini bukan tugas mekanik tersebut' });
      return;
    }
    if (report.status !== 'Perbaikan') {
      respond(response, 409, { message: 'Bill hanya dapat dibuat untuk perbaikan yang sedang berjalan' });
      return;
    }
    if (!Number.isFinite(nominal) || nominal < 1000 || nominal > 50000000) {
      respond(response, 400, { message: 'Nominal harus antara Rp 1.000 dan Rp 50.000.000' });
      return;
    }
    if (!deskripsi || deskripsi.length > 1000) {
      respond(response, 400, { message: 'Deskripsi wajib diisi dan maksimal 1000 karakter' });
      return;
    }

    const bill = {
      id: Math.max(0, ...database.bills.map((item) => item.id)) + 1,
      kerusakan_id: repairId,
      mekanik_id: mechanicId,
      nominal,
      deskripsi,
      gambar: null,
      created_at: new Date().toISOString(),
    };
    database.bills.push(bill);
    await writeDatabase(database);
    respond(response, 201, withRelations(database, bill));
    return;
  }

  const bill = database.bills.find((item) => item.id === Number(id));
  if (!bill) {
    respond(response, 404, { message: 'Bill perbaikan tidak ditemukan' });
    return;
  }

  respond(response, 405, { message: 'Method tidak diizinkan' });
}

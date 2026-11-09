import { createServer } from 'node:http';
import { readDatabase } from './api/database.js';
import { respond } from './api/http.js';
import { handleVehicleRequest, vehicleRoute } from './api/vehicles.js';
import { handleFuelRequest, fuelRoute } from './api/fuel.js';
import { handleTowingRequest, towingRoute } from './api/towing.js';
import { handleRepairRequest, repairRoute } from './api/repairs.js';
import { handleBillRequest, billRoute } from './api/bills.js';

const port = Number(process.env.API_PORT || 3001);
const routes = [
  { pattern: vehicleRoute, handle: handleVehicleRequest },
  { pattern: fuelRoute, handle: handleFuelRequest },
  { pattern: towingRoute, handle: handleTowingRequest },
  { pattern: repairRoute, handle: handleRepairRequest },
  { pattern: billRoute, handle: handleBillRequest },
];

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const route = routes
      .map((item) => ({ ...item, match: url.pathname.match(item.pattern) }))
      .find((item) => item.match);

    if (!route) {
      respond(response, 404, { message: 'Endpoint tidak ditemukan' });
      return;
    }

    const database = await readDatabase();
    await route.handle(request, response, url, database, route.match);
  } catch (error) {
    console.error('API error:', error);
    respond(response, error.status || 500, {
      message: error.status ? error.message : 'Terjadi kesalahan pada server API',
    });
  }
});

server.listen(port, () => {
  console.log(`Dummy API berjalan di http://localhost:${port}/api`);
});

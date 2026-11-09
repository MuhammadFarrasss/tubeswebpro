export function addDriverAndVehicle(database, item) {
  return {
    ...item,
    driver: database.users.find((user) => user.id === item.driver_id) || null,
    kendaraan: database.kendaraans.find((vehicle) => vehicle.id === item.kendaraan_id) || null,
  };
}

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dbPath = fileURLToPath(new URL('../db.json', import.meta.url));

export async function readDatabase() {
  return JSON.parse(await readFile(dbPath, 'utf8'));
}

export async function writeDatabase(database) {
  await writeFile(dbPath, `${JSON.stringify(database, null, 2)}\n`);
}

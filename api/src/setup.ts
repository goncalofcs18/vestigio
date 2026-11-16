import { readFileSync } from 'node:fs';
import { pool } from './db.js';

const seed = JSON.parse(readFileSync(new URL('./data/seed.json', import.meta.url), 'utf8')) as {
  places: { id: string; name: string; category: string; latitude: number; longitude: number; description: string; imageUrl: string; imageCredit: string }[];
  collections: { id: string; name: string; description: string; places: string[] }[];
};

/** Cria as tabelas e (re)carrega os dados. Pode correr várias vezes sem perder check-ins. */
async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      image_credit TEXT
    );
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collection_places (
      collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
      place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
      position INT NOT NULL,
      PRIMARY KEY (collection_id, place_id)
    );
    CREATE TABLE IF NOT EXISTS checkins (
      device_id TEXT NOT NULL,
      place_id TEXT REFERENCES places(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (device_id, place_id)
    );
  `);

  for (const p of seed.places) {
    await pool.query(
      `INSERT INTO places (id, name, category, latitude, longitude, description, image_url, image_credit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET name=$2, category=$3, latitude=$4, longitude=$5, description=$6, image_url=$7, image_credit=$8`,
      [p.id, p.name, p.category, p.latitude, p.longitude, p.description, p.imageUrl, p.imageCredit],
    );
  }
  await pool.query('DELETE FROM collection_places');
  for (const c of seed.collections) {
    await pool.query(
      `INSERT INTO collections (id, name, description) VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET name=$2, description=$3`,
      [c.id, c.name, c.description],
    );
    for (const [i, placeId] of c.places.entries()) {
      await pool.query('INSERT INTO collection_places (collection_id, place_id, position) VALUES ($1,$2,$3)', [c.id, placeId, i]);
    }
  }
  console.log(`Base de dados pronta: ${seed.places.length} lugares, ${seed.collections.length} coleções.`);
  await pool.end();
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});

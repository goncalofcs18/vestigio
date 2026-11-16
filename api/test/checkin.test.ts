import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createYoga } from 'graphql-yoga';
import { pool } from '../src/db.js';
import { schema, type Context } from '../src/schema.js';

// Testes de integração: precisam de uma base de dados com o seed (npm run db:setup).
// Sem base de dados acessível, são ignorados.
const DEVICE = `test-${Date.now()}`;
const PLACE = { id: 'estacao', latitude: 40.643461, longitude: -8.6405 };

const yoga = createYoga<{}, Context>({
  schema,
  context: ({ request }) => ({ deviceId: request.headers.get('x-device-id') }),
});

async function gql(query: string, variables: Record<string, unknown> = {}, device: string | null = DEVICE) {
  const res = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(device ? { 'x-device-id': device } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  return res.json() as Promise<{ data?: any; errors?: { message: string }[] }>;
}

const CHECK_IN = /* GraphQL */ `
  mutation ($id: ID!, $lat: Float!, $lng: Float!) {
    checkIn(placeId: $id, latitude: $lat, longitude: $lng) {
      ok
      message
      distanceMeters
      place { visited }
      newAchievements { id }
    }
  }
`;

let dbReady = false;

before(async () => {
  try {
    const { rows } = await pool.query('SELECT 1 FROM places WHERE id = $1', [PLACE.id]);
    dbReady = rows.length > 0;
  } catch {
    dbReady = false;
  }
});

after(async () => {
  if (dbReady) await pool.query('DELETE FROM checkins WHERE device_id = $1', [DEVICE]);
  await pool.end();
});

test('check-in longe do lugar é recusado', async (t) => {
  if (!dbReady) return t.skip('sem base de dados');
  const { data } = await gql(CHECK_IN, { id: PLACE.id, lat: 41.15, lng: -8.61 });
  assert.equal(data.checkIn.ok, false);
  assert.equal(data.checkIn.place.visited, false);
  assert.ok(data.checkIn.distanceMeters > 1000);
});

test('check-in junto ao lugar é aceite e desbloqueia "Primeiro passo"', async (t) => {
  if (!dbReady) return t.skip('sem base de dados');
  const { data } = await gql(CHECK_IN, { id: PLACE.id, lat: PLACE.latitude, lng: PLACE.longitude });
  assert.equal(data.checkIn.ok, true);
  assert.equal(data.checkIn.place.visited, true);
  assert.deepEqual(data.checkIn.newAchievements.map((a: { id: string }) => a.id), ['primeiro-passo']);
});

test('repetir o check-in não duplica a visita', async (t) => {
  if (!dbReady) return t.skip('sem base de dados');
  const { data } = await gql(CHECK_IN, { id: PLACE.id, lat: PLACE.latitude, lng: PLACE.longitude });
  assert.equal(data.checkIn.ok, true);
  assert.equal(data.checkIn.newAchievements.length, 0);
  const me = await gql('{ me { visitedCount } }');
  assert.equal(me.data.me.visitedCount, 1);
});

test('check-in sem identificador do dispositivo dá erro', async (t) => {
  if (!dbReady) return t.skip('sem base de dados');
  const { errors } = await gql(CHECK_IN, { id: PLACE.id, lat: PLACE.latitude, lng: PLACE.longitude }, null);
  assert.ok(errors?.[0].message.includes('x-device-id'));
});

test('lugar inexistente dá erro', async (t) => {
  if (!dbReady) return t.skip('sem base de dados');
  const { errors } = await gql(CHECK_IN, { id: 'nao-existe', lat: 0, lng: 0 });
  assert.ok(errors?.[0].message.includes('não encontrado'));
});

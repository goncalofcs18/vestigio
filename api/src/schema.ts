import { createSchema } from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import { pool } from './db.js';
import { distanceMeters } from './geo.js';
import { computeAchievements, type Category } from './achievements.js';

export interface Context {
  deviceId: string | null;
}

const CHECKIN_RADIUS_M = Number(process.env.CHECKIN_RADIUS_M ?? 150);

interface PlaceRow {
  id: string;
  name: string;
  category: Category;
  latitude: number;
  longitude: number;
  description: string;
  image_url: string | null;
  image_credit: string | null;
}

const typeDefs = /* GraphQL */ `
  enum Category { arte_nova igreja museu monumento }

  type Place {
    id: ID!
    name: String!
    category: Category!
    latitude: Float!
    longitude: Float!
    description: String!
    imageUrl: String
    imageCredit: String
    visited: Boolean!
  }

  type Collection {
    id: ID!
    name: String!
    description: String!
    places: [Place!]!
    total: Int!
    visitedCount: Int!
  }

  type Achievement {
    id: ID!
    title: String!
    description: String!
    unlocked: Boolean!
  }

  type Visit {
    place: Place!
    visitedAt: String!
  }

  type Me {
    visitedCount: Int!
    totalPlaces: Int!
    visits: [Visit!]!
    achievements: [Achievement!]!
  }

  type CheckInResult {
    ok: Boolean!
    message: String!
    distanceMeters: Int!
    place: Place!
    newAchievements: [Achievement!]!
  }

  type Query {
    places(category: Category): [Place!]!
    place(id: ID!): Place
    collections: [Collection!]!
    collection(id: ID!): Collection
    me: Me!
  }

  type Mutation {
    checkIn(placeId: ID!, latitude: Float!, longitude: Float!): CheckInResult!
  }
`;

// ---------- helpers ----------

async function visitedIds(deviceId: string | null): Promise<Set<string>> {
  if (!deviceId) return new Set();
  const { rows } = await pool.query<{ place_id: string }>('SELECT place_id FROM checkins WHERE device_id = $1', [deviceId]);
  return new Set(rows.map((r) => r.place_id));
}

function toPlace(row: PlaceRow, visited: Set<string>) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description,
    imageUrl: row.image_url,
    imageCredit: row.image_credit,
    visited: visited.has(row.id),
  };
}

async function loadCollections(visited: Set<string>, id?: string) {
  const { rows: cols } = await pool.query<{ id: string; name: string; description: string }>(
    `SELECT id, name, description FROM collections ${id ? 'WHERE id = $1' : ''} ORDER BY name`,
    id ? [id] : [],
  );
  const { rows: links } = await pool.query<PlaceRow & { collection_id: string }>(
    `SELECT cp.collection_id, p.* FROM collection_places cp JOIN places p ON p.id = cp.place_id ORDER BY cp.position`,
  );
  return cols.map((c) => {
    const places = links.filter((l) => l.collection_id === c.id).map((l) => toPlace(l, visited));
    return { ...c, places, total: places.length, visitedCount: places.filter((p) => p.visited).length };
  });
}

async function achievementsFor(visited: Set<string>) {
  const { rows } = await pool.query<{ id: string; category: Category }>('SELECT id, category FROM places');
  const visitedCategories = new Set(rows.filter((r) => visited.has(r.id)).map((r) => r.category));
  const collections = (await loadCollections(visited)).map((c) => ({
    id: c.id,
    name: c.name,
    placeIds: c.places.map((p) => p.id),
  }));
  return computeAchievements({ visitedIds: visited, visitedCategories, collections });
}

// ---------- resolvers ----------

const resolvers = {
  Query: {
    places: async (_: unknown, args: { category?: Category }, ctx: Context) => {
      const visited = await visitedIds(ctx.deviceId);
      const { rows } = await pool.query<PlaceRow>(
        `SELECT * FROM places ${args.category ? 'WHERE category = $1' : ''} ORDER BY name`,
        args.category ? [args.category] : [],
      );
      return rows.map((r) => toPlace(r, visited));
    },
    place: async (_: unknown, args: { id: string }, ctx: Context) => {
      const visited = await visitedIds(ctx.deviceId);
      const { rows } = await pool.query<PlaceRow>('SELECT * FROM places WHERE id = $1', [args.id]);
      return rows[0] ? toPlace(rows[0], visited) : null;
    },
    collections: async (_: unknown, __: unknown, ctx: Context) => loadCollections(await visitedIds(ctx.deviceId)),
    collection: async (_: unknown, args: { id: string }, ctx: Context) =>
      (await loadCollections(await visitedIds(ctx.deviceId), args.id))[0] ?? null,
    me: async (_: unknown, __: unknown, ctx: Context) => {
      const visited = await visitedIds(ctx.deviceId);
      const { rows } = await pool.query<PlaceRow & { created_at: Date }>(
        `SELECT p.*, c.created_at FROM checkins c JOIN places p ON p.id = c.place_id
         WHERE c.device_id = $1 ORDER BY c.created_at DESC`,
        [ctx.deviceId ?? ''],
      );
      const { rows: total } = await pool.query<{ n: string }>('SELECT count(*) AS n FROM places');
      return {
        visitedCount: visited.size,
        totalPlaces: Number(total[0].n),
        visits: rows.map((r) => ({ place: toPlace(r, visited), visitedAt: r.created_at.toISOString() })),
        achievements: await achievementsFor(visited),
      };
    },
  },
  Mutation: {
    checkIn: async (_: unknown, args: { placeId: string; latitude: number; longitude: number }, ctx: Context) => {
      if (!ctx.deviceId) throw new GraphQLError('Falta o identificador do dispositivo (cabeçalho x-device-id).');
      const { rows } = await pool.query<PlaceRow>('SELECT * FROM places WHERE id = $1', [args.placeId]);
      const row = rows[0];
      if (!row) throw new GraphQLError('Lugar não encontrado.');

      const before = await visitedIds(ctx.deviceId);
      const distance = Math.round(distanceMeters(args.latitude, args.longitude, row.latitude, row.longitude));

      if (before.has(row.id)) {
        return { ok: true, message: 'Já tinhas visitado este lugar.', distanceMeters: distance, place: toPlace(row, before), newAchievements: [] };
      }
      if (distance > CHECKIN_RADIUS_M) {
        return {
          ok: false,
          message: `Estás a ${distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}. Aproxima-te para fazer check-in.`,
          distanceMeters: distance,
          place: toPlace(row, before),
          newAchievements: [],
        };
      }

      const beforeAch = await achievementsFor(before);
      await pool.query('INSERT INTO checkins (device_id, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [ctx.deviceId, row.id]);
      const after = new Set(before).add(row.id);
      const afterAch = await achievementsFor(after);
      const unlockedBefore = new Set(beforeAch.filter((a) => a.unlocked).map((a) => a.id));

      return {
        ok: true,
        message: 'Check-in feito!',
        distanceMeters: distance,
        place: toPlace(row, after),
        newAchievements: afterAch.filter((a) => a.unlocked && !unlockedBefore.has(a.id)),
      };
    },
  },
};

export const schema = createSchema<Context>({ typeDefs, resolvers });

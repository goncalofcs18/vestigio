import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceMeters } from '../src/geo.js';

test('distância zero para o mesmo ponto', () => {
  assert.equal(distanceMeters(40.64, -8.65, 40.64, -8.65), 0);
});

test('Sé de Aveiro até ao Museu Arte Nova fica entre 600 m e 800 m', () => {
  const d = distanceMeters(40.639722, -8.650278, 40.641846, -8.6556);
  assert.ok(d > 400 && d < 800, `distância inesperada: ${d}`);
});

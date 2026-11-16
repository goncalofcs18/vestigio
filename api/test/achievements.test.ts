import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAchievements } from '../src/achievements.js';

const collections = [{ id: 'museus', name: 'Museus', placeIds: ['a', 'b'] }];

test('sem visitas, nenhuma conquista desbloqueada', () => {
  const r = computeAchievements({ visitedIds: new Set(), visitedCategories: new Set(), collections });
  assert.ok(r.every((a) => !a.unlocked));
});

test('primeira visita desbloqueia "Primeiro passo"', () => {
  const r = computeAchievements({ visitedIds: new Set(['a']), visitedCategories: new Set(['museu']), collections });
  assert.equal(r.find((a) => a.id === 'primeiro-passo')?.unlocked, true);
  assert.equal(r.find((a) => a.id === 'colecao-museus')?.unlocked, false);
});

test('coleção completa desbloqueia a conquista da coleção', () => {
  const r = computeAchievements({ visitedIds: new Set(['a', 'b']), visitedCategories: new Set(['museu']), collections });
  assert.equal(r.find((a) => a.id === 'colecao-museus')?.unlocked, true);
});

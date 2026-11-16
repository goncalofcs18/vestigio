export type Category = 'arte_nova' | 'igreja' | 'museu' | 'monumento';

export interface AchievementInput {
  visitedIds: Set<string>;
  visitedCategories: Set<Category>;
  collections: { id: string; name: string; placeIds: string[] }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

/** Calcula as conquistas a partir das visitas. Sem estado: tudo deriva dos check-ins. */
export function computeAchievements({ visitedIds, visitedCategories, collections }: AchievementInput): Achievement[] {
  const count = visitedIds.size;
  const base: Achievement[] = [
    { id: 'primeiro-passo', title: 'Primeiro passo', description: 'Faz o teu primeiro check-in.', unlocked: count >= 1 },
    { id: 'curioso', title: 'Curioso', description: 'Visita 5 lugares.', unlocked: count >= 5 },
    { id: 'conhecedor', title: 'Conhecedor', description: 'Visita 15 lugares.', unlocked: count >= 15 },
    {
      id: 'olhar-completo',
      title: 'Olhar completo',
      description: 'Visita um lugar de cada categoria.',
      unlocked: visitedCategories.size >= 4,
    },
  ];
  const perCollection = collections.map((c) => ({
    id: `colecao-${c.id}`,
    title: c.name,
    description: `Completa a coleção ${c.name}.`,
    unlocked: c.placeIds.length > 0 && c.placeIds.every((id) => visitedIds.has(id)),
  }));
  return [...base, ...perCollection];
}

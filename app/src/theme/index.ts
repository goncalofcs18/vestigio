/** Tokens de design inspirados em Aveiro: o branco da cal, o azul do azulejo e as cores dos moliceiros. */
export const colors = {
  cal: '#F5F7FA', // fundo
  surface: '#FFFFFF',
  ink: '#16203A', // texto principal
  inkSoft: '#5B6478', // texto secundário
  line: '#E1E5EC',
  tileLine: '#C5CEDF', // desenho dos azulejos por visitar
  azulejo: '#1E4BA8', // cor principal
  azulejoSoft: '#E3EAF8',
  success: '#1F7A55',
  danger: '#B3392A',
} as const;

export type Category = 'arte_nova' | 'igreja' | 'museu' | 'monumento';

export const categories: Record<Category, { label: string; color: string }> = {
  arte_nova: { label: 'Arte Nova', color: '#1F7F86' },
  igreja: { label: 'Igrejas', color: '#B8442E' },
  museu: { label: 'Museus', color: '#C98A12' },
  monumento: { label: 'Monumentos', color: '#1E4BA8' },
};

export const fonts = {
  display: 'YoungSerif_400Regular',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 22 } as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, color: colors.ink },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  small: { fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, color: colors.inkSoft },
};

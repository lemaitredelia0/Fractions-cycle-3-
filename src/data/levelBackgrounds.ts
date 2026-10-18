import { SchoolLevel } from '../types/game';

export const LEVEL_BACKGROUNDS: Record<SchoolLevel, { title: string; imageSrc: string; theme: string }> = {
  CP: {
    title: 'Village Pastel',
    theme: 'Partages & Moitiés',
    imageSrc: '/images/level_village_pastel_1792266905635.jpg',
  },
  CE1: {
    title: 'Boulangerie Néon',
    theme: 'Fractions d’un tout',
    imageSrc: '/images/level_boulangerie_neon_1792266906065.jpg',
  },
  CE2: {
    title: 'Studio Rock',
    theme: 'Bandes & Égalités',
    imageSrc: '/images/level_studio_rock_1792266907177.jpg',
  },
  CM1: {
    title: 'Arène Cyber',
    theme: 'Fractions > 1 & Décimales',
    imageSrc: '/images/level_arene_cyber_1792266908197.jpg',
  },
  CM2: {
    title: 'Stade Électro',
    theme: 'Quantités & Multiples',
    imageSrc: '/images/level_stade_electro_1792266908746.jpg',
  },
  '6E': {
    title: 'Académie Galaxie',
    theme: 'Nombres Décimaux',
    imageSrc: '/images/level_academie_galaxie_1792266908013.jpg',
  },
};

export const DEFAULT_ARCADE_BACKGROUND = '/images/colorful_addictive_neon_stage_1791396853884.jpg';

export function getLevelBackground(level?: SchoolLevel): string {
  if (level && LEVEL_BACKGROUNDS[level]) {
    return LEVEL_BACKGROUNDS[level].imageSrc;
  }
  return DEFAULT_ARCADE_BACKGROUND;
}

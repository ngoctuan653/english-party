export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export interface CefrLevelMeta {
  level: CefrLevel;
  band: 'Basic user' | 'Independent user' | 'Proficient user';
  title: string;
  descriptor: string;
  difficulty: number;
}

export const CEFR_LEVEL_META: Record<CefrLevel, CefrLevelMeta> = {
  A1: {
    level: 'A1',
    band: 'Basic user',
    title: 'Breakthrough',
    descriptor: 'Understand and use familiar everyday expressions and very basic phrases.',
    difficulty: 500,
  },
  A2: {
    level: 'A2',
    band: 'Basic user',
    title: 'Waystage',
    descriptor: 'Communicate in simple, routine tasks about familiar and immediate needs.',
    difficulty: 600,
  },
  B1: {
    level: 'B1',
    band: 'Independent user',
    title: 'Threshold',
    descriptor: 'Handle the main points of clear language and most everyday situations.',
    difficulty: 650,
  },
  B2: {
    level: 'B2',
    band: 'Independent user',
    title: 'Vantage',
    descriptor: 'Interact with fluency and understand the main ideas of complex texts.',
    difficulty: 700,
  },
  C1: {
    level: 'C1',
    band: 'Proficient user',
    title: 'Effective proficiency',
    descriptor: 'Use English flexibly and effectively for social, academic, and professional purposes.',
    difficulty: 800,
  },
  C2: {
    level: 'C2',
    band: 'Proficient user',
    title: 'Mastery',
    descriptor: 'Understand virtually everything and express precise shades of meaning fluently.',
    difficulty: 900,
  },
};

export function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === 'string' && CEFR_LEVELS.includes(value as CefrLevel);
}

export function cefrLevelFromDifficulty(difficulty: number | null | undefined): CefrLevel {
  const value = Number(difficulty ?? 0);
  if (value >= 900) return 'C2';
  if (value >= 800) return 'C1';
  if (value >= 700) return 'B2';
  if (value >= 650) return 'B1';
  if (value >= 600) return 'A2';
  return 'A1';
}

// Legacy scores are used only to seed CEFR preferences for existing accounts.
export function cefrLevelFromLegacyScore(score: number | null | undefined): CefrLevel {
  const value = Number(score ?? 0);
  if (value >= 950) return 'C2';
  if (value >= 850) return 'C1';
  if (value >= 700) return 'B2';
  if (value >= 550) return 'B1';
  if (value >= 300) return 'A2';
  return 'A1';
}

export function getCurrentCefrLevel(profile?: {
  currentCefrLevel?: CefrLevel;
  currentEstimatedScore?: number;
} | null): CefrLevel {
  return profile?.currentCefrLevel ?? cefrLevelFromLegacyScore(profile?.currentEstimatedScore);
}

export function getTargetCefrLevel(profile?: {
  targetCefrLevel?: CefrLevel;
  targetScore?: number;
} | null): CefrLevel {
  return profile?.targetCefrLevel ?? cefrLevelFromLegacyScore(profile?.targetScore ?? 700);
}

export function getCefrDifficulty(level: CefrLevel): number {
  return CEFR_LEVEL_META[level].difficulty;
}

export function compareCefrLevels(left: CefrLevel, right: CefrLevel): number {
  return CEFR_LEVELS.indexOf(left) - CEFR_LEVELS.indexOf(right);
}

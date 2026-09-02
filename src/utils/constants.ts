export const APP_NAME = 'EnglishParty';

export const TOPICS = [
  'business', 'meetings', 'email', 'office', 'finance',
  'marketing', 'airport', 'hotel', 'shipping', 'technology',
  'healthcare', 'education', 'travel', 'food', 'entertainment',
] as const;

export const EXAM_TYPES = [
  { id: 'cefr', name: 'CEFR A1-C2', icon: '🌍' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 500, label: 'A1', color: '#22C55E' },
  { value: 600, label: 'A2', color: '#14B8A6' },
  { value: 650, label: 'B1', color: '#3B82F6' },
  { value: 700, label: 'B2', color: '#6366F1' },
  { value: 800, label: 'C1', color: '#A855F7' },
  { value: 900, label: 'C2', color: '#F59E0B' },
] as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Learn', icon: 'Map' },
  { path: '/study', label: 'Practice', icon: 'Dumbbell' },
  { path: '/leaderboard', label: 'League', icon: 'Trophy' },
  { path: '/missions', label: 'Quests', icon: 'ListChecks' },
  { path: '/friends', label: 'Friends', icon: 'Users' },
  { path: '/profile', label: 'Profile', icon: 'User' },
] as const;

export const STREAK_REQUIREMENTS = {
  minQuestions: 10,
  minActiveMinutes: 10,
};

export const ANTI_CHEAT = {
  minActiveRatio: 0.35,
  maxTabSwitches: 8,
  minSecondsPerQuestion: 2,
  minSingleAnswerSeconds: 1,
  maxFastAnswerRatio: 0.6,
  minInteractions: 2,
  maxIdleIntervals: 5,
  idleTimeoutSeconds: 90,
};

export const AVATARS = [
  '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐸', '🦉',
  '🐙', '🦋', '🐬', '🦄', '🐲', '🦈', '🐧', '🦜',
];

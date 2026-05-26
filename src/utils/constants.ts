export const APP_NAME = 'EnglishParty';

export const TOPICS = [
  'business', 'meetings', 'email', 'office', 'finance',
  'marketing', 'airport', 'hotel', 'shipping', 'technology',
  'healthcare', 'education', 'travel', 'food', 'entertainment',
] as const;

export const EXAM_TYPES = [
  { id: 'toeic', name: 'TOEIC', icon: '📝' },
  { id: 'ielts', name: 'IELTS', icon: '🎓' },
  { id: 'jlpt', name: 'JLPT', icon: '🇯🇵' },
  { id: 'sat', name: 'SAT', icon: '📚' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 500, label: 'Beginner', color: '#22C55E' },
  { value: 600, label: 'Elementary', color: '#3B82F6' },
  { value: 700, label: 'Intermediate', color: '#A855F7' },
  { value: 800, label: 'Advanced', color: '#F59E0B' },
  { value: 900, label: 'Expert', color: '#EF4444' },
] as const;

export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/leaderboard', label: 'Leaderboard', icon: 'Award' },
  { path: '/study', label: 'Study', icon: 'BookOpen' },
  { path: '/missions', label: 'Missions', icon: 'Target' },
  { path: '/friends', label: 'Friends', icon: 'Users' },
  { path: '/profile', label: 'Profile', icon: 'User' },
] as const;

export const STREAK_REQUIREMENTS = {
  minQuestions: 10,
  minActiveMinutes: 10,
};

export const ANTI_CHEAT = {
  minActiveRatio: 0.6,
  maxTabSwitches: 5,
  minSecondsPerQuestion: 5,
  maxIdleIntervals: 3,
  idleTimeoutSeconds: 30,
};

export const AVATARS = [
  '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐸', '🦉',
  '🐙', '🦋', '🐬', '🦄', '🐲', '🦈', '🐧', '🦜',
];

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate();
  if (isToday(date)) return `Today at ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d, yyyy');
}

export function formatTimeAgo(timestamp: Timestamp | null): string {
  if (!timestamp) return 'Never';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-green-400';
  if (accuracy >= 70) return 'text-yellow-400';
  if (accuracy >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '💪';
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

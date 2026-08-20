/**
 * Anti-Cheat Service
 * Tracks user activity to prevent fake streaks and XP farming.
 * Monitors: tab visibility, mouse clicks, keyboard activity, idle periods.
 */

import { ANTI_CHEAT } from '@/utils/constants';
import type { SessionValidationIssue } from '@/types/study';

export interface AntiCheatData {
  tabSwitches: number;
  idleIntervals: number;
  interactionCount: number;
  activeSeconds: number;
  totalSeconds: number;
  trackingAvailable: boolean;
  validationIssues: SessionValidationIssue[];
  isValid: boolean;
}

interface ActivityTracker {
  startTime: number;
  lastActivityTime: number;
  activeStartedAt: number | null;
  tabSwitches: number;
  idleIntervals: number;
  interactionCount: number;
  activeTime: number;
  isIdle: boolean;
  idleTimer: ReturnType<typeof setTimeout> | null;
  visibilityHandler: (() => void) | null;
  interactionHandler: (() => void) | null;
}

const trackers = new Map<string, ActivityTracker>();
const completedSnapshots = new Map<string, AntiCheatData>();

function cleanupTracker(tracker: ActivityTracker): void {
  if (tracker.visibilityHandler) {
    document.removeEventListener('visibilitychange', tracker.visibilityHandler);
  }
  if (tracker.interactionHandler) {
    document.removeEventListener('click', tracker.interactionHandler);
    document.removeEventListener('keydown', tracker.interactionHandler);
    document.removeEventListener('touchstart', tracker.interactionHandler);
  }
  if (tracker.idleTimer) clearTimeout(tracker.idleTimer);
}

function rememberSnapshot(sessionId: string, data: AntiCheatData): void {
  completedSnapshots.set(sessionId, data);
  if (completedSnapshots.size <= 50) return;
  const oldestKey = completedSnapshots.keys().next().value;
  if (oldestKey) completedSnapshots.delete(oldestKey);
}

export function startAntiCheatTracking(sessionId: string): void {
  for (const [activeSessionId, activeTracker] of trackers) {
    cleanupTracker(activeTracker);
    trackers.delete(activeSessionId);
  }

  completedSnapshots.delete(sessionId);
  const tracker: ActivityTracker = {
    startTime: Date.now(),
    lastActivityTime: Date.now(),
    activeStartedAt: Date.now(),
    tabSwitches: 0,
    idleIntervals: 0,
    interactionCount: 0,
    activeTime: 0,
    isIdle: false,
    idleTimer: null,
    visibilityHandler: null,
    interactionHandler: null,
  };
  trackers.set(sessionId, tracker);

  const addActiveSegment = (now: number) => {
    if (tracker.isIdle || tracker.activeStartedAt === null) return;
    tracker.activeTime += Math.max(0, now - tracker.activeStartedAt) / 1000;
    tracker.activeStartedAt = null;
  };

  const scheduleIdleTimer = () => {
    if (tracker.idleTimer) clearTimeout(tracker.idleTimer);
    tracker.idleTimer = setTimeout(() => {
      if (trackers.get(sessionId) !== tracker) return;
      addActiveSegment(Date.now());
      tracker.isIdle = true;
      tracker.idleIntervals++;
    }, ANTI_CHEAT.idleTimeoutSeconds * 1000);
  };

  // Track tab visibility
  tracker.visibilityHandler = () => {
    if (trackers.get(sessionId) !== tracker) return;
    const now = Date.now();
    if (document.visibilityState === 'hidden') {
      addActiveSegment(now);
      tracker.tabSwitches++;
      tracker.isIdle = true;
      if (tracker.idleTimer) clearTimeout(tracker.idleTimer);
    } else {
      tracker.lastActivityTime = now;
      tracker.activeStartedAt = now;
      tracker.isIdle = false;
      scheduleIdleTimer();
    }
  };
  document.addEventListener('visibilitychange', tracker.visibilityHandler);

  // Track interactions (clicks, keys, touches)
  tracker.interactionHandler = () => {
    if (trackers.get(sessionId) !== tracker || document.visibilityState === 'hidden') return;
    tracker.interactionCount++;
    const now = Date.now();

    if (tracker.isIdle || tracker.activeStartedAt === null) {
      tracker.activeStartedAt = now;
    }

    tracker.lastActivityTime = now;
    tracker.isIdle = false;

    // Reset idle timer
    scheduleIdleTimer();
  };

  document.addEventListener('click', tracker.interactionHandler);
  document.addEventListener('keydown', tracker.interactionHandler);
  document.addEventListener('touchstart', tracker.interactionHandler);

  // Start idle timer
  scheduleIdleTimer();
}

export function stopAntiCheatTracking(sessionId: string): AntiCheatData {
  const completed = completedSnapshots.get(sessionId);
  if (completed) return completed;

  const tracker = trackers.get(sessionId);
  if (!tracker) {
    return {
      tabSwitches: 0,
      idleIntervals: 0,
      interactionCount: 0,
      activeSeconds: 0,
      totalSeconds: 0,
      trackingAvailable: false,
      validationIssues: [],
      isValid: true,
    };
  }

  const now = Date.now();
  const totalSeconds = (now - tracker.startTime) / 1000;
  
  // Add remaining active time
  if (!tracker.isIdle && tracker.activeStartedAt !== null) {
    tracker.activeTime += Math.max(0, now - tracker.activeStartedAt) / 1000;
    tracker.activeStartedAt = null;
  }

  const validationIssues = validateSession(tracker, totalSeconds);
  const data: AntiCheatData = {
    tabSwitches: tracker.tabSwitches,
    idleIntervals: tracker.idleIntervals,
    interactionCount: tracker.interactionCount,
    activeSeconds: Math.round(tracker.activeTime),
    totalSeconds: Math.round(totalSeconds),
    trackingAvailable: true,
    validationIssues,
    isValid: validationIssues.length === 0,
  };

  cleanupTracker(tracker);
  trackers.delete(sessionId);
  rememberSnapshot(sessionId, data);
  return data;
}

export function cancelAntiCheatTracking(sessionId: string): void {
  const tracker = trackers.get(sessionId);
  if (tracker) cleanupTracker(tracker);
  trackers.delete(sessionId);
  completedSnapshots.delete(sessionId);
}

function validateSession(t: ActivityTracker, totalSeconds: number): SessionValidationIssue[] {
  const issues: SessionValidationIssue[] = [];
  const activeRatio = totalSeconds > 0 ? t.activeTime / totalSeconds : 0;
  const hasSustainedInactivity =
    totalSeconds >= ANTI_CHEAT.idleTimeoutSeconds &&
    activeRatio < ANTI_CHEAT.minActiveRatio &&
    t.idleIntervals > ANTI_CHEAT.maxIdleIntervals;

  if (t.tabSwitches > ANTI_CHEAT.maxTabSwitches) {
    issues.push('excessive-tab-switching');
  }
  if (hasSustainedInactivity || (totalSeconds >= 20 && t.interactionCount < ANTI_CHEAT.minInteractions)) {
    issues.push('extended-inactivity');
  }

  return issues;
}

export function validateAnswerTiming(
  questionsAnswered: number,
  totalSeconds: number
): boolean {
  if (questionsAnswered === 0) return true;
  const avgSeconds = totalSeconds / questionsAnswered;
  return avgSeconds >= ANTI_CHEAT.minSecondsPerQuestion;
}

export function getAntiCheatStatus(sessionId: string): AntiCheatData | null {
  const tracker = trackers.get(sessionId);
  if (!tracker) return completedSnapshots.get(sessionId) ?? null;
  
  const now = Date.now();
  const totalSeconds = (now - tracker.startTime) / 1000;
  const activeSeconds =
    tracker.activeTime +
    (!tracker.isIdle && tracker.activeStartedAt !== null
      ? Math.max(0, now - tracker.activeStartedAt) / 1000
      : 0);
  
  const validationIssues = validateSession(tracker, totalSeconds);
  return {
    tabSwitches: tracker.tabSwitches,
    idleIntervals: tracker.idleIntervals,
    interactionCount: tracker.interactionCount,
    activeSeconds: Math.round(activeSeconds),
    totalSeconds: Math.round(totalSeconds),
    trackingAvailable: true,
    validationIssues,
    isValid: validationIssues.length === 0,
  };
}

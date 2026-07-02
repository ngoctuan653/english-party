/**
 * Anti-Cheat Service
 * Tracks user activity to prevent fake streaks and XP farming.
 * Monitors: tab visibility, mouse clicks, keyboard activity, idle periods.
 */

import { ANTI_CHEAT } from '@/utils/constants';

export interface AntiCheatData {
  tabSwitches: number;
  idleIntervals: number;
  interactionCount: number;
  activeSeconds: number;
  totalSeconds: number;
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

let tracker: ActivityTracker | null = null;

export function startAntiCheatTracking(): void {
  tracker = {
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

  const addActiveSegment = (now: number) => {
    if (!tracker || tracker.isIdle || tracker.activeStartedAt === null) return;
    tracker.activeTime += Math.max(0, now - tracker.activeStartedAt) / 1000;
    tracker.activeStartedAt = null;
  };

  const scheduleIdleTimer = () => {
    if (!tracker) return;
    if (tracker.idleTimer) clearTimeout(tracker.idleTimer);
    tracker.idleTimer = setTimeout(() => {
      if (tracker) {
        addActiveSegment(Date.now());
        tracker.isIdle = true;
        tracker.idleIntervals++;
      }
    }, ANTI_CHEAT.idleTimeoutSeconds * 1000);
  };

  // Track tab visibility
  tracker.visibilityHandler = () => {
    if (!tracker) return;
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
    if (!tracker || document.visibilityState === 'hidden') return;
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

export function stopAntiCheatTracking(): AntiCheatData {
  if (!tracker) {
    return {
      tabSwitches: 0,
      idleIntervals: 0,
      interactionCount: 0,
      activeSeconds: 0,
      totalSeconds: 0,
      isValid: false,
    };
  }

  const now = Date.now();
  const totalSeconds = (now - tracker.startTime) / 1000;
  
  // Add remaining active time
  if (!tracker.isIdle && tracker.activeStartedAt !== null) {
    tracker.activeTime += Math.max(0, now - tracker.activeStartedAt) / 1000;
    tracker.activeStartedAt = null;
  }

  const data: AntiCheatData = {
    tabSwitches: tracker.tabSwitches,
    idleIntervals: tracker.idleIntervals,
    interactionCount: tracker.interactionCount,
    activeSeconds: Math.round(tracker.activeTime),
    totalSeconds: Math.round(totalSeconds),
    isValid: validateSession(tracker, totalSeconds),
  };

  // Cleanup
  if (tracker.visibilityHandler) {
    document.removeEventListener('visibilitychange', tracker.visibilityHandler);
  }
  if (tracker.interactionHandler) {
    document.removeEventListener('click', tracker.interactionHandler);
    document.removeEventListener('keydown', tracker.interactionHandler);
    document.removeEventListener('touchstart', tracker.interactionHandler);
  }
  if (tracker.idleTimer) {
    clearTimeout(tracker.idleTimer);
  }

  tracker = null;
  return data;
}

function validateSession(t: ActivityTracker, totalSeconds: number): boolean {
  // Active time ratio check
  const activeRatio = totalSeconds > 0 ? t.activeTime / totalSeconds : 0;
  if (activeRatio < ANTI_CHEAT.minActiveRatio) return false;

  // Tab switch check
  if (t.tabSwitches > ANTI_CHEAT.maxTabSwitches) return false;

  // Idle intervals check
  if (t.idleIntervals > ANTI_CHEAT.maxIdleIntervals) return false;

  // Must have some interactions
  if (t.interactionCount < ANTI_CHEAT.minInteractions) return false;

  return true;
}

export function validateAnswerTiming(
  questionsAnswered: number,
  totalSeconds: number
): boolean {
  if (questionsAnswered === 0) return true;
  const avgSeconds = totalSeconds / questionsAnswered;
  return avgSeconds >= ANTI_CHEAT.minSecondsPerQuestion;
}

export function getAntiCheatStatus(): AntiCheatData | null {
  if (!tracker) return null;
  
  const now = Date.now();
  const totalSeconds = (now - tracker.startTime) / 1000;
  const activeSeconds =
    tracker.activeTime +
    (!tracker.isIdle && tracker.activeStartedAt !== null
      ? Math.max(0, now - tracker.activeStartedAt) / 1000
      : 0);
  
  return {
    tabSwitches: tracker.tabSwitches,
    idleIntervals: tracker.idleIntervals,
    interactionCount: tracker.interactionCount,
    activeSeconds: Math.round(activeSeconds),
    totalSeconds: Math.round(totalSeconds),
    isValid: validateSession(tracker, totalSeconds),
  };
}

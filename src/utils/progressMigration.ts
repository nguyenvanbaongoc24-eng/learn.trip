import { UserProgress, PassportStamp } from "@/types/content";

const DEFAULT_GUEST_XP = 120;

/**
 * Checks if a guest has accumulated any meaningful game progress
 */
export function hasGuestProgress(progress?: UserProgress | null): boolean {
  if (!progress) return false;
  return (
    progress.xp > DEFAULT_GUEST_XP ||
    (progress.completedQuestIds && progress.completedQuestIds.length > 0) ||
    (progress.checkedInPoiIds && progress.checkedInPoiIds.length > 0) ||
    (progress.collectedStamps && progress.collectedStamps.length > 0) ||
    (progress.unlockedLocationIds && progress.unlockedLocationIds.length > 1)
  );
}

/**
 * Merges guest progress (from localStorage) into an authenticated user's progress.
 * Prevents loss of guest XP and stamps while preserving existing user data.
 */
export function mergeUserProgress(
  userProgress: UserProgress,
  guestProgress?: UserProgress | null
): UserProgress {
  if (!guestProgress) return userProgress;

  // Additional XP gained during guest session beyond initial default
  const netGuestXp = Math.max(0, guestProgress.xp - DEFAULT_GUEST_XP);
  const mergedXp = (userProgress.xp || 0) + netGuestXp;

  // Max streak
  const mergedStreak = Math.max(userProgress.streak || 0, guestProgress.streak || 0);

  // Union arrays with uniqueness
  const unlockedLocationIds = Array.from(
    new Set([
      ...(userProgress.unlockedLocationIds || []),
      ...(guestProgress.unlockedLocationIds || []),
    ])
  );

  const completedQuestIds = Array.from(
    new Set([
      ...(userProgress.completedQuestIds || []),
      ...(guestProgress.completedQuestIds || []),
    ])
  );

  const completedLessonIds = Array.from(
    new Set([
      ...(userProgress.completedLessonIds || []),
      ...(guestProgress.completedLessonIds || []),
    ])
  );

  const checkedInPoiIds = Array.from(
    new Set([
      ...(userProgress.checkedInPoiIds || []),
      ...(guestProgress.checkedInPoiIds || []),
    ])
  );

  // Merge stamps by stamp ID
  const stampMap = new Map<string, PassportStamp>();
  (userProgress.collectedStamps || []).forEach((s) => stampMap.set(s.id, s));
  (guestProgress.collectedStamps || []).forEach((s) => {
    if (!stampMap.has(s.id)) {
      stampMap.set(s.id, s);
    }
  });
  const collectedStamps = Array.from(stampMap.values());

  // Merge badges by badge ID
  const badgeMap = new Map<string, any>();
  (userProgress.collectedBadges || []).forEach((b) => badgeMap.set(b.id, b));
  (guestProgress.collectedBadges || []).forEach((b) => {
    if (!badgeMap.has(b.id)) {
      badgeMap.set(b.id, b);
    }
  });
  const collectedBadges = Array.from(badgeMap.values());

  return {
    ...userProgress,
    xp: mergedXp,
    streak: mergedStreak,
    lastActiveDate: new Date().toISOString(),
    currentDestinationId:
      guestProgress.currentDestinationId || userProgress.currentDestinationId || "loc-hanoi",
    unlockedLocationIds,
    completedQuestIds,
    completedLessonIds,
    collectedStamps,
    collectedBadges,
    checkedInPoiIds,
  };
}

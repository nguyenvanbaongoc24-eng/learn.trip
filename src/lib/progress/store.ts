import { UserProgress, PassportStamp } from "@/types/content";

// Default initial progress for any new learner
export const initialDefaultProgress: UserProgress = {
  xp: 120,
  streak: 4,
  lastActiveDate: new Date().toISOString(),
  currentDestinationId: "loc-hanoi",
  unlockedLocationIds: ["loc-hanoi"],
  completedQuestIds: [],
  completedLessonIds: [],
  collectedStamps: [],
  collectedBadges: [],
  checkedInPoiIds: [],
};

// In-memory progress database keyed by userId
const progressDb = new Map<string, UserProgress>();

// Pre-seed default progress for seeded learner
progressDb.set("usr-learner-01", {
  xp: 320,
  streak: 6,
  lastActiveDate: new Date().toISOString(),
  currentDestinationId: "loc-halong",
  unlockedLocationIds: ["loc-hanoi", "loc-halong"],
  completedQuestIds: ["quest-hn-01", "quest-hn-02"],
  completedLessonIds: ["lesson-hn-01"],
  collectedStamps: [
    {
      id: "stamp-hanoi",
      locationId: "loc-hanoi",
      title: { vi: "Thủ đô Ngàn năm", en: "Thousand-Year Capital" },
      category: "culture",
      symbol: "🏛️",
      landmark: { vi: "Hồ Hoàn Kiếm", en: "Hoan Kiem Lake" },
      unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  collectedBadges: [
    {
      id: "badge-first-step",
      title: { vi: "Bước Đầu Khám Phá", en: "First Explorer Step" },
      icon: "🧭",
      unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  checkedInPoiIds: ["poi-hanoi-hoankiem", "poi-hanoi-opera"],
});

/**
 * Fetch progress for a specific user.
 * Returns a clone of the saved progress, or default progress if not found.
 */
export function getUserProgress(userId: string): UserProgress {
  const existing = progressDb.get(userId);
  if (existing) {
    return JSON.parse(JSON.stringify(existing));
  }
  const fresh: UserProgress = {
    ...initialDefaultProgress,
    lastActiveDate: new Date().toISOString(),
  };
  progressDb.set(userId, fresh);
  return JSON.parse(JSON.stringify(fresh));
}

/**
 * Merge two progress records (e.g. client and server), taking the highest XP, streak,
 * and union of unlocked locations, quests, stamps, and badges.
 */
export function mergeProgressRecords(
  base: UserProgress,
  incoming: Partial<UserProgress>
): UserProgress {
  const safeBase = base || initialDefaultProgress;

  // Max XP and Streak
  const xp = Math.max(safeBase.xp || 0, incoming.xp || 0);
  const streak = Math.max(safeBase.streak || 0, incoming.streak || 0);

  // Unions for unique ID arrays
  const unlockedLocationIds = Array.from(
    new Set([...(safeBase.unlockedLocationIds || []), ...(incoming.unlockedLocationIds || [])])
  );
  if (!unlockedLocationIds.includes("loc-hanoi")) {
    unlockedLocationIds.unshift("loc-hanoi");
  }

  const completedQuestIds = Array.from(
    new Set([...(safeBase.completedQuestIds || []), ...(incoming.completedQuestIds || [])])
  );

  const completedLessonIds = Array.from(
    new Set([...(safeBase.completedLessonIds || []), ...(incoming.completedLessonIds || [])])
  );

  const checkedInPoiIds = Array.from(
    new Set([...(safeBase.checkedInPoiIds || []), ...(incoming.checkedInPoiIds || [])])
  );

  // Union of stamps by stamp id
  const stampsMap = new Map<string, PassportStamp>();
  (safeBase.collectedStamps || []).forEach((s) => stampsMap.set(s.id, s));
  (incoming.collectedStamps || []).forEach((s) => stampsMap.set(s.id, s));

  // Union of badges by badge id
  const badgesMap = new Map<string, { id: string; title: any; icon: string; unlockedAt: string }>();
  (safeBase.collectedBadges || []).forEach((b) => badgesMap.set(b.id, b));
  (incoming.collectedBadges || []).forEach((b) => badgesMap.set(b.id, b));

  const currentDestinationId =
    incoming.currentDestinationId || safeBase.currentDestinationId || "loc-hanoi";

  return {
    xp,
    streak,
    lastActiveDate: new Date().toISOString(),
    currentDestinationId,
    unlockedLocationIds,
    completedQuestIds,
    completedLessonIds,
    collectedStamps: Array.from(stampsMap.values()),
    collectedBadges: Array.from(badgesMap.values()),
    checkedInPoiIds,
  };
}

/**
 * Validate and save progress for a given user.
 */
export function saveUserProgress(userId: string, data: Partial<UserProgress>): UserProgress {
  const current = getUserProgress(userId);
  const merged = mergeProgressRecords(current, data);

  // Basic sanity validation
  if (merged.xp < 0) merged.xp = 0;
  if (merged.streak < 0) merged.streak = 0;

  progressDb.set(userId, merged);
  return JSON.parse(JSON.stringify(merged));
}

/**
 * Reset user progress to baseline.
 */
export function resetUserProgress(userId: string): UserProgress {
  const fresh: UserProgress = {
    ...initialDefaultProgress,
    lastActiveDate: new Date().toISOString(),
  };
  progressDb.set(userId, fresh);
  return JSON.parse(JSON.stringify(fresh));
}

/**
 * Permanently delete user progress from storage (for GDPR / account deletion).
 */
export function deleteUserProgress(userId: string): boolean {
  return progressDb.delete(userId);
}


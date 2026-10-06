"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Location,
  Quest,
  PassportStamp,
  UserProgress,
  LocalizedText,
  ContentStatus,
  ContentVersion,
  Question,
} from "@/types/content";
import { mockLocations, initialPassportStamps } from "@/data/mockContent";

interface CelebrationState {
  active: boolean;
  type: "quest_complete" | "location_unlocked";
  title: LocalizedText;
  subtitle: LocalizedText;
  stamp?: PassportStamp;
  badgeIcon?: string;
  badgeName?: LocalizedText;
  unlockedLocation?: Location;
  xpEarned: number;
}

interface GameContextType {
  locale: "vi" | "en";
  setLocale: (l: "vi" | "en") => void;
  t: (loc: LocalizedText) => string;
  progress: UserProgress;
  locations: Location[]; // Player-facing: strictly published
  allLocations: Location[]; // CMS-facing: all items including draft / in_review
  currentLocation: Location;
  setCurrentLocation: (loc: Location) => void;
  isLocationUnlocked: (loc: Location) => boolean;
  isQuestCompleted: (questId: string) => boolean;
  completeQuest: (quest: Quest, customXp?: number) => void;
  checkInPoi: (destinationId: string, poiId: string) => void;
  addXp: (amount: number) => void;
  celebration: CelebrationState | null;
  dismissCelebration: () => void;
  resetProgress: () => void;
  getNextLocation: () => Location | undefined;
  getNextQuest: (location: Location) => Quest | undefined;

  // CMS & Content Engine Actions
  versions: ContentVersion[];
  currentVersionNumber: number;
  setAllLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  addQuestToLesson: (
    locationId: string,
    chapterId: string,
    lessonId: string,
    quest: Quest
  ) => void;
  deleteQuest: (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string
  ) => void;
  cloneQuest: (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string
  ) => void;
  reorderQuest: (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string,
    direction: "up" | "down"
  ) => void;
  updateQuestStatus: (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string,
    status: ContentStatus,
    reviewNotes?: string
  ) => void;
  publishContentChanges: (name: string, notes: string) => ContentVersion;
  rollbackToVersion: (versionId: string) => boolean;
  generateAIQuestionDraft: (topic: string, locationName: string) => Question;
}

const STORAGE_KEY = "learntrip_user_progress_v1";
const STORAGE_LOCATIONS_KEY = "learntrip_locations_cms_v3";
const STORAGE_VERSIONS_KEY = "learntrip_content_versions_v3";

const defaultProgress: UserProgress = {
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

const initialVersions: ContentVersion[] = [
  {
    id: "ver-1.0.0",
    version: 1,
    name: "v1.0.0 — Initial MVP Release",
    snapshot: mockLocations,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    notes: "Khởi động phiên bản MVP với Hà Nội, Hạ Long, Hội An và 7 địa danh preview.",
    publishedBy: "Admin / Product Lead",
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

function uniqueLocations(locations: Location[]): Location[] {
  const ids = new Set<string>();
  return locations.filter((location) => {
    if (ids.has(location.id)) return false;
    ids.add(location.id);
    return true;
  });
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<"vi" | "en">("vi");
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [allLocations, setAllLocations] = useState<Location[]>(() => uniqueLocations(mockLocations));
  const [versions, setVersions] = useState<ContentVersion[]>(initialVersions);
  const [isLoaded, setIsLoaded] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  // Load progress and CMS content from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        setProgress((prev) => ({ ...prev, ...JSON.parse(savedProgress) }));
      }

      const savedLocations = localStorage.getItem(STORAGE_LOCATIONS_KEY);
      if (savedLocations) {
        const parsed: Location[] = JSON.parse(savedLocations);
        // Ensure local heroImage and answer images from mockLocations are always applied
        const merged = uniqueLocations(parsed).map((loc) => {
          const fresh = mockLocations.find((m) => m.id === loc.id);
          if (fresh) {
            return {
              ...loc,
              heroImage: fresh.heroImage,
              chapters: fresh.chapters || loc.chapters,
            };
          }
          return loc;
        });
        setAllLocations(merged);
      } else {
        setAllLocations(uniqueLocations(mockLocations));
      }

      const savedVersions = localStorage.getItem(STORAGE_VERSIONS_KEY);
      if (savedVersions) {
        setVersions(JSON.parse(savedVersions));
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(uniqueLocations(allLocations)));
        localStorage.setItem(STORAGE_VERSIONS_KEY, JSON.stringify(versions));
      } catch {
        // Storage full or private mode
      }
    }
  }, [progress, allLocations, versions, isLoaded]);

  const t = (loc: LocalizedText): string => {
    return loc[locale] || loc.en || loc.vi || "";
  };

  // Filter player-facing content: strictly published
  const publishedLocations: Location[] = uniqueLocations(allLocations)
    .filter((loc) => loc.status === "published")
    .map((loc) => ({
      ...loc,
      chapters: loc.chapters
        ?.filter((c) => c.status === "published")
        .map((c) => ({
          ...c,
          lessons: c.lessons
            .filter((l) => l.status === "published")
            .map((l) => ({
              ...l,
              quests: l.quests
                .filter((q) => q.status === "published")
                .map((q) => ({
                  ...q,
                  steps: q.steps.filter((s) => s.question.status === "published"),
                })),
            })),
        })),
    }));

  const currentLocation =
    publishedLocations.find((l) => l.id === progress.currentDestinationId) ||
    publishedLocations[0] ||
    mockLocations[0];

  const setCurrentLocation = (loc: Location) => {
    setProgress((prev) => ({
      ...prev,
      currentDestinationId: loc.id,
    }));
  };

  const isLocationUnlocked = (loc: Location): boolean => {
    if (progress.unlockedLocationIds.includes(loc.id)) return true;
    if (loc.unlockRule.type === "initial") return true;
    if (
      loc.unlockRule.type === "previous_location" &&
      loc.unlockRule.targetId &&
      progress.unlockedLocationIds.includes(loc.unlockRule.targetId) &&
      progress.completedQuestIds.length > 0
    ) {
      return true;
    }
    if (
      loc.unlockRule.type === "xp_threshold" &&
      loc.unlockRule.requiredXp &&
      progress.xp >= loc.unlockRule.requiredXp
    ) {
      return true;
    }
    return false;
  };

  const isQuestCompleted = (questId: string): boolean => {
    return progress.completedQuestIds.includes(questId);
  };

  const completeQuest = (quest: Quest, customXp?: number) => {
    const xpToAdd = customXp !== undefined ? customXp : quest.reward.xp;
    const newXp = progress.xp + xpToAdd;
    const questCompletedAlready = progress.completedQuestIds.includes(quest.id);

    const updatedCompletedQuests = questCompletedAlready
      ? progress.completedQuestIds
      : [...progress.completedQuestIds, quest.id];

    // Stamp collection
    const newStamps = [...progress.collectedStamps];
    if (quest.reward.stamp) {
      const alreadyHasStamp = newStamps.some((s) => s.id === quest.reward.stamp?.id);
      if (!alreadyHasStamp) {
        newStamps.push({
          ...quest.reward.stamp,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    // Badge collection
    const newBadges = [...progress.collectedBadges];
    if (quest.reward.badge) {
      const alreadyHasBadge = newBadges.some((b) => b.id === quest.reward.badge?.id);
      if (!alreadyHasBadge) {
        newBadges.push({
          id: quest.reward.badge.id,
          title: quest.reward.badge.title,
          icon: quest.reward.badge.icon,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    // Check newly unlocked locations
    const newlyUnlockedIds = [...progress.unlockedLocationIds];
    let justUnlockedLocation: Location | undefined;

    publishedLocations.forEach((loc) => {
      if (!newlyUnlockedIds.includes(loc.id)) {
        let unlocksNow = false;
        if (loc.unlockRule.type === "previous_location" && loc.unlockRule.targetId) {
          if (newlyUnlockedIds.includes(loc.unlockRule.targetId)) {
            unlocksNow = true;
          }
        }
        if (
          loc.unlockRule.type === "xp_threshold" &&
          loc.unlockRule.requiredXp &&
          newXp >= loc.unlockRule.requiredXp
        ) {
          unlocksNow = true;
        }

        if (unlocksNow) {
          newlyUnlockedIds.push(loc.id);
          if (!justUnlockedLocation) {
            justUnlockedLocation = loc;
          }
        }
      }
    });

    // Auto-advance currentDestinationId to the newly unlocked location
    const nextDestinationId = justUnlockedLocation
      ? justUnlockedLocation.id
      : progress.currentDestinationId;

    setProgress((prev) => ({
      ...prev,
      xp: newXp,
      streak: prev.streak + (questCompletedAlready ? 0 : 1),
      completedQuestIds: updatedCompletedQuests,
      collectedStamps: newStamps,
      collectedBadges: newBadges,
      unlockedLocationIds: newlyUnlockedIds,
      currentDestinationId: nextDestinationId,
    }));

    // Trigger celebration modal
    if (justUnlockedLocation) {
      setCelebration({
        active: true,
        type: "location_unlocked",
        title: {
          vi: `Mở Khóa Thành Công: ${justUnlockedLocation.nameVi}!`,
          en: `Unlocked: ${justUnlockedLocation.nameEn}!`,
        },
        subtitle: {
          vi: `Bạn đã xuất sắc chinh phục thử thách và mở rộng bản đồ phiêu lưu!`,
          en: `You conquered the challenge and expanded your adventure map!`,
        },
        stamp: quest.reward.stamp,
        badgeIcon: quest.reward.badge?.icon,
        badgeName: quest.reward.badge?.title,
        unlockedLocation: justUnlockedLocation,
        xpEarned: xpToAdd,
      });
    } else {
      setCelebration({
        active: true,
        type: "quest_complete",
        title: {
          vi: "Nhiệm Vụ Hoàn Thành Xuất Sắc!",
          en: "Quest Completed Successfully!",
        },
        subtitle: {
          vi: `Chúc mừng bạn đã nhận thêm +${xpToAdd} XP và tem Passport mới!`,
          en: `Congratulations! You earned +${xpToAdd} XP and a new Passport stamp!`,
        },
        stamp: quest.reward.stamp,
        badgeIcon: quest.reward.badge?.icon,
        badgeName: quest.reward.badge?.title,
        xpEarned: xpToAdd,
      });
    }
  };

  const checkInPoi = (destinationId: string, poiId: string) => {
    const checkInId = `${destinationId}:${poiId}`;
    setProgress((prev) => {
      const checkedInPoiIds = prev.checkedInPoiIds || [];
      if (checkedInPoiIds.includes(checkInId)) return prev;
      return {
        ...prev,
        checkedInPoiIds: [...checkedInPoiIds, checkInId],
      };
    });
  };

  const addXp = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
  };

  const dismissCelebration = () => {
    // If a location was unlocked via this celebration, ensure we're already on it
    if (celebration?.unlockedLocation) {
      setProgress((prev) => ({
        ...prev,
        currentDestinationId: celebration.unlockedLocation!.id,
      }));
    }
    setCelebration(null);
  };

  // Helper: get the next location in sequence after the current one
  const getNextLocation = (): Location | undefined => {
    const currentIdx = publishedLocations.findIndex(
      (l) => l.id === progress.currentDestinationId
    );
    if (currentIdx >= 0 && currentIdx < publishedLocations.length - 1) {
      return publishedLocations[currentIdx + 1];
    }
    return undefined;
  };

  // Helper: get the first uncompleted quest of a location
  const getNextQuest = (location: Location): Quest | undefined => {
    for (const chapter of location.chapters || []) {
      if (chapter.status !== "published") continue;
      for (const lesson of chapter.lessons || []) {
        if (lesson.status !== "published") continue;
        for (const quest of lesson.quests || []) {
          if (quest.status !== "published") continue;
          if (!progress.completedQuestIds.includes(quest.id)) {
            return quest;
          }
        }
      }
    }
    return undefined;
  };

  const resetProgress = () => {
    setProgress({
      xp: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      currentDestinationId: "loc-hanoi",
      unlockedLocationIds: ["loc-hanoi"],
      completedQuestIds: [],
      completedLessonIds: [],
      collectedStamps: [],
      collectedBadges: [],
      checkedInPoiIds: [],
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  // ----------------------------------------------------------------
  // CMS ACTIONS (Content Creator, Reviewer, Admin)
  // ----------------------------------------------------------------
  const addQuestToLesson = (
    locationId: string,
    chapterId: string,
    lessonId: string,
    quest: Quest
  ) => {
    setAllLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          chapters: loc.chapters?.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              lessons: chap.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                return {
                  ...les,
                  quests: [...les.quests, quest],
                };
              }),
            };
          }),
        };
      })
    );
  };

  const deleteQuest = (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string
  ) => {
    setAllLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          chapters: loc.chapters?.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              lessons: chap.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                return { ...les, quests: les.quests.filter((q) => q.id !== questId) };
              }),
            };
          }),
        };
      })
    );
  };

  const cloneQuest = (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string
  ) => {
    setAllLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          chapters: loc.chapters?.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              lessons: chap.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                const idx = les.quests.findIndex((q) => q.id === questId);
                if (idx === -1) return les;
                const src = les.quests[idx];
                const clone: Quest = {
                  ...src,
                  id: `quest-clone-${Date.now()}`,
                  title: { vi: `${src.title.vi} (Bản sao)`, en: `${src.title.en} (Copy)` },
                  status: "draft",
                  steps: src.steps.map((s) => ({
                    ...s,
                    id: `${s.id}-c${Date.now()}`,
                    question: { ...s.question, id: `${s.question.id}-c${Date.now()}`, status: "draft" as const },
                  })),
                };
                const nq = [...les.quests];
                nq.splice(idx + 1, 0, clone);
                return { ...les, quests: nq };
              }),
            };
          }),
        };
      })
    );
  };

  const reorderQuest = (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string,
    direction: "up" | "down"
  ) => {
    setAllLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          chapters: loc.chapters?.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              lessons: chap.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                const idx = les.quests.findIndex((q) => q.id === questId);
                if (idx === -1) return les;
                const tgt = direction === "up" ? idx - 1 : idx + 1;
                if (tgt < 0 || tgt >= les.quests.length) return les;
                const nq = [...les.quests];
                [nq[idx], nq[tgt]] = [nq[tgt], nq[idx]];
                return { ...les, quests: nq };
              }),
            };
          }),
        };
      })
    );
  };

  const updateQuestStatus = (
    locationId: string,
    chapterId: string,
    lessonId: string,
    questId: string,
    status: ContentStatus,
    reviewNotes?: string
  ) => {
    setAllLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== locationId) return loc;
        return {
          ...loc,
          chapters: loc.chapters?.map((chap) => {
            if (chap.id !== chapterId) return chap;
            return {
              ...chap,
              lessons: chap.lessons.map((les) => {
                if (les.id !== lessonId) return les;
                return {
                  ...les,
                  quests: les.quests.map((q) => {
                    if (q.id !== questId) return q;
                    return {
                      ...q,
                      status,
                      steps: q.steps.map((s) => ({
                        ...s,
                        question: {
                          ...s.question,
                          status,
                          reviewNotes: reviewNotes || s.question.reviewNotes,
                        },
                      })),
                    };
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const publishContentChanges = (name: string, notes: string): ContentVersion => {
    // Promote any APPROVED quests/locations to PUBLISHED
    const publishedSnapshot = uniqueLocations(allLocations).map((loc) => ({
      ...loc,
      status: loc.status === "approved" ? "published" : loc.status,
      chapters: loc.chapters?.map((chap) => ({
        ...chap,
        status: chap.status === "approved" ? "published" : chap.status,
        lessons: chap.lessons.map((les) => ({
          ...les,
          status: les.status === "approved" ? "published" : les.status,
          quests: les.quests.map((q) => ({
            ...q,
            status: q.status === "approved" ? "published" : q.status,
            steps: q.steps.map((s) => ({
              ...s,
              question: {
                ...s.question,
                status: s.question.status === "approved" ? "published" : s.question.status,
              },
            })),
          })),
        })),
      })),
    }));

    setAllLocations(publishedSnapshot);

    const newVersionNumber = versions.length + 1;
    const newVersion: ContentVersion = {
      id: `ver-${newVersionNumber}.0.0`,
      version: newVersionNumber,
      name: name || `v${newVersionNumber}.0.0 — Content Update`,
      snapshot: publishedSnapshot,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      notes,
      publishedBy: "Admin",
    };

    setVersions((prev) => [newVersion, ...prev]);
    return newVersion;
  };

  const rollbackToVersion = (versionId: string): boolean => {
    const target = versions.find((v) => v.id === versionId);
    if (!target) return false;
    setAllLocations(uniqueLocations(target.snapshot));
    return true;
  };

  // AI Content Generator Mock Module adhering to FR-07 & 08-AI-CONTENT.md
  const generateAIQuestionDraft = (topic: string, locationName: string): Question => {
    const uniqueId = `ai-q-${Date.now()}`;
    return {
      id: uniqueId,
      type: "multiple_choice",
      prompt: {
        vi: `Theo văn hóa đặc trưng tại ${locationName}, "${topic}" gắn liền với giá trị nào?`,
        en: `In the cultural heritage of ${locationName}, what is "${topic}" best known for?`,
      },
      subPrompt: {
        vi: "Câu hỏi được tạo bởi AI Content Generator — Vui lòng review trước khi Approve.",
        en: "Generated by AI Content Generator — Human review required before approval.",
      },
      options: [
        {
          id: "opt-ai-1",
          text: {
            vi: `Biểu tượng di sản văn hóa truyền thống`,
            en: `Traditional cultural heritage symbol`,
          },
        },
        {
          id: "opt-ai-2",
          text: {
            vi: `Đặc sản hiện đại mới du nhập`,
            en: `Modern imported novelty`,
          },
        },
        {
          id: "opt-ai-3",
          text: {
            vi: `Công trình kiến trúc công nghiệp`,
            en: `Industrial architectural complex`,
          },
        },
        {
          id: "opt-ai-4",
          text: {
            vi: `Lễ hội đường phố ngẫu hứng`,
            en: `Spontaneous street festival`,
          },
        },
      ],
      correctAnswer: "opt-ai-1",
      explanation: {
        vi: `Chính xác! "${topic}" là nét đẹp văn hóa truyền thống tiêu biểu được gìn giữ qua nhiều thế hệ tại ${locationName}.`,
        en: `Correct! "${topic}" represents cherished cultural values passed down through generations in ${locationName}.`,
      },
      difficulty: 2,
      status: "draft",
      generatedByAI: true,
      generationModel: "LearnTrip-Content-AI-v1",
      reviewNotes: "Chờ Reviewer kiểm chứng dữ liệu lịch sử và ngôn ngữ.",
    };
  };

  return (
    <GameContext.Provider
      value={{
        locale,
        setLocale,
        t,
        progress,
        locations: publishedLocations, // strictly published to players
        allLocations, // all items for CMS
        currentLocation,
        setCurrentLocation,
        isLocationUnlocked,
        isQuestCompleted,
        completeQuest,
        checkInPoi,
        addXp,
        celebration,
        dismissCelebration,
        resetProgress,
        getNextLocation,
        getNextQuest,

        // CMS
        versions,
        currentVersionNumber: versions.length,
        setAllLocations,
        addQuestToLesson,
        deleteQuest,
        cloneQuest,
        reorderQuest,
        updateQuestStatus,
        publishContentChanges,
        rollbackToVersion,
        generateAIQuestionDraft,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

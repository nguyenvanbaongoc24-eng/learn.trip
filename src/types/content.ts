export type ContentStatus = "draft" | "in_review" | "approved" | "published" | "archived";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type QuestionType =
  | "multiple_choice"
  | "picture_match"
  | "fill_blank"
  | "listen_select"
  | "match_pair"
  | "word_order"
  | "dialogue_select"
  | "true_false"
  | "word_builder"
  | "listen_choose"
  | "location_hunt";

export interface LocalizedText {
  vi: string;
  en: string;
  ko?: string;
  ja?: string;
  zh?: string;
}

export interface QuestionOption {
  id: string;
  text: LocalizedText;
  image?: string;
  audio?: string;
  icon?: string;
  matchedPairId?: string;
}

export interface QuestionMedia {
  type: "image" | "audio" | "icon";
  url: string;
  alt?: string | LocalizedText;
}

export interface Question {
  id: string;
  type: QuestionType;
  landmarkId?: string;
  prompt: LocalizedText;
  subPrompt?: LocalizedText;
  media?: QuestionMedia;
  options?: QuestionOption[];
  correctAnswer: string | string[]; // Single ID or array of IDs/letters
  explanation?: LocalizedText;
  hint?: LocalizedText;
  difficulty: number; // 1 to 5
  cefrLevel?: CEFRLevel;
  topicTags?: string[];
  status: ContentStatus;
  generatedByAI?: boolean;
  generationModel?: string;
  factCheckNeeded?: boolean;
  reviewNotes?: string;
  createdBy?: string;
  updatedAt?: string;
  version?: number;
  resultMedia?: {
    url: string;
    caption?: LocalizedText;
  };
  // Specific configurations for question types
  wordBuilderConfig?: {
    targetWord: string;
    scrambledLetters: string[];
    hintVi?: string;
  };
  fillBlankConfig?: {
    sentenceWithBlank: string;
    acceptableAnswers: string[];
  };
  wordOrderConfig?: {
    words: string[];
    correctSequence: string[];
  };
}

export interface VocabItem {
  id: string;
  landmarkId: string;
  word: string;
  ipa: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "adverb" | "phrase";
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  image?: string;
  audio?: string;
  level: CEFRLevel;
  tags: string[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  speakerAvatar?: string;
  textEn: string;
  textVi: string;
  audioUrl?: string;
}

export interface Dialogue {
  id: string;
  landmarkId: string;
  title: LocalizedText;
  contextDescription: LocalizedText;
  level: CEFRLevel;
  lines: DialogueLine[];
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: LocalizedText;
  tags: string[];
  source: string; // 'Wikimedia Commons' | 'Unsplash' | 'User Upload'
  author?: string;
  license?: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  landmarkId?: string;
  createdAt: string;
}

export type UserRole = "admin" | "reviewer" | "creator";

export interface ReviewComment {
  id: string;
  itemId: string;
  author: string;
  role: UserRole;
  comment: string;
  createdAt: string;
}

export interface ContentVersion {
  id: string;
  version: number;
  name: string;
  snapshot: Location[];
  createdAt: string;
  publishedAt?: string;
  notes: string;
  publishedBy: string;
}

export interface QuestStep {
  id: string;
  questId: string;
  order: number;
  question: Question;
}

export interface Reward {
  xp: number;
  badge?: {
    id: string;
    title: LocalizedText;
    icon: string;
    description: LocalizedText;
  };
  stamp?: PassportStamp;
  collectible?: {
    id: string;
    name: LocalizedText;
    icon: string;
    rarity: "common" | "rare" | "legendary";
  };
}

export interface Quest {
  id: string;
  lessonId: string;
  locationId?: string;
  title: LocalizedText;
  description: LocalizedText;
  order: number;
  steps: QuestStep[];
  reward: Reward;
  status: ContentStatus;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: LocalizedText;
  description: LocalizedText;
  estimatedMinutes: number;
  order: number;
  quests: Quest[];
  status: ContentStatus;
}

export interface Chapter {
  id: string;
  locationId: string;
  title: LocalizedText;
  description: LocalizedText;
  order: number;
  difficulty: "explorer" | "adventurer";
  lessons: Lesson[];
  status: ContentStatus;
}

export type LocationCategory = "culture" | "nature" | "food" | "history" | "beach" | "adventure";

export interface UnlockRule {
  type: "initial" | "previous_location" | "xp_threshold" | "previous_quest";
  targetId?: string;
  requiredXp?: number;
}

export interface PassportStamp {
  id: string;
  locationId: string;
  title: LocalizedText;
  category: LocationCategory;
  symbol: string; // emoji or icon
  landmark: LocalizedText;
  unlockedAt?: string;
}

export interface Location {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  tagline: LocalizedText;
  description: LocalizedText;
  category: LocationCategory[];
  region: "north" | "central" | "south";
  mapPosition: { x: number; y: number }; // percentage coordinates (0-100) for positioning on Vietnam Map
  unlockRule: UnlockRule;
  status: ContentStatus;
  isPlayableInMvp: boolean;
  heroImage: string;
  accentColor: string;
  iconEmoji: string;
  facts: LocalizedText[];
  chapters?: Chapter[];
  stamps?: PassportStamp[];
}

export interface ContentPack {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: ContentStatus;
  language: string;
  version: number;
  locations: Location[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastActiveDate: string;
  currentDestinationId: string;
  unlockedLocationIds: string[];
  completedQuestIds: string[];
  completedLessonIds: string[];
  collectedStamps: PassportStamp[];
  collectedBadges: Array<{
    id: string;
    title: LocalizedText;
    icon: string;
    unlockedAt: string;
  }>;
  checkedInPoiIds: string[];
}

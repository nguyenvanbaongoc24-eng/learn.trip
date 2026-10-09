// Mentor types for Learn.Trip
// Dual-mode guidance: 'guided' (primary school / tiểu học) vs 'light' (middle school / THCS)

export type MentorMode = "guided" | "light";

export type MentorMood =
  | "happy"
  | "cheering"
  | "waving"
  | "thinking"
  | "sleeping"
  | "pointing";

export type BubblePlacement = "top" | "bottom" | "left" | "right" | "center";

export type StepWaitAction = "click_target" | "next_button" | "custom";

export interface MentorStep {
  id: string;
  /** CSS selector to spotlight (e.g. "#continue-journey-btn", "[data-tour='explore']"). Empty for center dialog. */
  targetSelector?: string;
  /** Main title displayed in dialogue bubble */
  title: string | { vi: string; en: string };
  /** Body message (concise, max ~12 words per bubble for kids) */
  message: string | { vi: string; en: string };
  /** Vietnamese spoken text for Web Speech API TTS (defaults to message if omitted) */
  voiceText?: string | { vi: string; en: string };
  /** Preferred bubble position relative to target */
  placement?: BubblePlacement;
  /** Kim Quy mascot mood */
  mood?: MentorMood;
  /** Applicable mode ('guided', 'light', or 'both') */
  mode?: "guided" | "light" | "both";
  /** How to advance to the next step */
  waitFor?: StepWaitAction;
  /** Label for action button (e.g. 'Tiếp tục', 'Khám phá ngay') */
  actionLabel?: string | { vi: string; en: string };
  /** Can user skip this step (in guided mode, skip is restricted) */
  canSkip?: boolean;
}

export interface MentorTourDef {
  id: string;
  name: string;
  steps: MentorStep[];
}

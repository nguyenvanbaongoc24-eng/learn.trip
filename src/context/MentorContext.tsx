"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { MentorMode, MentorMood, MentorStep, MentorTourDef } from "@/lib/mentor/mentorTypes";
import { initialWelcomeTour, screenHelpMessages } from "@/lib/mentor/mentorSteps";
import { mentorAudio } from "@/lib/mentor/mentorAudio";
import { sounds } from "@/utils/soundEffects";

interface HelpModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface MentorContextType {
  mode: MentorMode;
  setMode: (mode: MentorMode) => void;
  voiceEnabled: boolean;
  toggleVoice: () => void;
  mood: MentorMood;
  setMood: (mood: MentorMood) => void;
  isTourActive: boolean;
  currentTour: MentorTourDef | null;
  currentStepIndex: number;
  currentStep: MentorStep | null;
  isNudging: boolean;
  startTour: (tour?: MentorTourDef) => void;
  nextStep: () => void;
  skipTour: () => void;
  triggerScreenHelp: (screenKey: string) => void;
  helpModal: HelpModalState;
  closeHelpModal: () => void;
  hasCompletedWelcome: boolean;
  resetMentorOnboarding: () => void;
}

const MentorContext = createContext<MentorContextType | null>(null);

const STORAGE_MODE_KEY = "learntrip_mentor_mode_v2";
const STORAGE_VOICE_KEY = "learntrip_mentor_voice_v2";
const STORAGE_TOUR_DONE_KEY = "learntrip_mentor_welcome_done_v2";

export function MentorProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<MentorMode>("guided");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [mood, setMood] = useState<MentorMood>("happy");
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState<boolean>(true); // default true until client checks
  const [currentTour, setCurrentTour] = useState<MentorTourDef | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNudging, setIsNudging] = useState<boolean>(false);
  const [helpModal, setHelpModal] = useState<HelpModalState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = (localStorage.getItem(STORAGE_MODE_KEY) as MentorMode) || "guided";
      const savedVoice = localStorage.getItem(STORAGE_VOICE_KEY) !== "false";
      const savedDone = localStorage.getItem(STORAGE_TOUR_DONE_KEY) === "true";

      setModeState(savedMode);
      setVoiceEnabled(savedVoice);
      setHasCompletedWelcome(savedDone);
      mentorAudio.setMuted(!savedVoice);

      // Auto start welcome tour for first-time visitors after a brief entrance delay
      if (!savedDone) {
        const timer = setTimeout(() => {
          setCurrentTour(initialWelcomeTour);
          setCurrentStepIndex(0);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const setMode = useCallback((newMode: MentorMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
    // Guided mode turns on voice by default; Light mode turns off voice by default
    const defaultVoice = newMode === "guided";
    setVoiceEnabled(defaultVoice);
    localStorage.setItem(STORAGE_VOICE_KEY, String(defaultVoice));
    mentorAudio.setMuted(!defaultVoice);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_VOICE_KEY, String(next));
      mentorAudio.setMuted(!next);
      return next;
    });
  }, []);

  const currentStep = currentTour ? currentTour.steps[currentStepIndex] || null : null;

  // Read voice whenever currentStep changes and voice is on
  useEffect(() => {
    if (!currentStep) {
      mentorAudio.stop();
      return;
    }

    setMood(currentStep.mood || "happy");
    setIsNudging(false);

    if (voiceEnabled) {
      const textToSpeak =
        typeof currentStep.voiceText === "object"
          ? currentStep.voiceText.vi
          : currentStep.voiceText ||
            (typeof currentStep.message === "object"
              ? currentStep.message.vi
              : currentStep.message);

      mentorAudio.speak(textToSpeak);
    }

    return () => {
      mentorAudio.stop();
    };
  }, [currentStep, voiceEnabled]);

  // Inactivity detection: after 9s (guided) or 15s (light), mascot nudges the user
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setIsNudging(false);

    const timeout = mode === "guided" ? 9000 : 15000;
    inactivityTimerRef.current = setTimeout(() => {
      if (currentTour) {
        setIsNudging(true);
        sounds.playClick();
      }
    }, timeout);
  }, [mode, currentTour]);

  useEffect(() => {
    const handleUserAction = () => {
      resetInactivityTimer();
    };

    window.addEventListener("pointerdown", handleUserAction);
    window.addEventListener("keydown", handleUserAction);
    resetInactivityTimer();

    return () => {
      window.removeEventListener("pointerdown", handleUserAction);
      window.removeEventListener("keydown", handleUserAction);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  const startTour = useCallback((tour: MentorTourDef = initialWelcomeTour) => {
    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsNudging(false);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    sounds.playClick();
    if (currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Tour completed
      setCurrentTour(null);
      setHasCompletedWelcome(true);
      localStorage.setItem(STORAGE_TOUR_DONE_KEY, "true");
      sounds.playVictory();
    }
  }, [currentTour, currentStepIndex]);

  const skipTour = useCallback(() => {
    setCurrentTour(null);
    setHasCompletedWelcome(true);
    localStorage.setItem(STORAGE_TOUR_DONE_KEY, "true");
    mentorAudio.stop();
  }, []);

  const triggerScreenHelp = useCallback(
    (screenKey: string) => {
      sounds.playClick();
      const help = screenHelpMessages[screenKey] || {
        title: { vi: "Trợ giúp từ Kim Quy 🐢", en: "Kim Quy Help 🐢" },
        message: {
          vi: "Hãy khám phá và hoàn thành các bài học thú vị để nâng cấp độ thám hiểm nhé!",
          en: "Explore destinations and complete lessons to level up your explorer status!",
        },
      };

      setHelpModal({
        isOpen: true,
        title: help.title.vi,
        message: help.message.vi,
      });

      if (voiceEnabled) {
        mentorAudio.speak(help.message.vi);
      }
    },
    [voiceEnabled]
  );

  const closeHelpModal = useCallback(() => {
    setHelpModal((prev) => ({ ...prev, isOpen: false }));
    mentorAudio.stop();
  }, []);

  const resetMentorOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_TOUR_DONE_KEY);
    setHasCompletedWelcome(false);
    startTour(initialWelcomeTour);
  }, [startTour]);

  return (
    <MentorContext.Provider
      value={{
        mode,
        setMode,
        voiceEnabled,
        toggleVoice,
        mood,
        setMood,
        isTourActive: !!currentTour,
        currentTour,
        currentStepIndex,
        currentStep,
        isNudging,
        startTour,
        nextStep,
        skipTour,
        triggerScreenHelp,
        helpModal,
        closeHelpModal,
        hasCompletedWelcome,
        resetMentorOnboarding,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
}

export function useMentor() {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error("useMentor must be used within a MentorProvider");
  }
  return context;
}

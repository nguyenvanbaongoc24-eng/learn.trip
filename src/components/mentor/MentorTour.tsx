"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useMentor } from "@/context/MentorContext";
import { MentorOverlay } from "./MentorOverlay";
import { MentorDialogBubble } from "./MentorDialogBubble";

export function MentorTour() {
  const {
    isTourActive,
    currentStep,
    mode,
    setMode,
    mood,
    isNudging,
    voiceEnabled,
    toggleVoice,
    nextStep,
    skipTour,
  } = useMentor();

  if (!isTourActive || !currentStep) return null;

  const handleTargetClick = () => {
    // If the step is waiting for target click or is clickable
    nextStep();
  };

  const handleSelectMode = (selectedMode: "guided" | "light") => {
    setMode(selectedMode);
    nextStep();
  };

  return (
    <AnimatePresence>
      <div className="mentor-tour-root">
        {/* Spotlight Overlay & Beacon */}
        <MentorOverlay
          step={currentStep}
          mode={mode}
          isNudging={isNudging}
          onTargetClick={handleTargetClick}
        />

        {/* Mascot Dialogue Bubble */}
        <MentorDialogBubble
          step={currentStep}
          mode={mode}
          mood={mood}
          isNudging={isNudging}
          voiceEnabled={voiceEnabled}
          onToggleVoice={toggleVoice}
          onNext={nextStep}
          onSkip={skipTour}
          onSelectMode={handleSelectMode}
        />
      </div>
    </AnimatePresence>
  );
}

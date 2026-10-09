"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MentorStep, MentorMode } from "@/lib/mentor/mentorTypes";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface MentorOverlayProps {
  step: MentorStep | null;
  mode: MentorMode;
  isNudging: boolean;
  onTargetClick?: () => void;
}

export function MentorOverlay({
  step,
  mode,
  isNudging,
  onTargetClick,
}: MentorOverlayProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const padding = 10; // Padding around highlighted element
  const borderRadius = 20;

  const updateRect = () => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      return;
    }

    try {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: Math.max(0, rect.top - padding),
          left: Math.max(0, rect.left - padding),
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          bottom: rect.bottom + padding,
          right: rect.right + padding,
        });

        // Ensure element is visible in viewport
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        setTargetRect(null);
      }
    } catch {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    updateRect();
    const handleResizeOrScroll = () => {
      updateRect();
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    const timer = setTimeout(updateRect, 100);

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      clearTimeout(timer);
    };
  }, [step?.targetSelector]);

  if (!step) return null;

  // In center placement (no target element)
  if (!step.targetSelector || !targetRect) {
    return (
      <div className="fixed inset-0 z-55 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto" />
    );
  }

  return (
    <div className="fixed inset-0 z-55 pointer-events-none overflow-hidden">
      {/* SVG Spotlight Cutout Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="mentor-spotlight-mask">
            {/* White covers everywhere (opaque backdrop) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cut-out hole over the spotlight target */}
            <rect
              x={targetRect.left}
              y={targetRect.top}
              width={targetRect.width}
              height={targetRect.height}
              rx={borderRadius}
              fill="black"
            />
          </mask>
        </defs>

        {/* Shaded backdrop rectangle with mask applied */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.75)"
          mask="url(#mentor-spotlight-mask)"
          className="transition-opacity duration-300 backdrop-blur-[1px]"
        />
      </svg>

      {/* Target Click Catcher & Highlighter Ring */}
      <div
        style={{
          position: "fixed",
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          borderRadius: `${borderRadius}px`,
        }}
        onClick={onTargetClick}
        className={`pointer-events-auto cursor-pointer border-3 transition-all ${
          isNudging
            ? "border-amber-400 ring-6 ring-amber-400/50 scale-102 animate-pulse"
            : "border-amber-400/80 ring-4 ring-amber-400/30 shadow-2xl"
        }`}
      />

      {/* Bouncing Hand Pointer Indicator */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          position: "fixed",
          top: Math.max(10, targetRect.top - 54),
          left: Math.max(10, targetRect.left + targetRect.width / 2 - 24),
        }}
        className="pointer-events-none z-60 text-4xl filter drop-shadow-lg flex flex-col items-center animate-bounce select-none"
      >
        <span className="rotate-90">👉</span>
      </motion.div>
    </div>
  );
}

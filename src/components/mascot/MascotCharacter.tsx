"use client";

import React from "react";
import { motion } from "framer-motion";
import { springs } from "@/lib/design/tokens";

export type MascotMood = "happy" | "cheering" | "thinking" | "encouraging" | "waving";

interface MascotCharacterProps {
  mood?: MascotMood;
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  speechText?: string;
}

const sizeMap = {
  sm: 64,
  md: 96,
  lg: 140,
  xl: 190,
};

export function MascotCharacter({
  mood = "happy",
  size = "md",
  className = "",
  speechText,
}: MascotCharacterProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  // Head and body animations depending on mood
  const headBob = {
    happy: {
      y: [0, -3, 0],
      rotate: [0, 2, -2, 0],
      transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" as const },
    },
    cheering: {
      y: [-2, -8, -2],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" as const },
    },
    thinking: {
      rotate: [-3, 3, -3],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
    },
    encouraging: {
      y: [0, -2, 0],
      rotate: [0, 1, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const },
    },
    waving: {
      rotate: [0, 3, -2, 0],
      transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" as const },
    },
  }[mood];

  const leftHand = {
    cheering: {
      rotate: [-20, -50, -20],
      transition: { repeat: Infinity, duration: 0.6 },
    },
    waving: {
      rotate: [-10, -45, -10],
      transition: { repeat: Infinity, duration: 0.8 },
    },
    thinking: {
      y: -4,
      rotate: -15,
    },
    happy: { rotate: 0 },
    encouraging: { rotate: -10 },
  }[mood];

  const rightHand = {
    cheering: {
      rotate: [20, 50, 20],
      transition: { repeat: Infinity, duration: 0.6 },
    },
    happy: { rotate: 0 },
    thinking: { rotate: 0 },
    encouraging: { rotate: 10 },
    waving: { rotate: 0 },
  }[mood];

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      {speechText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springs.bouncy}
          className="mb-2 relative bg-white border-2 border-amber-300 text-slate-800 px-3.5 py-1.5 rounded-2xl shadow-md text-xs font-black max-w-[200px] text-center"
        >
          {speechText}
          {/* Arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-300" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white" />
        </motion.div>
      )}

      {/* Rùa Vàng Kim Quy SVG Graphic */}
      <motion.svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={headBob}
        className="drop-shadow-lg select-none"
      >
        {/* Shadow */}
        <ellipse cx="60" cy="112" rx="36" ry="6" fill="#000000" fillOpacity="0.12" />

        {/* Back Feet */}
        <circle cx="34" cy="95" r="10" fill="#EAB308" stroke="#CA8A04" strokeWidth="2.5" />
        <circle cx="86" cy="95" r="10" fill="#EAB308" stroke="#CA8A04" strokeWidth="2.5" />

        {/* Left Arm / Hand */}
        <motion.g animate={leftHand} style={{ originX: "28px", originY: "75px" }}>
          <ellipse cx="22" cy="72" rx="9" ry="6" transform="rotate(-25 22 72)" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
        </motion.g>

        {/* Right Arm / Hand */}
        <motion.g animate={rightHand} style={{ originX: "92px", originY: "75px" }}>
          <ellipse cx="98" cy="72" rx="9" ry="6" transform="rotate(25 98 72)" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
        </motion.g>

        {/* Turtle Shell (Main Back) */}
        <ellipse cx="60" cy="75" rx="40" ry="32" fill="#15803D" stroke="#166534" strokeWidth="3" />
        {/* Shell Segments / Patterns (Emerald Green) */}
        <ellipse cx="60" cy="74" rx="34" ry="26" fill="#22C55E" />
        {/* Shell Hexagon Plates */}
        <path
          d="M 60 56 L 72 63 L 72 75 L 60 82 L 48 75 L 48 63 Z"
          fill="#16A34A"
          stroke="#15803D"
          strokeWidth="2"
        />
        <path d="M 60 56 L 60 48" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M 72 63 L 84 59" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M 72 75 L 86 80" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M 60 82 L 60 92" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M 48 75 L 34 80" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
        <path d="M 48 63 L 36 59" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />

        {/* Belly / Front Chest (Golden) */}
        <ellipse cx="60" cy="80" rx="22" ry="18" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />

        {/* Head */}
        <ellipse cx="60" cy="45" rx="22" ry="19" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />

        {/* Cute Cheeks */}
        <circle cx="45" cy="50" r="4" fill="#F87171" fillOpacity="0.45" />
        <circle cx="75" cy="50" r="4" fill="#F87171" fillOpacity="0.45" />

        {/* Eyes based on Mood */}
        {mood === "cheering" ? (
          // Happy squinting curves ^_^
          <>
            <path d="M 48 42 Q 52 36 56 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 64 42 Q 68 36 72 42" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : mood === "encouraging" ? (
          // Sweet gentle eyes
          <>
            <circle cx="51" cy="42" r="4" fill="#1E293B" />
            <circle cx="52" cy="40.5" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="42" r="4" fill="#1E293B" />
            <circle cx="70" cy="40.5" r="1.5" fill="#FFFFFF" />
            <path d="M 46 36 Q 50 37 54 39" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 74 36 Q 70 37 66 39" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === "thinking" ? (
          // Looking up / to the side
          <>
            <circle cx="51" cy="40" r="4" fill="#1E293B" />
            <circle cx="52.5" cy="38.5" r="1.5" fill="#FFFFFF" />
            <circle cx="69" cy="40" r="4" fill="#1E293B" />
            <circle cx="70.5" cy="38.5" r="1.5" fill="#FFFFFF" />
            {/* One raised eyebrow */}
            <path d="M 47 34 Q 52 33 56 36" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </>
        ) : (
          // Standard big sparkling eyes
          <>
            <circle cx="51" cy="42" r="4.5" fill="#1E293B" />
            <circle cx="52.5" cy="40" r="1.8" fill="#FFFFFF" />
            <circle cx="50" cy="43.5" r="0.8" fill="#FFFFFF" />
            <circle cx="69" cy="42" r="4.5" fill="#1E293B" />
            <circle cx="70.5" cy="40" r="1.8" fill="#FFFFFF" />
            <circle cx="68" cy="43.5" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* Mouth */}
        {mood === "cheering" ? (
          // Big joyful open mouth :D
          <path d="M 54 50 Q 60 59 66 50 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
        ) : mood === "encouraging" ? (
          // Warm gentle smile :)
          <path d="M 55 52 Q 60 56 65 52" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : mood === "thinking" ? (
          // Small thoughtful pucker
          <circle cx="60" cy="52" r="2.5" fill="#92400E" />
        ) : (
          // Cheerful open smile
          <path d="M 55 50 Q 60 57 65 50" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        )}

        {/* Traditional Nón Lá (Vietnamese Conical Hat) on Head */}
        <g id="non-la">
          <polygon
            points="60,10 32,32 88,32"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="2"
          />
          {/* Hat texture rings */}
          <line x1="42" y1="24" x2="78" y2="24" stroke="#FBBF24" strokeWidth="1.2" />
          <line x1="49" y1="18" x2="71" y2="18" stroke="#FBBF24" strokeWidth="1.2" />
          {/* Red ribbon band */}
          <path d="M 32 32 Q 60 35 88 32" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Ribbon hanging tails */}
          <path d="M 36 34 Q 34 44 38 52" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </motion.svg>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { MentorStep, MentorMode, MentorMood } from "@/lib/mentor/mentorTypes";
import { MascotCharacter } from "@/components/mascot/MascotCharacter";
import { SquishButton } from "@/components/ui/SquishButton";
import { Volume2, VolumeX, X, ArrowRight, Sparkles, Check, Users } from "lucide-react";
import { mentorAudio } from "@/lib/mentor/mentorAudio";

interface MentorDialogBubbleProps {
  step: MentorStep;
  mode: MentorMode;
  mood: MentorMood;
  isNudging: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onSelectMode?: (selectedMode: MentorMode) => void;
}

export function MentorDialogBubble({
  step,
  mode,
  mood,
  isNudging,
  voiceEnabled,
  onToggleVoice,
  onNext,
  onSkip,
  onSelectMode,
}: MentorDialogBubbleProps) {
  const isPickModeStep = step.id === "step-pick-mode";

  const titleText =
    typeof step.title === "object" ? step.title.vi : step.title;
  const messageText =
    typeof step.message === "object" ? step.message.vi : step.message;
  const actionLabel =
    typeof step.actionLabel === "object"
      ? step.actionLabel.vi
      : step.actionLabel || "Tiếp tục";

  const handleReplayVoice = () => {
    const textToSpeak =
      typeof step.voiceText === "object"
        ? step.voiceText.vi
        : step.voiceText || messageText;
    mentorAudio.speak(textToSpeak);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`fixed z-60 w-[calc(100vw-2rem)] max-w-lg p-5 sm:p-6 bg-white rounded-3xl border-4 border-amber-300 shadow-2xl transition-all ${
        step.placement === "top"
          ? "bottom-24 left-1/2 -translate-x-1/2"
          : step.placement === "bottom"
          ? "top-20 left-1/2 -translate-x-1/2"
          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      } ${isNudging ? "animate-bounce" : ""}`}
    >
      {/* Top Header: Mascot + Audio Controls + Skip (in light mode) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 -mt-2 -ml-2">
            <MascotCharacter
              mood={mood}
              size={64}
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-black uppercase rounded-full">
              <Sparkles className="w-3 h-3 fill-amber-500" />
              Thần Rùa Kim Quy
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-snug mt-0.5">
              {titleText}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!voiceEnabled) onToggleVoice();
              handleReplayVoice();
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              voiceEnabled
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
            }`}
            title={voiceEnabled ? "Nghe lại lời thoại" : "Bật giọng nói"}
          >
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          {mode === "light" && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Bỏ qua hướng dẫn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message Text (Large ≥ 18px for kids) */}
      {!isPickModeStep && (
        <p className="text-base sm:text-lg text-slate-700 font-bold leading-relaxed mb-5 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
          {messageText}
        </p>
      )}

      {/* Mode Selection Cards (When on pick mode step) */}
      {isPickModeStep && (
        <div className="space-y-3 my-4">
          <button
            type="button"
            onClick={() => onSelectMode?.("guided")}
            className="w-full p-4 rounded-2xl border-3 border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100/60 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🎒</span>
              <div>
                <div className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>Lớp 1 – 5</span>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-full uppercase">
                    Dẫn đường
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  Giọng đọc to, hướng dẫn từng bước dễ hiểu
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => onSelectMode?.("light")}
            className="w-full p-4 rounded-2xl border-3 border-sky-400 bg-sky-50/60 hover:bg-sky-100/60 transition-all text-left flex items-center justify-between group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>Lớp 6 – 9</span>
                  <span className="px-2 py-0.5 bg-sky-200 text-sky-900 text-[10px] font-black rounded-full uppercase">
                    Gợi ý nhẹ
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">
                  Tự do khám phá, gợi ý nhanh, không dài dòng
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Action Button */}
      {!isPickModeStep && (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          {mode === "light" && onSkip && (
            <SquishButton
              variant="slate"
              size="md"
              onClick={onSkip}
            >
              Bỏ qua
            </SquishButton>
          )}

          <SquishButton
            variant="amber"
            size="lg"
            fullWidth={mode === "guided"}
            onClick={onNext}
            iconRight={<ArrowRight className="w-5 h-5" />}
          >
            {actionLabel}
          </SquishButton>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Quest } from "@/types/content";
import { useGame } from "@/context/GameContext";
import { QuestionRenderer } from "./QuestionRenderer";
import { X, Trophy, Flame, Heart, Star, Sparkles, Volume2, ArrowRight, CheckCircle2, Globe } from "lucide-react";
import { sounds } from "@/utils/soundEffects";

interface QuestModalProps {
  quest: Quest;
  onClose: () => void;
  onOpen3D?: (locationId?: string) => void;
}

export function QuestModal({ quest, onClose, onOpen3D }: QuestModalProps) {
  const { t, locale, completeQuest, currentLocation, locations } = useGame();
  
  const questTargetLocation = useMemo(() => {
    if (quest.locationId) {
      const found = locations.find((l) => l.id === quest.locationId);
      if (found) return found;
    }
    for (const loc of locations) {
      for (const ch of loc.chapters || []) {
        for (const ls of ch.lessons || []) {
          if (ls.quests?.some((q) => q.id === quest.id)) {
            return loc;
          }
        }
      }
    }
    return currentLocation;
  }, [locations, quest, currentLocation]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Game Mechanics: Hearts & Combo
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  const steps = quest.steps;
  const currentStep = steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // Speech helper for Vocabulary review
  const speakEnglish = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMistake = () => {
    setHearts((prev) => Math.max(1, prev - 1));
    setMistakesCount((prev) => prev + 1);
    setCombo(0);
  };

  const handleNextStep = () => {
    // Increment combo
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo > maxCombo) {
      setMaxCombo(newCombo);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps!
      setIsCompleted(true);
      sounds.playVictory();
      
      // Calculate bonus XP
      const bonusXp = (hearts === 3 ? 30 : 10) + (maxCombo >= 2 ? 20 : 0);
      completeQuest(quest, quest.reward.xp + bonusXp);
    }
  };

  // Extract vocabulary words from the quest questions for the review notebook
  const vocabularyList = steps.map((s) => {
    const q = s.question;
    let word = q.prompt.en || "";
    if (q.type === "word_builder" && q.correctAnswer) {
      word = String(q.correctAnswer);
    } else if (q.options && q.correctAnswer) {
      const correctOpt = q.options.find((o) => o.id === q.correctAnswer);
      if (correctOpt) {
        word = correctOpt.text.en;
      }
    }
    return {
      id: s.id,
      word,
      meaningVi: q.resultMedia?.caption?.vi || q.explanation?.vi || q.prompt.vi,
      imageUrl: q.resultMedia?.url,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Top Header with Landmark Scenic Backdrop */}
        <div className="relative px-6 py-5 overflow-hidden text-white flex items-center justify-between">
          {/* Background image of the landmark */}
          <img
            src={currentLocation?.heroImage || "/assets/locations/hanoi.jpg"}
            alt={currentLocation?.nameVi || "Landmark"}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Deep dark gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-900/80 to-amber-950/70 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/80 backdrop-blur-md text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1.5">
                <span>{currentLocation?.iconEmoji}</span>
                <span>{currentLocation?.nameVi} • Thám hiểm</span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight text-white drop-shadow-sm">
                {t(quest.title)}
              </h2>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            {/* Combo Streak */}
            {combo > 1 && !isCompleted && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full text-xs font-black shadow-md animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Combo x{combo}</span>
              </div>
            )}

            {/* Explorer Hearts */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              {[1, 2, 3].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all duration-300 ${
                    heartIndex <= hearts
                      ? "text-rose-500 fill-rose-500 scale-100"
                      : "text-slate-500 fill-slate-700/50 scale-90 opacity-40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white backdrop-blur-md cursor-pointer ml-1"
              title="Đóng nhiệm vụ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-100 px-6 py-2.5 flex items-center justify-between gap-4 border-b border-slate-200 text-xs font-bold text-slate-500">
          <div>
            Thử thách {currentStepIndex + 1} / {steps.length}
          </div>
          <div className="flex-1 max-w-xs bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-emerald-700 font-black">{progressPercent}%</div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 md:p-8">
          {!isCompleted ? (
            <QuestionRenderer
              key={currentStep.id}
              question={currentStep.question}
              locale={locale}
              t={t}
              onAnswerCorrect={handleNextStep}
              onMistake={handleMistake}
            />
          ) : (
            /* Comprehensive Lesson Result Screen (per 07-PLAYER-UX.md) */
            <div className="space-y-6 animate-fadeIn py-2">
              {/* Star Rating Banner */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {[1, 2, 3].map((starIndex) => (
                    <div
                      key={starIndex}
                      className={`transition-all duration-500 transform ${
                        starIndex <= (hearts === 3 ? 3 : hearts >= 2 ? 2 : 1)
                          ? "scale-110 text-amber-400 fill-amber-400 drop-shadow-md animate-scaleUp"
                          : "text-slate-300 fill-slate-200 scale-95"
                      }`}
                    >
                      <Star className="w-10 h-10 fill-current" />
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  {hearts === 3
                    ? (locale === "vi" ? "Xuất sắc tuyệt đối! 🌟" : "Flawless Explorer! 🌟")
                    : (locale === "vi" ? "Chúc mừng bạn đã hoàn thành! 🎉" : "Quest Completed! 🎉")}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {locale === "vi"
                    ? `Bạn đã giải mã thành công toàn bộ thử thách tại ${currentLocation?.nameVi}!`
                    : `You successfully conquered every English challenge in ${currentLocation?.nameEn}!`}
                </p>
              </div>

              {/* Reward Score Breakdown Card */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-linear-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center">
                <div className="p-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Điểm XP</div>
                  <div className="text-xl font-black text-amber-600">+{quest.reward.xp + (hearts === 3 ? 30 : 10)} XP</div>
                </div>
                <div className="p-2 border-x border-amber-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Độ chính xác</div>
                  <div className="text-xl font-black text-emerald-600">
                    {Math.round(((steps.length) / (steps.length + mistakesCount)) * 100)}%
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Combo cao nhất</div>
                  <div className="text-xl font-black text-orange-600">x{Math.max(1, maxCombo)} 🔥</div>
                </div>
              </div>

              {/* Vocabulary Notebook (Từ vựng mới đã học) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{locale === "vi" ? "Sổ tay từ vựng vừa chinh phục" : "Vocabulary Notebook"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {vocabularyList.length} {locale === "vi" ? "từ khóa" : "words"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {vocabularyList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-amber-400 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-sm text-slate-900 truncate">
                          {item.word}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {item.meaningVi}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          speakEnglish(item.word);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-amber-600 hover:bg-amber-50 transition-colors shrink-0 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {/* 3D Explore Button linked directly to Quest Location */}
                {onOpen3D && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onOpen3D(quest.locationId || questTargetLocation?.id || currentLocation?.id);
                    }}
                    className="w-full py-3.5 px-8 bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer border-2 border-cyan-400/30"
                  >
                    <Globe className="w-5 h-5" />
                    <span>
                      {locale === "vi"
                        ? `🌏 Khám phá 3D: ${questTargetLocation?.nameVi || "Điểm đến"}`
                        : `🌏 Explore 3D: ${questTargetLocation?.nameEn || "Destination"}`}
                    </span>
                  </button>
                )}

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playStamp();
                    onClose();
                  }}
                  className="w-full py-4 px-8 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{locale === "vi" ? "Nhận thưởng & Tiếp tục hành trình" : "Claim Rewards & Continue"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

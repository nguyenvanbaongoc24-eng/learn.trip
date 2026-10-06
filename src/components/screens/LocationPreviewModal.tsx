"use client";

import React from "react";
import { Location, Quest } from "@/types/content";
import { useGame } from "@/context/GameContext";
import {
  X,
  Lock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Star,
  CheckCircle2,
  Globe,
} from "lucide-react";

interface LocationPreviewModalProps {
  location: Location;
  onClose: () => void;
  onStartQuest: (quest: Quest) => void;
  onOpen3D?: (locationId: string) => void;
}

export function LocationPreviewModal({
  location,
  onClose,
  onStartQuest,
  onOpen3D,
}: LocationPreviewModalProps) {
  const {
    t,
    locale,
    isLocationUnlocked,
    isQuestCompleted,
    setCurrentLocation,
  } = useGame();

  const isUnlocked = isLocationUnlocked(location);
  const chapters = location.chapters || [];
  const primaryChapter = chapters[0];
  const primaryLesson = primaryChapter?.lessons[0];
  const primaryQuest = primaryLesson?.quests[0];

  const handleStart = () => {
    if (primaryQuest) {
      setCurrentLocation(location);
      onStartQuest(primaryQuest);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Hero Image Header */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-800 shrink-0">
          <img
            src={location.heroImage}
            alt={location.nameVi}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-black/30" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Location Title & Badges */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-black shadow-xs">
                {location.iconEmoji} {location.region.toUpperCase()}
              </span>
              {location.category.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 bg-white/20 backdrop-blur-xs rounded-full text-[11px] font-bold uppercase"
                >
                  {cat}
                </span>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              {location.nameVi}
            </h2>
            <div className="text-sm font-bold text-amber-300">
              {location.nameEn} — {t(location.tagline)}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {t(location.description)}
          </p>

          {/* Cultural Facts Box */}
          {location.facts && location.facts.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{locale === "vi" ? "Kiến thức & Di sản thú vị" : "Fascinating Fact & Heritage"}</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                {location.facts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{t(fact)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quest & Chapter Section */}
          {location.isPlayableInMvp && isUnlocked && primaryQuest ? (
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {locale === "vi" ? "Bài học & Nhiệm vụ có sẵn" : "Available Lesson & Quest"}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> 5 {locale === "vi" ? "phút" : "mins"}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h4 className="font-extrabold text-sm text-slate-800">
                      {t(primaryQuest.title)}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t(primaryQuest.description)}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    +{primaryQuest.reward.xp} XP
                  </span>
                  {isQuestCompleted(primaryQuest.id) && (
                    <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{locale === "vi" ? "Hoàn thành" : "Completed"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : !isUnlocked ? (
            <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3.5 text-slate-600">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-slate-800">
                  {locale === "vi" ? "Địa danh này đang bị khóa" : "This location is currently locked"}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {location.unlockRule.type === "previous_location" &&
                    (locale === "vi"
                      ? "Hãy hoàn thành các nhiệm vụ ở địa danh trước đó để mở khóa."
                      : "Complete previous destination quests to unlock this landmark.")}
                  {location.unlockRule.type === "xp_threshold" &&
                    (locale === "vi"
                      ? `Cần tích lũy đủ ${location.unlockRule.requiredXp} XP để mở khóa vùng đất này.`
                      : `Requires ${location.unlockRule.requiredXp} XP to unlock this destination.`)}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs sm:text-sm text-sky-800">
              {locale === "vi"
                ? "Tọa độ này nằm trong danh mục Preview của phiên bản đầu. Nội dung bài học đầy đủ sẽ được Content Creator cập nhật qua CMS!"
                : "This destination is in the preview pack. Full lesson quests will be released via CMS!"}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-300 font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {locale === "vi" ? "Đóng" : "Close"}
          </button>

          <div className="flex items-center gap-2 flex-1 justify-end">
            {onOpen3D && isUnlocked && (
              <button
                type="button"
                onClick={() => {
                  onOpen3D(location.id);
                  onClose();
                }}
                className="py-3 px-4 bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Khám phá 3D không gian địa danh"
              >
                <Globe className="w-4 h-4" />
                <span>{locale === "vi" ? "Khám phá 3D" : "Explore 3D"}</span>
              </button>
            )}

            {isUnlocked && primaryQuest ? (
              <button
                type="button"
                onClick={handleStart}
                className="py-3 px-6 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isQuestCompleted(primaryQuest.id) ? (locale === "vi" ? "Chơi lại nhiệm vụ" : "Replay Quest") : (locale === "vi" ? "BẮT ĐẦU NHIỆM VỤ" : "START QUEST")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="py-3 px-6 bg-slate-200 text-slate-400 font-bold text-sm rounded-2xl cursor-not-allowed text-center"
              >
                {locale === "vi" ? "Chưa mở khóa" : "Locked Destination"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

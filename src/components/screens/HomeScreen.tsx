"use client";

import React from "react";
import { useGame } from "@/context/GameContext";
import { TabType } from "@/components/navigation/Navbar";
import { Location } from "@/types/content";
import {
  Compass,
  BookOpen,
  Trophy,
  Flame,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
} from "lucide-react";

import { MascotCharacter } from "@/components/mascot/MascotCharacter";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface HomeScreenProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenLocation: (location: Location) => void;
  onOpen3D?: (locationId?: string) => void;
}

export function HomeScreen({ onNavigateTab, onOpenLocation, onOpen3D }: HomeScreenProps) {
  const {
    progress,
    locations,
    currentLocation,
    locale,
    t,
    isLocationUnlocked,
    isQuestCompleted,
  } = useGame();

  // Calculate overall percentage of playable quests completed
  const playableLocations = locations.filter((l) => l.isPlayableInMvp);
  const totalPlayableQuests = playableLocations.reduce(
    (acc, loc) =>
      acc + (loc.chapters?.flatMap((c) => c.lessons.flatMap((l) => l.quests)).length || 0),
    0
  );
  const completedCount = progress.completedQuestIds.length;
  const overallProgressPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalPlayableQuests)) * 100)
  );

  if (locations.length === 0 || !currentLocation) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Hero Welcome Banner with Mascot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-5 rounded-3xl border border-amber-200/50">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {locale === "vi" ? "Học tiếng Anh • Khám phá Việt Nam" : "Learn a language • Explore Vietnam"}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {locale === "vi" ? "Chào bạn, Nhà Thám Hiểm! 👋" : "Good morning, Explorer! 👋"}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            {locale === "vi"
              ? "Mỗi bài học tiếng Anh mở ra một mảnh ghép kỳ diệu về vẻ đẹp và văn hóa Việt Nam."
              : "Every English quest unlocks a fascinating piece of Vietnam's landmarks and culture."}
          </p>
        </div>
        <div className="shrink-0 flex justify-center sm:justify-end">
          <MascotCharacter
            mood="waving"
            size={96}
            speechText={locale === "vi" ? "Đi khám phá thôi! ✨" : "Let's explore! ✨"}
          />
        </div>
      </div>

      {/* Main Continue Journey Card with Vietnam Landmark Hero Background */}
      <div className="relative overflow-hidden rounded-3xl text-white p-6 md:p-8 shadow-2xl border border-white/20 group">
        {/* Background Landmark Image using img tag */}
        <img
          src={currentLocation.heroImage}
          alt={currentLocation.nameVi}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Directional gradient overlay: deep dark on left for text legibility, transparent on right so the beautiful scenery is fully visible */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-950/50 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md">
                {locale === "vi" ? "Tiếp tục hành trình" : "Continue your journey"}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-200 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>
                  {progress.streak} {locale === "vi" ? "ngày streak" : "day streak"}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-extrabold text-amber-300 tracking-wider flex items-center gap-1.5 drop-shadow-md">
                <span>{currentLocation.iconEmoji}</span>
                <span>{t(currentLocation.tagline)}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mt-1 text-white drop-shadow-lg">
                {currentLocation.nameVi} Adventure
              </h2>
              <p className="text-white/90 text-sm mt-1 line-clamp-2 drop-shadow-md font-medium">
                {t(currentLocation.description)}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-amber-200 drop-shadow-sm">
                <span>{locale === "vi" ? "Tiến độ thám hiểm" : "Adventure Progress"}</span>
                <span>{overallProgressPercent}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/20 backdrop-blur-xs">
                <div
                  className="bg-linear-to-r from-amber-400 to-emerald-400 rounded-full h-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(12, overallProgressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button & Badges */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 shrink-0">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md rounded-2xl text-xs font-bold border border-white/20 text-amber-200 shadow-md">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>+{currentLocation.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.reward.xp || 120} XP sẵn sàng</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenLocation(currentLocation)}
              className="py-4 px-8 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <span>{locale === "vi" ? "TIẾP TỤC KHÁM PHÁ" : "CONTINUE JOURNEY"}</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            {onOpen3D && (
              <button
                type="button"
                onClick={() => onOpen3D(currentLocation.id)}
                className="py-3 px-6 bg-linear-to-r from-cyan-600/90 via-blue-600/90 to-indigo-600/90 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/30 backdrop-blur-md"
              >
                <Globe className="w-4 h-4 text-cyan-200" />
                <span>
                  {locale === "vi"
                    ? `🌏 KHÁM PHÁ 3D: ${currentLocation.nameVi.toUpperCase()}`
                    : `🌏 EXPLORE 3D: ${currentLocation.nameEn.toUpperCase()}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Core Action Cards (Explore, Passport, Achievement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Explore Map */}
        <button
          type="button"
          onClick={() => onNavigateTab("map")}
          className="p-6 bg-white hover:bg-emerald-50/50 border-2 border-slate-200 hover:border-emerald-400 rounded-3xl text-left transition-all group shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center justify-between">
                <span>{locale === "vi" ? "Bản đồ Việt Nam" : "Explore Map"}</span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {locale === "vi"
                  ? "Xem 10 tọa độ kỳ quan từ Bắc chí Nam và mở khóa các vùng đất mới."
                  : "Discover 10 landmarks across North, Central, and South Vietnam."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>{progress.unlockedLocationIds.length} / {locations.length} địa danh mở</span>
            <span>Khám phá →</span>
          </div>
        </button>

        {/* Passport */}
        <button
          type="button"
          onClick={() => onNavigateTab("passport")}
          className="p-6 bg-white hover:bg-amber-50/50 border-2 border-slate-200 hover:border-amber-400 rounded-3xl text-left transition-all group shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center justify-between">
                <span>{locale === "vi" ? "Hộ chiếu Du lịch" : "Passport"}</span>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {locale === "vi"
                  ? "Sưu tập tem vàng và bảo vật văn hóa sau mỗi nhiệm vụ hoàn thành."
                  : "Collect golden passport stamps and cultural treasures."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>{progress.collectedStamps.length} con tem thu thập</span>
            <span>Xem tem →</span>
          </div>
        </button>

        {/* Profile / Achievements */}
        <button
          type="button"
          onClick={() => onNavigateTab("profile")}
          className="p-6 bg-white hover:bg-purple-50/50 border-2 border-slate-200 hover:border-purple-400 rounded-3xl text-left transition-all group shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center justify-between">
                <span>{locale === "vi" ? "Thành tựu & Cấp độ" : "Achievements"}</span>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {locale === "vi"
                  ? "Theo dõi tổng điểm XP, huy hiệu thám hiểm và tiến độ học tập."
                  : "Track your total XP, adventurer rank, and master badges."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>Level {Math.floor(progress.xp / 100) + 1} Explorer</span>
            <span>Chi tiết →</span>
          </div>
        </button>
      </div>

      {/* Featured Playable Locations Vertical Slice */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {locale === "vi" ? "Tọa độ thám hiểm MVP" : "Playable MVP Expeditions"}
            </h3>
            <p className="text-slate-500 text-xs">
              {locale === "vi"
                ? "3 địa danh có đầy đủ bài học và câu hỏi tiếng Anh tương tác"
                : "3 destinations with full English quests & cultural mini-games"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("map")}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{locale === "vi" ? "Xem tất cả trên bản đồ" : "View all on map"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {playableLocations.map((loc) => {
            const isUnlocked = isLocationUnlocked(loc);
            const firstQuestId = loc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.id;
            const completed = firstQuestId ? isQuestCompleted(firstQuestId) : false;

            return (
              <div
                key={loc.id}
                onClick={() => onOpenLocation(loc)}
                className={`relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer group shadow-sm hover:shadow-lg ${
                  isUnlocked
                    ? "border-slate-200 hover:border-amber-400 bg-white"
                    : "border-slate-200 bg-slate-50 opacity-80"
                }`}
              >
                {/* Hero Image */}
                <div className="h-36 relative overflow-hidden bg-slate-200">
                  <img
                    src={loc.heroImage}
                    alt={loc.nameVi}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  {/* Status Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-full text-[11px] font-black text-slate-800 shadow-xs">
                    <span>{loc.iconEmoji}</span>
                    <span>{loc.nameVi}</span>
                  </div>

                  {completed && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-black shadow-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>{locale === "vi" ? "Đã xong" : "Done"}</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs font-bold text-amber-300">
                      {loc.nameEn}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {t(loc.description)}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-amber-600">
                      +{loc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.reward.xp || 120} XP
                    </span>
                    <span className="text-slate-800 group-hover:text-amber-600 flex items-center gap-1">
                      {locale === "vi" ? "Chơi ngay" : "Play"} →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

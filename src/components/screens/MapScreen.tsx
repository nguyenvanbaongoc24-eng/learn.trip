"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Location } from "@/types/content";
import {
  Lock,
  CheckCircle,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  Globe,
} from "lucide-react";

interface MapScreenProps {
  onSelectLocation: (loc: Location) => void;
  onOpen3D?: (locId: string) => void;
}

export function MapScreen({ onSelectLocation, onOpen3D }: MapScreenProps) {
  const {
    locations,
    currentLocation,
    locale,
    t,
    isLocationUnlocked,
    isQuestCompleted,
  } = useGame();

  const [regionFilter, setRegionFilter] = useState<"all" | "north" | "central" | "south">(
    "all"
  );
  const [hoveredLoc, setHoveredLoc] = useState<Location | null>(null);

  const filteredLocations = locations.filter((loc) => {
    if (regionFilter === "all") return true;
    return loc.region === regionFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6 animate-fadeIn pb-24 md:pb-12">
      {/* Top Banner & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            {locale === "vi" ? "Bản đồ Phiêu lưu Việt Nam" : "Vietnam Adventure Map"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {locale === "vi" ? "Khám phá 10 Vùng đất Kỳ thú" : "Explore 10 Wonder Destinations"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {locale === "vi"
              ? "Nhấn vào bất kỳ tọa độ nào trên bản đồ để bắt đầu nhiệm vụ hoặc xem điều kiện mở khóa."
              : "Tap any coordinate pin on the map to begin quests or preview unlock requirements."}
          </p>
        </div>

        {/* Region Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full">
          <span className="p-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </span>
          {[
            { id: "all", vi: "Tất cả", en: "All" },
            { id: "north", vi: "Bắc Bộ", en: "North" },
            { id: "central", vi: "Trung Bộ", en: "Central" },
            { id: "south", vi: "Nam Bộ", en: "South" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRegionFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                regionFilter === f.id
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {locale === "vi" ? f.vi : f.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* The Hero Map Board */}
        <div className="lg:col-span-8 bg-linear-to-b from-sky-100 via-sky-50 to-teal-50 border-2 border-sky-200/80 rounded-3xl p-4 sm:p-6 shadow-md relative min-h-[580px] sm:min-h-[680px] overflow-hidden flex items-center justify-center">
          {/* Subtle Decorative Ocean Waves & Latitude Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />
          
          {/* East Sea & Island Markers */}
          <div className="absolute top-1/4 right-6 sm:right-12 text-right pointer-events-none select-none">
            <div className="text-sky-800/40 font-black tracking-widest text-xs uppercase">
              BIỂN ĐÔNG VIỆT NAM
            </div>
            <div className="text-[10px] text-sky-700/40 font-bold">
              (East Sea)
            </div>
          </div>

          <div className="absolute top-[38%] right-8 sm:right-16 text-right pointer-events-none select-none">
            <div className="px-2 py-1 bg-sky-200/50 rounded-lg text-[10px] font-black text-sky-800/60 inline-block">
              Quần đảo Hoàng Sa (VN)
            </div>
          </div>

          <div className="absolute bottom-1/4 right-10 sm:right-20 text-right pointer-events-none select-none">
            <div className="px-2 py-1 bg-sky-200/50 rounded-lg text-[10px] font-black text-sky-800/60 inline-block">
              Quần đảo Trường Sa (VN)
            </div>
          </div>

          {/* Stylized Vietnam S-Curve Contour Path (Chibi Adventure Silhouette) */}
          <div className="relative w-full max-w-[420px] h-[540px] sm:h-[620px] mx-auto">
            {/* SVG S-Shape Guide Curve */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40 drop-shadow-md"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 38 12 Q 52 16 65 22 Q 50 28 55 40 Q 62 48 60 64 Q 53 78 40 86 Q 34 88 34 90"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="2 3"
              />
            </svg>

            {/* Location Coordinate Pins */}
            {filteredLocations.map((loc) => {
              const isUnlocked = isLocationUnlocked(loc);
              const isCurrent = currentLocation.id === loc.id;
              const firstQuestId = loc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.id;
              const isDone = firstQuestId ? isQuestCompleted(firstQuestId) : false;

              return (
                <div
                  key={loc.id}
                  style={{
                    left: `${loc.mapPosition.x}%`,
                    top: `${loc.mapPosition.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}
                >
                  <button
                    type="button"
                    onClick={() => onSelectLocation(loc)}
                    className="relative group cursor-pointer focus:outline-hidden"
                  >
                    {/* Pulsing Aura if Current Destination */}
                    {isCurrent && (
                      <span className="absolute -inset-2.5 rounded-full bg-amber-400 opacity-75 animate-ping" />
                    )}

                    {/* Pin Bubble */}
                    <div
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border-2 transition-all duration-300 shadow-md transform group-hover:scale-115 ${
                        !isUnlocked
                          ? "bg-slate-200/90 border-slate-300 text-slate-500 opacity-85"
                          : isDone
                          ? "bg-emerald-500 border-white text-white shadow-emerald-500/40 ring-2 ring-emerald-300"
                          : isCurrent
                          ? "bg-amber-500 border-white text-white shadow-amber-500/50 ring-3 ring-amber-300"
                          : "bg-white border-slate-300 text-slate-800 hover:border-amber-500"
                      }`}
                    >
                      <span className="text-base">{loc.iconEmoji}</span>
                      <span className="font-extrabold text-xs whitespace-nowrap hidden sm:inline">
                        {loc.nameVi}
                      </span>

                      {!isUnlocked ? (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : isDone ? (
                        <CheckCircle className="w-3.5 h-3.5 text-white shrink-0 fill-emerald-600" />
                      ) : null}
                    </div>

                    {/* Mobile tiny indicator tooltip on hover */}
                    <div className="sm:hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      {loc.nameVi}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-200 text-[11px] font-bold text-slate-600 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-300" />
              <span>{locale === "vi" ? "Vị trí hiện tại" : "Current location"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>{locale === "vi" ? "Đã hoàn thành" : "Completed"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 flex items-center justify-center text-[8px]">
                🔒
              </span>
              <span>{locale === "vi" ? "Chưa mở khóa" : "Locked"}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Destination List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="px-1 text-xs font-black uppercase tracking-wider text-slate-400">
            {locale === "vi" ? "Danh sách 10 Địa danh" : "All 10 Destinations"}
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {locations.map((loc) => {
              const isUnlocked = isLocationUnlocked(loc);
              const isCurrent = currentLocation.id === loc.id;
              const firstQuestId = loc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.id;
              const isDone = firstQuestId ? isQuestCompleted(firstQuestId) : false;
              const isHovered = hoveredLoc?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  onMouseEnter={() => setHoveredLoc(loc)}
                  onMouseLeave={() => setHoveredLoc(null)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                    isHovered || isCurrent
                      ? "border-amber-400 bg-amber-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        !isUnlocked
                          ? "bg-slate-100 text-slate-400"
                          : isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {loc.iconEmoji}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-800 truncate">
                          {loc.nameVi}
                        </span>
                        {loc.isPlayableInMvp && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
                            MVP
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {loc.nameEn}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isUnlocked && onOpen3D && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen3D(loc.id);
                        }}
                        className="p-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                        title={locale === "vi" ? `Khám phá 3D ${loc.nameVi}` : `Explore 3D ${loc.nameEn}`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">3D</span>
                      </button>
                    )}
                    {!isUnlocked ? (
                      <span className="p-1.5 rounded-lg bg-slate-100 text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    ) : isDone ? (
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

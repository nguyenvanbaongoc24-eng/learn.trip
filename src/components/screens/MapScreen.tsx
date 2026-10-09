"use client";

import React, { useState, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { Location } from "@/types/content";
import {
  Lock,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  Globe,
  Compass,
  ArrowRight,
  Star,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { SquishButton } from "@/components/ui/SquishButton";

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
  // Default selected location to the current destination or Hanoi
  const [selectedLoc, setSelectedLoc] = useState<Location>(
    currentLocation || locations[0]
  );

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (regionFilter === "all") return true;
      return loc.region === regionFilter;
    });
  }, [locations, regionFilter]);

  const selectedUnlocked = isLocationUnlocked(selectedLoc);
  const selectedFirstQuestId = selectedLoc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.id;
  const selectedDone = selectedFirstQuestId ? isQuestCompleted(selectedFirstQuestId) : false;

  return (
    <div
      id="expedition-map"
      className="max-w-6xl mx-auto px-3 sm:px-4 py-5 md:py-8 space-y-5 animate-fadeIn pb-24 md:pb-12 scroll-mt-20"
    >
      {/* ─── Top Header & Region Quick Filters ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/90 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
            {locale === "vi" ? "Bản đồ Hải trình & Địa danh" : "Vietnam Expedition Map"}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {locale === "vi" ? "Bản đồ Phiêu lưu Việt Nam" : "Vietnam Wonder Map"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {locale === "vi"
              ? "Chạm vào các tọa độ kỳ quan để xem trước cảnh sắc 3D hoặc bắt đầu học bài."
              : "Tap coordinate pins to preview 3D landmarks or start English adventures."}
          </p>
        </div>

        {/* Region Filters Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto max-w-full shrink-0">
          {[
            { id: "all", vi: "Toàn quốc 🇻🇳", en: "All Vietnam 🇻🇳" },
            { id: "north", vi: "Bắc Bộ", en: "North" },
            { id: "central", vi: "Trung Bộ", en: "Central" },
            { id: "south", vi: "Nam Bộ", en: "South" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRegionFilter(f.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                regionFilter === f.id
                  ? "bg-amber-500 text-white shadow-xs scale-102"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              {locale === "vi" ? f.vi : f.en}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Map Area & Selected Destination Drawer ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* The Illustrated Vietnam Expedition Board */}
        <div className="lg:col-span-8 bg-gradient-to-b from-sky-900 via-teal-900 to-slate-950 rounded-3xl p-3 sm:p-6 shadow-xl border-4 border-amber-200/40 relative min-h-[620px] sm:min-h-[720px] overflow-hidden flex flex-col justify-between">
          
          {/* Background Cartography Texture: Oceanic Lat/Long Grid & Sea Waves */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />

          {/* Compass Rose (Hoa tiêu Hải trình góc Đông Bắc) */}
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-20 h-20 sm:w-28 sm:h-28 opacity-40 pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-200 fill-current">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,6 55,42 50,38 45,42" fill="#f59e0b" />
              <polygon points="50,94 55,58 50,62 45,58" fill="#d97706" />
              <polygon points="6,50 42,45 38,50 42,55" fill="#f59e0b" />
              <polygon points="94,50 58,45 62,50 58,55" fill="#d97706" />
              <polygon points="50,6 50,38 45,42" fill="#fbbf24" />
              <polygon points="94,50 62,50 58,45" fill="#f59e0b" />
              <circle cx="50" cy="50" r="5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
              <text x="50" y="22" textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="900">N</text>
            </svg>
          </div>

          {/* Ocean Banners & Vietnamese Sovereignty Islands */}
          <div className="absolute top-1/5 right-5 sm:right-12 text-right pointer-events-none select-none z-10">
            <div className="text-amber-200/70 font-black tracking-[0.25em] text-xs sm:text-sm uppercase drop-shadow-md">
              BIỂN ĐÔNG VIỆT NAM
            </div>
            <div className="text-[10px] text-teal-300/60 font-bold tracking-wider">
              (EAST SEA / SOUTH CHINA SEA)
            </div>
          </div>

          {/* Quần đảo Hoàng Sa (Paracel Islands) */}
          <div className="absolute top-[36%] right-8 sm:right-20 z-10 pointer-events-auto">
            <div className="px-2.5 py-1 bg-amber-950/80 backdrop-blur-md rounded-xl border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-200 flex items-center gap-1.5 shadow-lg shadow-black/40">
              <span className="text-xs">🇻🇳</span>
              <span>Quần đảo Hoàng Sa</span>
            </div>
            {/* Coral Reef markers */}
            <div className="flex gap-2 mt-1 justify-center opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              <span className="w-2 h-1 rounded-full bg-emerald-400" />
              <span className="w-1 h-1 rounded-full bg-amber-200" />
            </div>
          </div>

          {/* Quần đảo Trường Sa (Spratly Islands) */}
          <div className="absolute bottom-[24%] right-6 sm:right-16 z-10 pointer-events-auto">
            <div className="px-2.5 py-1 bg-amber-950/80 backdrop-blur-md rounded-xl border border-amber-400/40 text-[10px] sm:text-xs font-black text-amber-200 flex items-center gap-1.5 shadow-lg shadow-black/40">
              <span className="text-xs">🇻🇳</span>
              <span>Quần đảo Trường Sa</span>
            </div>
            {/* Coral Reef clusters */}
            <div className="flex gap-2.5 mt-1.5 justify-center opacity-70">
              <span className="w-2 h-1.5 rounded-full bg-teal-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              <span className="w-2.5 h-1 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Đảo Phú Quốc (Southwest) */}
          <div className="absolute bottom-[8%] left-[16%] sm:left-[20%] z-10 pointer-events-none select-none">
            <div className="text-[10px] font-black text-teal-300/80 tracking-wide uppercase">
              Vịnh Thái Lan · Đảo Phú Quốc
            </div>
          </div>

          {/* ── Realistic Illustrated Vietnam S-Curve Vector Map ── */}
          <div className="relative w-full max-w-[460px] h-[540px] sm:h-[640px] mx-auto my-auto flex items-center justify-center">
            
            {/* SVG Realistic Vietnam Silhouette with Mountains, Coastlines, Rivers */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Coastal Shallow Water Halo (Bờ biển viền xanh lơ phát sáng) */}
              <path
                d="M 33,10 Q 55,8 68,18 Q 72,24 64,28 Q 50,30 54,42 Q 62,50 65,60 Q 64,74 56,82 Q 46,88 34,92 Q 28,88 34,84 Q 44,78 48,68 Q 52,50 44,38 Q 38,28 30,22 Z"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.35"
              />

              {/* Realistic Vietnam Continental Landmass Shape (S-Curve) */}
              <path
                d="M 34,11 Q 54,10 66,19 Q 70,25 62,29 Q 49,31 53,43 Q 61,51 63,61 Q 62,75 54,83 Q 45,89 33,93 Q 29,89 35,85 Q 45,79 49,69 Q 53,51 45,39 Q 39,29 31,23 Z"
                fill="url(#vietnam-terrain-grad)"
                stroke="#fef08a"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Dải Trường Sơn & Vùng Núi Tây Bắc Topographic Relief Shading */}
              <path
                d="M 36,13 Q 46,14 55,20 Q 58,26 52,32 Q 46,38 49,46 Q 55,54 56,64 Q 52,72 46,78 Q 42,76 45,66 Q 48,52 42,42 Q 36,32 34,22 Z"
                fill="url(#mountain-relief-grad)"
                opacity="0.75"
              />

              {/* Maritime Heritage Journey Route (Đường nối hải trình phát sáng) */}
              <path
                d="M 38,12 L 52,18 L 62,22 L 50,26 L 58,46 L 64,50 L 62,52 L 60,72 L 50,84 L 32,92"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.2"
                strokeDasharray="2.5 3"
                opacity="0.65"
              />

              {/* SVG Gradients */}
              <defs>
                <linearGradient id="vietnam-terrain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="25%" stopColor="#166534" />
                  <stop offset="55%" stopColor="#1e3a8a" />
                  <stop offset="80%" stopColor="#047857" />
                  <stop offset="100%" stopColor="#065f46" />
                </linearGradient>

                <linearGradient id="mountain-relief-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#78350f" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#14532d" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Location Coordinate Pins with Interactive Elevation */}
            {filteredLocations.map((loc) => {
              const isUnlocked = isLocationUnlocked(loc);
              const isCurrent = currentLocation.id === loc.id;
              const firstQuestId = loc.chapters?.[0]?.lessons?.[0]?.quests?.[0]?.id;
              const isDone = firstQuestId ? isQuestCompleted(firstQuestId) : false;
              const isSelected = selectedLoc.id === loc.id;

              return (
                <div
                  key={loc.id}
                  style={{
                    left: `${loc.mapPosition.x}%`,
                    top: `${loc.mapPosition.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedLoc(loc)}
                    className="relative group cursor-pointer focus:outline-hidden"
                  >
                    {/* Glowing Selection Halo */}
                    {isSelected && (
                      <span className="absolute -inset-2.5 rounded-full bg-amber-400/40 blur-xs animate-pulse" />
                    )}

                    {/* Current Active Location Radar Pulse */}
                    {isCurrent && !isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-orange-400 opacity-70 animate-ping" />
                    )}

                    {/* Pin Badge Bubble */}
                    <div
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border-2 transition-all duration-200 shadow-lg transform group-hover:scale-115 active:scale-95 ${
                        isSelected
                          ? "bg-amber-400 border-white text-slate-950 font-black shadow-amber-500/50 ring-4 ring-amber-300/50 scale-110"
                          : isCurrent
                          ? "bg-orange-500 border-white text-white font-black shadow-orange-500/50 ring-2 ring-orange-300"
                          : isDone
                          ? "bg-emerald-600 border-white text-white font-extrabold shadow-emerald-600/40 ring-1 ring-emerald-300"
                          : !isUnlocked
                          ? "bg-slate-800/90 border-slate-600 text-slate-400 opacity-75 backdrop-blur-md"
                          : "bg-white/95 border-slate-300 text-slate-900 font-extrabold hover:border-amber-400"
                      }`}
                    >
                      <span className="text-base sm:text-lg leading-none">{loc.iconEmoji}</span>
                      <span className="font-black text-xs whitespace-nowrap">
                        {loc.nameVi}
                      </span>

                      {!isUnlocked ? (
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 fill-emerald-500 shrink-0" />
                      ) : null}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map Legend Overlay (Góc dưới bản đồ) */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300/50" />
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Đã xong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span>Chưa mở</span>
              </div>
            </div>

            <div className="text-[10px] text-teal-300/80 font-semibold hidden sm:inline">
              Chạm vào bất kỳ điểm nào để xem hình ảnh và trải nghiệm 3D
            </div>
          </div>
        </div>

        {/* ─── Selected Location Detail Card (Interactive Quick Drawer) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 shadow-sm space-y-4 animate-scaleUp">
            <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden shadow-md group">
              <img
                src={selectedLoc.heroImage}
                alt={selectedLoc.nameVi}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              
              {/* Region and status badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-xl text-[11px] font-black uppercase tracking-wider border border-white/15">
                  {selectedLoc.region === "north"
                    ? "Bắc Bộ"
                    : selectedLoc.region === "central"
                    ? "Trung Bộ"
                    : "Nam Bộ"}
                </span>
                {selectedLoc.isPlayableInMvp && (
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black">
                    MVP PLAYABLE
                  </span>
                )}
              </div>

              {/* Title on image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <span>{selectedLoc.iconEmoji}</span>
                  <span>{selectedLoc.nameVi}</span>
                </div>
                <p className="text-xs text-amber-200 font-bold mt-0.5">
                  {t(selectedLoc.tagline)}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {t(selectedLoc.description)}
            </p>

            {/* Quick Stats: Lessons & XP */}
            <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Nhiệm vụ
                </span>
                <span className="text-sm font-black text-slate-800">
                  {selectedLoc.chapters?.[0]?.lessons?.[0]?.quests?.length || 3} thử thách
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Phần thưởng
                </span>
                <span className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  +120 XP
                </span>
              </div>
            </div>

            {/* Action Buttons: 3D Explore & Start Quest */}
            <div className="space-y-2 pt-1">
              {selectedUnlocked && onOpen3D && (
                <button
                  type="button"
                  onClick={() => onOpen3D(selectedLoc.id)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 via-sky-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer border border-white/20"
                >
                  <Globe className="w-5 h-5 text-cyan-200" />
                  <span>KHÁM PHÁ 3D (360°)</span>
                </button>
              )}

              <SquishButton
                variant={selectedUnlocked ? "amber" : "slate"}
                size="lg"
                fullWidth
                disabled={!selectedUnlocked}
                onClick={() => onSelectLocation(selectedLoc)}
                iconRight={<ArrowRight className="w-5 h-5" />}
              >
                {selectedUnlocked
                  ? (locale === "vi" ? "BẮT ĐẦU HỌC BÀI" : "START ADVENTURE")
                  : (locale === "vi" ? "CHƯA MỞ KHÓA" : "LOCKED")}
              </SquishButton>
            </div>
          </div>

          {/* Quick Destination List Scroll */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 space-y-2 max-h-[280px] overflow-y-auto">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1">
              {locale === "vi" ? "Chọn nhanh địa danh khác:" : "Choose another destination:"}
            </div>
            {locations.map((loc) => {
              const isLocSelected = selectedLoc.id === loc.id;
              const isUnlocked = isLocationUnlocked(loc);
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLoc(loc)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isLocSelected
                      ? "border-amber-400 bg-amber-50 text-amber-950 font-black shadow-xs"
                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{loc.iconEmoji}</span>
                    <span className="text-xs font-bold">{loc.nameVi}</span>
                  </div>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

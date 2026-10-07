"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { initialPassportStamps } from "@/data/mockContent";
import { LocationCategory } from "@/types/content";
import { BookOpen, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { StampModal } from "../ui/StampModal";
import { sounds } from "@/utils/soundEffects";
import { PassportStamp } from "@/types/content";

export function PassportScreen() {
  const { progress, locale, t } = useGame();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedStamp, setSelectedStamp] = useState<PassportStamp | null>(null);

  const allStampsList = Object.values(initialPassportStamps);

  const categories: Array<{ id: string; vi: string; en: string }> = [
    { id: "all", vi: "Tất cả tem", en: "All Stamps" },
    { id: "culture", vi: "Văn hóa", en: "Culture" },
    { id: "nature", vi: "Thiên nhiên", en: "Nature" },
    { id: "history", vi: "Lịch sử", en: "History" },
    { id: "beach", vi: "Biển đảo", en: "Beach" },
    { id: "adventure", vi: "Thám hiểm", en: "Adventure" },
  ];

  const filteredStamps = allStampsList.filter((stamp) => {
    if (activeCategory === "all") return true;
    return stamp.category === activeCategory;
  });

  const collectedStampIds = progress.collectedStamps.map((s) => s.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Passport Book Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            {locale === "vi" ? "Hộ Chiếu Thám Hiểm" : "Explorer Passport"}
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            {locale === "vi" ? "Bộ Sưu Tập Tem Việt Nam" : "Vietnam Stamp Collection"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {locale === "vi"
              ? "Mỗi địa danh bạn chinh phục sẽ được đóng dấu vàng lưu niệm vào hộ chiếu du hành."
              : "Each conquered destination bestows an authentic golden commemorative stamp into your passport."}
          </p>
        </div>

        {/* Collection Counter */}
        <div className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-md self-start sm:self-auto">
          <div className="text-3xl">🛂</div>
          <div>
            <div className="text-[11px] font-bold uppercase text-amber-100">
              {locale === "vi" ? "Đã thu thập" : "Collected"}
            </div>
            <div className="text-xl font-black">
              {progress.collectedStamps.length} / {allStampsList.length} {locale === "vi" ? "con tem" : "stamps"}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto">
        <span className="p-1.5 text-slate-400">
          <Filter className="w-4 h-4" />
        </span>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === c.id
                ? "bg-white text-slate-900 shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "vi" ? c.vi : c.en}
          </button>
        ))}
      </div>

      {/* Passport Book Container */}
      <div className="bg-amber-900/90 border-4 border-amber-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-amber-50">
        {/* Leather Textured Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

        {/* Passport Title Inside */}
        <div className="text-center pb-8 border-b border-amber-800/80 mb-8 space-y-1">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-amber-400/60 flex items-center justify-center text-xl text-amber-300">
            ★
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-widest uppercase text-amber-200">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </h2>
          <div className="text-xs uppercase tracking-wider text-amber-400/80 font-bold">
            PASSPORT OF THE WANDERER • LEARN.TRIP
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStamps.map((stamp) => {
            const isCollected = collectedStampIds.includes(stamp.id);
            const collectedData = progress.collectedStamps.find((s) => s.id === stamp.id);

            return (
              <div
                key={stamp.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedStamp(stamp);
                }}
                className={`relative rounded-3xl p-5 border-2 transition-all duration-300 flex flex-col justify-between min-h-[190px] cursor-pointer select-none ${
                  isCollected
                    ? "bg-amber-950/70 border-amber-400/70 shadow-lg shadow-amber-950/40 transform hover:scale-102 hover:border-amber-300"
                    : "bg-amber-950/30 border-amber-800/30 opacity-60 hover:opacity-80"
                }`}
              >
                {/* Stamp Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl filter drop-shadow-md">
                      {stamp.symbol}
                    </span>
                    <div>
                      <div className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                        {stamp.category}
                      </div>
                      <h3 className="font-black text-base text-amber-100 leading-snug">
                        {t(stamp.title)}
                      </h3>
                    </div>
                  </div>

                  {isCollected ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-xs text-amber-500/50 font-bold">🔒 Chưa mở</span>
                  )}
                </div>

                {/* Landmark Info */}
                <div className="py-2">
                  <div className="text-xs text-amber-300/80 font-semibold">
                    {t(stamp.landmark)}
                  </div>
                </div>

                {/* Stamp Footer with Vintage Circular Stamp Seal */}
                <div className="pt-3 border-t border-amber-800/40 flex items-center justify-between text-[11px]">
                  {isCollected ? (
                    <>
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Đã đóng dấu
                      </span>
                      <span className="text-amber-400/80 text-[10px]">
                        {collectedData?.unlockedAt
                          ? new Date(collectedData.unlockedAt).toLocaleDateString("vi-VN")
                          : "Đã mở"}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-500/60 text-[11px] italic">
                      Bấm để xem chi tiết
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stamp Details & Interactive Re-stamp Modal */}
      <StampModal
        stamp={selectedStamp}
        isCollected={collectedStampIds.includes(selectedStamp?.id || "")}
        unlockedAt={
          progress.collectedStamps.find((s) => s.id === selectedStamp?.id)?.unlockedAt
        }
        onClose={() => setSelectedStamp(null)}
        locale={locale}
        t={t}
      />
    </div>
  );
}

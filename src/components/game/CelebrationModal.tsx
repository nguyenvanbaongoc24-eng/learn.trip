"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGame } from "@/context/GameContext";
import { Sparkles, Trophy, MapPin, ArrowRight } from "lucide-react";

interface CelebrationModalProps {
  onAfterDismiss?: () => void;
}

export function CelebrationModal({ onAfterDismiss }: CelebrationModalProps) {
  const { celebration, dismissCelebration, t } = useGame();

  useEffect(() => {
    if (celebration?.active) {
      // Fire vibrant confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#ec4899"],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [celebration]);

  if (!celebration || !celebration.active) return null;

  const isLocationUnlock = celebration.type === "location_unlocked";

  const handleDismiss = () => {
    dismissCelebration();
    onAfterDismiss?.();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 transform animate-scaleUp">
        {/* Animated Icon Glow */}
        <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-amber-400 to-orange-400 blur-xl opacity-60 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-linear-to-tr from-amber-400 via-amber-300 to-orange-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/40 border-4 border-white">
            {celebration.badgeIcon || celebration.stamp?.symbol || (isLocationUnlock ? "🗺️" : "🏆")}
          </div>
        </div>

        {/* Title & Subtitle */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          {isLocationUnlock ? "Mở khóa địa danh mới!" : "Chiến thắng nhiệm vụ!"}
        </span>

        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2">
          {t(celebration.title)}
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t(celebration.subtitle)}
        </p>

        {/* Reward Showcase Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 space-y-3">
          {/* XP */}
          <div className="flex items-center justify-between px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <Trophy className="w-4 h-4 text-amber-600" /> Kinh nghiệm đạt được
            </span>
            <span className="font-black text-amber-600 text-base">
              +{celebration.xpEarned} XP
            </span>
          </div>

          {/* Stamp or Badge */}
          {celebration.stamp && (
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <span className="text-lg">{celebration.stamp.symbol}</span> Dấu ấn Hộ chiếu
              </span>
              <span className="font-extrabold text-emerald-700 text-xs">
                {t(celebration.stamp.title)}
              </span>
            </div>
          )}

          {/* Unlocked Destination Notice with Scenic Preview */}
          {celebration.unlockedLocation && (
            <div className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50 shadow-xs">
              <div
                className="h-24 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${celebration.unlockedLocation.heroImage})` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-white text-left">
                  <div className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Tọa độ mới mở khóa!
                  </div>
                  <div className="font-black text-sm">
                    {celebration.unlockedLocation.iconEmoji} {celebration.unlockedLocation.nameVi} ({celebration.unlockedLocation.nameEn})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-4 px-6 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{isLocationUnlock ? "Khám phá địa danh mới →" : "Tiếp tục hành trình"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

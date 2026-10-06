"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import {
  Award,
  Flame,
  Star,
  MapPin,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function ProfileScreen() {
  const { progress, locale, t, resetProgress } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Level calculation: every 150 XP is 1 level
  const currentLevel = Math.floor(progress.xp / 150) + 1;
  const currentLevelBaseXp = (currentLevel - 1) * 150;
  const nextLevelXp = currentLevel * 150;
  const xpInCurrentLevel = progress.xp - currentLevelBaseXp;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

  const stats = [
    {
      id: "xp",
      label: locale === "vi" ? "Tổng điểm XP" : "Total XP",
      value: `${progress.xp} XP`,
      icon: Star,
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "streak",
      label: locale === "vi" ? "Chuỗi ngày liên tục" : "Streak",
      value: `${progress.streak} ${locale === "vi" ? "ngày" : "days"}`,
      icon: Flame,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: "unlocked",
      label: locale === "vi" ? "Địa danh đã mở" : "Unlocked Places",
      value: `${progress.unlockedLocationIds.length} / 10`,
      icon: MapPin,
      color: "bg-sky-100 text-sky-700",
    },
    {
      id: "stamps",
      label: locale === "vi" ? "Tem Hộ chiếu" : "Passport Stamps",
      value: `${progress.collectedStamps.length}`,
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-fadeIn pb-24 md:pb-12">
      {/* Profile Header Card */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-5xl shadow-xl shadow-orange-500/20 border-4 border-white">
            🧒
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-slate-900 text-amber-300 font-black text-xs rounded-full border-2 border-white shadow-xs">
            Lv. {currentLevel}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              {locale === "vi" ? "Nhà Thám Hiểm Trẻ Tuổi" : "Junior Explorer"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Explorer Việt Nam
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              {locale === "vi"
                ? "Chinh phục tiếng Anh qua từng nẻo đường di sản hình chữ S"
                : "Mastering languages along the heritage paths of Vietnam"}
            </p>
          </div>

          {/* Level Progress */}
          <div className="space-y-1.5 max-w-md mx-auto sm:mx-0">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Cấp độ {currentLevel}</span>
              <span>
                {xpInCurrentLevel} / 150 XP (Cần {150 - xpInCurrentLevel} XP để lên Lv.{currentLevel + 1})
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-linear-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800">
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 font-semibold">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges Collection */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>{locale === "vi" ? "Huy hiệu Thám hiểm Đạt được" : "Earned Explorer Badges"}</span>
        </h2>

        {progress.collectedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {progress.collectedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                  {badge.icon}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-800">
                    {t(badge.title)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã nhận</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-sm">
            {locale === "vi"
              ? "Bạn chưa có huy hiệu nào. Hãy hoàn thành các nhiệm vụ khám phá Hà Nội, Hạ Long hoặc Hội An để nhận thưởng!"
              : "No badges earned yet. Complete quests in Hanoi, Ha Long, or Hoi An to earn your first badges!"}
          </div>
        )}
      </div>

      {/* Child-Safety & Environment Guarantee */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-sky-900 text-xs sm:text-sm">
        <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0" />
        <div>
          <span className="font-bold">Môi trường An toàn cho Trẻ em (Child-Safe): </span>
          <span>
            {locale === "vi"
              ? "Không có mạng xã hội công khai, không quảng cáo hành vi, hoàn toàn bảo vệ thông tin người học."
              : "No public chat, no behavioral advertising, safe learning sandbox."}
          </span>
        </div>
      </div>

      {/* Reset Progress Action */}
      <div className="pt-4 flex justify-end">
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === "vi" ? "Đặt lại tiến trình (Dành cho kiểm thử/Demo)" : "Reset Progress (Demo)"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
            <span className="text-xs text-rose-800 font-bold">
              {locale === "vi" ? "Xác nhận đặt lại toàn bộ XP và tem?" : "Confirm resetting all XP & stamps?"}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {locale === "vi" ? "Đồng ý Đặt lại" : "Yes, Reset"}
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {locale === "vi" ? "Hủy" : "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

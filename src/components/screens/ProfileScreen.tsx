"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  Camera,
  Edit3,
  Save,
  X,
  Target,
  TrendingUp,
  Calendar,
  Globe,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";

export function ProfileScreen() {
  const { user, isAuthenticated, refreshSession } = useAuth();
  const { progress, locale, t, resetProgress, syncStatus, lastSyncedAt, syncCloudProgress } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Editable fields
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editCefr, setEditCefr] = useState(user?.cefrLevel || "A1");
  const [editAvatar, setEditAvatar] = useState(user?.avatarUrl || "");

  useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      setEditCefr(user.cefrLevel || "A1");
      setEditAvatar(user.avatarUrl || "");
    }
  }, [user]);

  // Level calculation: every 150 XP is 1 level
  const currentLevel = Math.floor(progress.xp / 150) + 1;
  const currentLevelBaseXp = (currentLevel - 1) * 150;
  const xpInCurrentLevel = progress.xp - currentLevelBaseXp;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

  // Explorer title based on level
  const getExplorerTitle = (level: number) => {
    if (level >= 20) return { vi: "Huyền thoại Du hành", en: "Legendary Voyager", emoji: "👑" };
    if (level >= 15) return { vi: "Bậc Thầy Thám Hiểm", en: "Master Explorer", emoji: "🏆" };
    if (level >= 10) return { vi: "Nhà Thám Hiểm Kỳ Cựu", en: "Veteran Explorer", emoji: "⭐" };
    if (level >= 5) return { vi: "Phượt Thủ Tài Năng", en: "Skilled Traveler", emoji: "🎒" };
    if (level >= 3) return { vi: "Nhà Thám Hiểm Trẻ Tuổi", en: "Junior Explorer", emoji: "🗺️" };
    return { vi: "Người Mới Bắt Đầu", en: "Beginner", emoji: "🌱" };
  };

  const explorerTitle = getExplorerTitle(currentLevel);

  const stats = [
    {
      id: "xp",
      label: locale === "vi" ? "Tổng điểm XP" : "Total XP",
      value: `${progress.xp}`,
      suffix: "XP",
      icon: Star,
      color: "bg-amber-100 text-amber-700",
      borderColor: "border-amber-200",
      gradient: "from-amber-500 to-yellow-500",
    },
    {
      id: "streak",
      label: locale === "vi" ? "Chuỗi ngày liên tục" : "Streak",
      value: `${progress.streak}`,
      suffix: locale === "vi" ? "ngày" : "days",
      icon: Flame,
      color: "bg-orange-100 text-orange-700",
      borderColor: "border-orange-200",
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "unlocked",
      label: locale === "vi" ? "Địa danh đã mở" : "Unlocked Places",
      value: `${progress.unlockedLocationIds.length}`,
      suffix: "/ 10",
      icon: MapPin,
      color: "bg-sky-100 text-sky-700",
      borderColor: "border-sky-200",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      id: "stamps",
      label: locale === "vi" ? "Tem Hộ chiếu" : "Passport Stamps",
      value: `${progress.collectedStamps.length}`,
      suffix: locale === "vi" ? "tem" : "stamps",
      icon: BookOpen,
      color: "bg-emerald-100 text-emerald-700",
      borderColor: "border-emerald-200",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editName,
          cefrLevel: editCefr,
          avatarUrl: editAvatar,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMsg(data.message || "Cập nhật thành công!");
        await refreshSession();
        setIsEditing(false);
        setTimeout(() => setSaveMsg(""), 3000);
      } else {
        setSaveMsg(data.error || "Lỗi cập nhật.");
      }
    } catch {
      setSaveMsg("Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  const displayName = user?.displayName || "Explorer Việt Nam";
  const avatarUrl = user?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Learner";
  const cefrLevel = user?.cefrLevel || "A1";
  const memberSince = locale === "vi" ? "Tháng 10, 2026" : "October 2026";

  // Avatar seed options for DiceBear
  const avatarSeeds = [
    "Learner", "Explorer", "Traveler", "Adventurer", "Pioneer",
    "Navigator", "Voyager", "Wanderer", "Scholar", "Hero",
    "Dragon", "Phoenix", "Tiger", "Lotus", "Bamboo",
    "Star", "Moon", "Sun", "Cloud", "River",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6 animate-fadeIn pb-24 md:pb-12">
      {/* Save Success/Error Message */}
      {saveMsg && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            saveMsg.includes("thành công") || saveMsg.includes("success")
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Profile Header Card - Premium Design */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Header Banner Gradient */}
        <div className="h-28 sm:h-36 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-60" />
          
          {/* Edit/Save buttons */}
          {isAuthenticated && (
            <div className="absolute top-4 right-4 flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-xl text-xs font-bold text-emerald-700 shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Đang lưu..." : "Lưu"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user?.displayName || "");
                      setEditCefr(user?.cefrLevel || "A1");
                      setEditAvatar(user?.avatarUrl || "");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 hover:bg-white rounded-xl text-xs font-bold text-slate-600 shadow-sm transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white rounded-xl text-xs font-bold text-amber-700 shadow-sm transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{locale === "vi" ? "Chỉnh sửa" : "Edit"}</span>
                </button>
              )}
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
            <Calendar className="w-3 h-3" />
            <span>{memberSince}</span>
          </div>
        </div>

        {/* Avatar & Info Section */}
        <div className="px-6 sm:px-8 pb-6 -mt-14 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1 shadow-xl ring-4 ring-white">
                <img
                  src={isEditing ? `https://api.dicebear.com/7.x/bottts/svg?seed=${editAvatar.split("seed=")[1] || "Learner"}` : avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-2xl object-cover bg-amber-50"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-3 py-0.5 bg-slate-900 text-amber-300 font-black text-xs rounded-full border-2 border-white shadow-sm">
                Lv. {currentLevel}
              </span>
              {isEditing && (
                <button
                  type="button"
                  className="absolute top-0 left-0 w-full h-full rounded-3xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => {
                    const randomSeed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)];
                    setEditAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
                  }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* Name & Title */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 pb-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl sm:text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 w-full max-w-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {displayName}
                </h1>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
                  <span>{explorerTitle.emoji}</span>
                  {locale === "vi" ? explorerTitle.vi : explorerTitle.en}
                </span>

                {isAuthenticated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-[11px] font-bold">
                    <Globe className="w-3 h-3" />
                    CEFR {cefrLevel}
                  </span>
                )}
              </div>

              {isAuthenticated && user?.email && (
                <p className="text-slate-500 text-xs">{user.email}</p>
              )}
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-5 space-y-2 max-w-lg">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                {locale === "vi" ? `Cấp độ ${currentLevel}` : `Level ${currentLevel}`}
              </span>
              <span className="text-slate-400">
                {xpInCurrentLevel} / 150 XP → Lv.{currentLevel + 1}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 h-full rounded-full transition-all duration-500 relative"
                style={{ width: `${levelProgressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker - Shows when editing */}
      {isEditing && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-2xs space-y-3 animate-fadeIn">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            {locale === "vi" ? "Chọn Avatar" : "Choose Avatar"}
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {avatarSeeds.map((seed) => {
              const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
              const isSelected = editAvatar.includes(seed);
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setEditAvatar(url)}
                  className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 ring-2 ring-amber-200 scale-105"
                      : "border-slate-200 hover:border-amber-300 hover:scale-105"
                  }`}
                >
                  <img src={url} alt={seed} className="w-full h-full bg-amber-50" />
                </button>
              );
            })}
          </div>

          {/* CEFR Level Editor */}
          <div className="pt-3 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              {locale === "vi" ? "Trình độ tiếng Anh mục tiêu" : "Target English Level"}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {["A1", "A2", "B1", "B2", "C1"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEditCefr(level)}
                  className={`py-2 px-2 rounded-xl text-center border text-xs font-bold cursor-pointer transition-all ${
                    editCefr === level
                      ? "bg-amber-50 border-amber-500 text-amber-700 font-black shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-amber-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`bg-white border-2 ${s.borderColor} rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow group`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800">
                    {s.value}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{s.suffix}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quest Progress Overview */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>{locale === "vi" ? "Tổng quan Tiến độ" : "Progress Overview"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quests Completed */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div className="text-3xl font-black text-amber-700">{progress.completedQuestIds.length}</div>
            <div className="text-xs font-bold text-amber-600 mt-1">
              {locale === "vi" ? "Nhiệm vụ đã hoàn thành" : "Quests Completed"}
            </div>
          </div>

          {/* POIs Checked In */}
          <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl">
            <div className="text-3xl font-black text-sky-700">{(progress.checkedInPoiIds || []).length}</div>
            <div className="text-xs font-bold text-sky-600 mt-1">
              {locale === "vi" ? "Điểm tham quan đã ghé" : "POIs Visited"}
            </div>
          </div>

          {/* Lessons Completed */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
            <div className="text-3xl font-black text-emerald-700">{progress.completedLessonIds.length}</div>
            <div className="text-xs font-bold text-emerald-600 mt-1">
              {locale === "vi" ? "Bài học đã hoàn thành" : "Lessons Completed"}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>{locale === "vi" ? "Huy hiệu Thám hiểm Đạt được" : "Earned Explorer Badges"}</span>
        </h2>

        {progress.collectedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {progress.collectedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center gap-3 hover:shadow-md transition-shadow"
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

      {/* Cloud Sync & Data Ownership Section */}
      <div className="p-4 sm:p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isAuthenticated && syncStatus === "synced"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : isAuthenticated && syncStatus === "syncing"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              {isAuthenticated ? (
                <Cloud className={`w-5 h-5 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} />
              ) : (
                <CloudOff className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{locale === "vi" ? "Sao lưu & Đồng bộ Đám mây" : "Cloud Backup & Sync"}</span>
                {isAuthenticated && syncStatus === "synced" && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {locale === "vi" ? "Đã đồng bộ" : "Synced"}
                  </span>
                )}
                {isAuthenticated && syncStatus === "syncing" && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    {locale === "vi" ? "Đang đồng bộ..." : "Syncing..."}
                  </span>
                )}
                {!isAuthenticated && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {locale === "vi" ? "Khách / Cục bộ" : "Guest / Local"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAuthenticated
                  ? lastSyncedAt
                    ? locale === "vi"
                      ? `Lần đồng bộ gần nhất: ${new Date(lastSyncedAt).toLocaleTimeString("vi-VN")} hôm nay`
                      : `Last synced: ${new Date(lastSyncedAt).toLocaleTimeString()} today`
                    : locale === "vi"
                    ? "Dữ liệu được tự động lưu lên máy chủ an toàn."
                    : "Data is automatically backed up to secure server."
                  : locale === "vi"
                  ? "Tiến độ đang lưu trên thiết bị này. Đăng nhập để lưu vĩnh viễn trên đám mây!"
                  : "Progress saved locally. Log in to keep your streak and XP forever!"}
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              disabled={syncingCloud || syncStatus === "syncing"}
              onClick={async () => {
                setSyncingCloud(true);
                await syncCloudProgress();
                setTimeout(() => setSyncingCloud(false), 500);
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-400 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-500 ${
                  syncingCloud || syncStatus === "syncing" ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">{locale === "vi" ? "Đồng bộ ngay" : "Sync Now"}</span>
            </button>
          )}
        </div>
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
      <div className="pt-2 flex justify-end">
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

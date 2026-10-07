"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Target,
  Zap,
  Flame,
  Crown,
  Star,
  Lock,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { motionVariants, springs } from "@/lib/design/tokens";

// Daily challenge mock data
const dailyChallenges = [
  {
    id: "dc-1",
    title: { vi: "Hoàn thành 1 bài học", en: "Complete 1 lesson" },
    icon: "📖",
    xpReward: 20,
    progress: 0,
    total: 1,
  },
  {
    id: "dc-2",
    title: { vi: "Trả lời đúng 5 câu liên tiếp", en: "Answer 5 in a row" },
    icon: "🎯",
    xpReward: 30,
    progress: 0,
    total: 5,
  },
  {
    id: "dc-3",
    title: { vi: "Khám phá 1 địa danh mới", en: "Visit a new landmark" },
    icon: "🗺️",
    xpReward: 40,
    progress: 0,
    total: 1,
  },
];

const weeklyChallenge = {
  title: { vi: "Giữ chuỗi 7 ngày", en: "Keep a 7-day streak" },
  icon: "🔥",
  xpReward: 200,
  badgeName: { vi: "Chiến binh Tuần", en: "Weekly Warrior" },
};

// Fake leaderboard with nicknames only
const leaderboard = [
  { rank: 1, nickname: "RồngVàng🐉", xp: 3200, streak: 15 },
  { rank: 2, nickname: "NhàThámHiểm", xp: 2800, streak: 12 },
  { rank: 3, nickname: "SaoSáng⭐", xp: 2500, streak: 10 },
  { rank: 4, nickname: "PhượngHoàng", xp: 2100, streak: 8 },
  { rank: 5, nickname: "Bạn", xp: 0, streak: 0, isCurrentUser: true },
];

export function ChallengesScreen() {
  const { progress, locale, t } = useGame();
  const { isAuthenticated } = useAuth();
  const localized = (obj: { vi: string; en: string }) => locale === "vi" ? obj.vi : obj.en;

  // Update leaderboard with real XP
  const board = leaderboard.map((entry) =>
    entry.isCurrentUser ? { ...entry, xp: progress.xp, streak: progress.streak } : entry
  ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-6 space-y-6"
      variants={motionVariants.staggerParent}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerChild} className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 border border-rose-200 rounded-full">
          <Trophy className="w-5 h-5 text-rose-500" />
          <h1 className="text-lg font-black text-rose-600">
            {locale === "vi" ? "Thử thách" : "Challenges"}
          </h1>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {locale === "vi"
            ? "Hoàn thành nhiệm vụ để nhận XP thưởng! 🎁"
            : "Complete quests for bonus XP! 🎁"}
        </p>
      </motion.div>

      {/* Daily Challenges */}
      <motion.section variants={motionVariants.staggerChild} className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-black text-slate-700">
            {locale === "vi" ? "Nhiệm vụ hôm nay" : "Daily Quests"}
          </h2>
        </div>

        <div className="space-y-2">
          {dailyChallenges.map((ch) => {
            const pct = Math.round((ch.progress / ch.total) * 100);
            const done = ch.progress >= ch.total;
            return (
              <motion.div
                key={ch.id}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                  done
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
                whileHover={{ scale: 1.01 }}
                transition={springs.squish}
              >
                <div className="text-2xl shrink-0">{ch.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800">{localized(ch.title)}</div>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${done ? "bg-emerald-500" : "bg-amber-400"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {ch.progress}/{ch.total}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                      +{ch.xpReward} XP
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Weekly Challenge */}
      <motion.section variants={motionVariants.staggerChild}>
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 text-[80px] leading-none opacity-10 pointer-events-none select-none">
            🏆
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <h2 className="text-sm font-black">
                {locale === "vi" ? "Thử thách Tuần" : "Weekly Challenge"}
              </h2>
            </div>
            <p className="text-xs font-bold opacity-90">{localized(weeklyChallenge.title)}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                +{weeklyChallenge.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black bg-white/20 px-2 py-1 rounded-lg">
                <Gift className="w-3 h-3" />
                {localized(weeklyChallenge.badgeName)}
              </span>
            </div>

            {/* Streak progress */}
            <div className="mt-2 flex items-center gap-1.5">
              {Array.from({ length: 7 }, (_, i) => {
                const filled = i < progress.streak % 7;
                return (
                  <motion.div
                    key={i}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                      filled
                        ? "bg-yellow-400 text-purple-900 shadow-sm"
                        : "bg-white/15 text-white/50"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: filled ? 1.1 : 1 }}
                    transition={{ ...springs.bouncy, delay: i * 0.05 }}
                  >
                    {filled ? <Flame className="w-4 h-4 fill-orange-600 text-orange-500" /> : (i + 1)}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Leaderboard */}
      <motion.section variants={motionVariants.staggerChild} className="space-y-3">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-black text-slate-700">
            {locale === "vi" ? "Bảng xếp hạng" : "Leaderboard"}
          </h2>
        </div>

        {!isAuthenticated && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 font-bold">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {locale === "vi"
                ? "Đăng nhập để tham gia bảng xếp hạng và so tài với bạn bè!"
                : "Log in to join the leaderboard!"}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {board.map((entry) => {
            const rankColors = entry.rank === 1
              ? "bg-amber-50 border-amber-300 text-amber-700"
              : entry.rank === 2
              ? "bg-slate-50 border-slate-300 text-slate-600"
              : entry.rank === 3
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-white border-slate-200 text-slate-600";

            const rankIcons = ["🥇", "🥈", "🥉"];

            return (
              <motion.div
                key={entry.rank}
                className={`flex items-center gap-3 p-3 rounded-2xl border ${rankColors} ${
                  entry.isCurrentUser ? "ring-2 ring-amber-400/50" : ""
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className="w-7 h-7 flex items-center justify-center text-sm font-black">
                  {entry.rank <= 3 ? rankIcons[entry.rank - 1] : `#${entry.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${entry.isCurrentUser ? "text-amber-600" : ""}`}>
                    {entry.nickname}
                    {entry.isCurrentUser && (
                      <span className="ml-1 text-[10px] text-amber-500">(Bạn)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black shrink-0">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                    {entry.streak}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {entry.xp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </motion.div>
  );
}

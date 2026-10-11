import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Brain,
  Volume2,
  RotateCcw,
  Sparkles,
  Check,
  X as XIcon,
} from "lucide-react";
import { motionVariants, springs } from "@/lib/design/tokens";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { sounds } from "@/utils/soundEffects";

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
  const { progress, locale, t, getDueSrsItems, recordSrsReview, addXp } = useGame();
  const { isAuthenticated } = useAuth();
  const localized = (obj: { vi: string; en: string }) => locale === "vi" ? obj.vi : obj.en;

  // SRS Flashcard State
  const dueItems = getDueSrsItems();
  const [srsIndex, setSrsIndex] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);

  const currentSrsItem = dueItems.length > 0 ? dueItems[srsIndex % dueItems.length] : null;

  const speakEnglish = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSrsAction = (success: boolean) => {
    if (!currentSrsItem) return;
    recordSrsReview(currentSrsItem.id, success);
    if (success) {
      sounds.correct();
      addXp(10);
    } else {
      sounds.wrong();
    }
    setSrsFlipped(false);
    setSrsIndex((prev) => prev + 1);
  };

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

      {/* SRS Spaced Repetition Vocabulary Review Section */}
      <motion.section variants={motionVariants.staggerChild} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-black text-slate-800">
              {locale === "vi" ? "Ôn tập Trí nhớ Ngắt quãng (SRS)" : "Spaced Repetition Review (SRS)"}
            </h2>
          </div>
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-black rounded-full">
            {dueItems.length} {locale === "vi" ? "từ cần ôn" : "due words"}
          </span>
        </div>

        {currentSrsItem ? (
          <div className="bg-linear-to-br from-purple-50 via-indigo-50/50 to-white border-2 border-purple-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-purple-700 font-bold">
              <span>Thẻ {((srsIndex % dueItems.length) + 1)} / {dueItems.length}</span>
              <span className="text-[10px] bg-purple-200/60 px-2 py-0.5 rounded-md uppercase font-black tracking-wider">
                Khoảng cách: {currentSrsItem.intervalDays} ngày
              </span>
            </div>

            {/* Flashcard body */}
            <div className="bg-white rounded-2xl border-2 border-purple-100 p-5 text-center space-y-3 shadow-xs">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-wide">
                  {currentSrsItem.word}
                </span>
                <button
                  type="button"
                  onClick={() => speakEnglish(currentSrsItem.word)}
                  className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors cursor-pointer"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {currentSrsItem.phonetics && (
                <p className="text-xs font-mono text-purple-600 font-medium">{currentSrsItem.phonetics}</p>
              )}

              {currentSrsItem.exampleEn && (
                <p className="text-xs text-slate-500 italic max-w-md mx-auto">
                  "{currentSrsItem.exampleEn}"
                </p>
              )}

              {/* Flipped Answer */}
              {srsFlipped ? (
                <div className="pt-3 border-t border-purple-100 animate-fadeIn space-y-1">
                  <div className="text-base font-black text-emerald-700">
                    {currentSrsItem.meaningVi}
                  </div>
                  <p className="text-[11px] text-slate-400">Đã lặp lại: {currentSrsItem.repetitions} lần</p>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSrsFlipped(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Lật thẻ xem nghĩa tiếng Việt 👀
                  </button>
                </div>
              )}
            </div>

            {/* SRS Feedback Actions */}
            {srsFlipped && (
              <div className="flex items-center gap-3 pt-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleSrsAction(false)}
                  className="flex-1 py-3 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-rose-300"
                >
                  <XIcon className="w-4 h-4" />
                  <span>Chưa nhớ (Ôn lại ngày mai)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSrsAction(true)}
                  className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Đã nhớ (+10 XP)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Xuất sắc! Bạn đã hoàn thành tất cả từ vựng cần ôn hôm nay. Hãy quay lại vào ngày mai nhé! 🌟</span>
          </div>
        )}
      </motion.section>

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
                    <AnimatedCounter value={entry.xp} />
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

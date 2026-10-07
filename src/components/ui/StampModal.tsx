"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PassportStamp, LocalizedText } from "@/types/content";
import { X, Sparkles, MapPin, Calendar, CheckCircle2, Lock } from "lucide-react";
import { sounds } from "@/utils/soundEffects";
import { SquishButton } from "./SquishButton";

interface StampModalProps {
  stamp: PassportStamp | null;
  isCollected: boolean;
  unlockedAt?: string;
  onClose: () => void;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
}

export function StampModal({
  stamp,
  isCollected,
  unlockedAt,
  onClose,
  locale,
  t,
}: StampModalProps) {
  const [stampAnimationKey, setStampAnimationKey] = useState(0);

  if (!stamp) return null;

  const triggerStampSound = () => {
    sounds.playCorrect();
    setStampAnimationKey((prev) => prev + 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locale === "vi" ? "Tem Hộ Chiếu Lưu Niệm" : "Commemorative Stamp"}</span>
          </div>

          {/* Stamp Circular Wax / Ink Seal */}
          <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
            {/* Outer dotted ring */}
            <div
              key={stampAnimationKey}
              className={`w-36 h-36 rounded-full border-4 border-dashed flex items-center justify-center transition-all ${
                isCollected
                  ? "border-amber-600 bg-amber-100/60 shadow-lg shadow-amber-500/20 animate-scaleUp"
                  : "border-slate-300 bg-slate-100/60 opacity-60"
              }`}
            >
              {/* Inner ring */}
              <div
                className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center text-center p-2 ${
                  isCollected
                    ? "border-amber-600 text-amber-800"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                <span className="text-4xl filter drop-shadow-sm select-none">
                  {stamp.symbol}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-1">
                  VIETNAM
                </span>
              </div>
            </div>

            {/* Collected seal badge */}
            {isCollected && (
              <motion.div
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute -bottom-2 -right-2 px-3 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-black shadow-md flex items-center gap-1 border-2 border-white select-none"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>OFFICIAL</span>
              </motion.div>
            )}
          </div>

          {/* Title & Landmark */}
          <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">
            {t(stamp.title)}
          </h3>

          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 font-bold mb-4">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{t(stamp.landmark)}</span>
          </div>

          {/* Status Box */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 mb-5 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">
                {locale === "vi" ? "Chủ đề:" : "Category:"}
              </span>
              <span className="font-extrabold uppercase text-amber-700">
                {stamp.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500">
                {locale === "vi" ? "Trạng thái:" : "Status:"}
              </span>
              <span
                className={`font-black flex items-center gap-1 ${
                  isCollected ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {isCollected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{locale === "vi" ? "Đã đóng dấu" : "Stamped"}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{locale === "vi" ? "Chưa mở khóa" : "Locked"}</span>
                  </>
                )}
              </span>
            </div>
            {isCollected && unlockedAt && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {locale === "vi" ? "Ngày nhận:" : "Unlocked on:"}
                </span>
                <span className="font-bold text-slate-700">
                  {new Date(unlockedAt).toLocaleDateString(
                    locale === "vi" ? "vi-VN" : "en-US"
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex gap-2">
            {isCollected ? (
              <SquishButton
                variant="amber"
                size="md"
                fullWidth
                onClick={triggerStampSound}
              >
                {locale === "vi" ? "Đóng lại dấu ấn ✨" : "Re-stamp ✨"}
              </SquishButton>
            ) : (
              <SquishButton
                variant="slate"
                size="md"
                fullWidth
                onClick={onClose}
              >
                {locale === "vi" ? "Đóng" : "Close"}
              </SquishButton>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

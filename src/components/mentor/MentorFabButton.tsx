"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMentor } from "@/context/MentorContext";
import { MascotCharacter } from "@/components/mascot/MascotCharacter";
import { HelpCircle, X, Volume2, Sparkles } from "lucide-react";
import { SquishButton } from "@/components/ui/SquishButton";

export function MentorFabButton({ activeTab }: { activeTab: string }) {
  const {
    triggerScreenHelp,
    helpModal,
    closeHelpModal,
    voiceEnabled,
    toggleVoice,
    isTourActive,
  } = useMentor();

  // Hide floating help button while an active guided spotlight tour is already in progress
  if (isTourActive) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
        <motion.button
          type="button"
          onClick={() => triggerScreenHelp(activeTab)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative p-2.5 bg-gradient-to-tr from-amber-400 via-amber-300 to-orange-400 rounded-2xl shadow-xl shadow-amber-500/30 border-3 border-white flex items-center gap-2 cursor-pointer group"
          title="Bấm để nhờ Rùa Vàng Kim Quy giúp đỡ"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <MascotCharacter mood="waving" size={40} />
          </div>
          <span className="hidden sm:inline-block pr-2 font-black text-xs text-amber-950">
            Hỏi Rùa Vàng 🐢
          </span>
          {/* Pulsing notification dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border border-white" />
          </span>
        </motion.button>
      </div>

      {/* Screen Help Modal */}
      <AnimatePresence>
        {helpModal.isOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-2xl text-center"
            >
              <button
                type="button"
                onClick={closeHelpModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-3">
                <MascotCharacter mood="cheering" size={72} />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
                <span>Rùa Vàng hướng dẫn</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-2">
                {helpModal.title}
              </h3>

              <p className="text-base text-slate-600 leading-relaxed font-semibold bg-amber-50/60 p-4 rounded-2xl border border-amber-100 mb-6">
                {helpModal.message}
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`px-4 py-3 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    voiceEnabled
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-slate-50 border-slate-300 text-slate-500"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{voiceEnabled ? "Bật tiếng" : "Tắt tiếng"}</span>
                </button>

                <SquishButton
                  variant="amber"
                  size="md"
                  fullWidth
                  onClick={closeHelpModal}
                >
                  Đã hiểu rồi! ✨
                </SquishButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

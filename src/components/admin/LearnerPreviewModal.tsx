"use client";

import React, { useState } from "react";
import { Question, QuestionType } from "@/types/content";
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  RefreshCw,
  Award,
} from "lucide-react";

interface LearnerPreviewModalProps {
  question: Question;
  onClose: () => void;
}

export function LearnerPreviewModal({ question, onClose }: LearnerPreviewModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState("");
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({});
  const [activeLeftPair, setActiveLeftPair] = useState<string | null>(null);
  const [assembledWords, setAssembledWords] = useState<string[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Web Speech TTS
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleSubmit = () => {
    setIsAnswerSubmitted(true);

    if (question.type === "multiple_choice" || question.type === "picture_match" || question.type === "listen_select" || question.type === "dialogue_select") {
      setIsCorrect(selectedOption === question.correctAnswer);
    } else if (question.type === "true_false") {
      setIsCorrect(selectedOption === question.correctAnswer);
    } else if (question.type === "fill_blank") {
      const acceptable = question.fillBlankConfig?.acceptableAnswers || [String(question.correctAnswer)];
      const matches = acceptable.some((ans) => ans.trim().toLowerCase() === fillInput.trim().toLowerCase());
      setIsCorrect(matches);
    } else if (question.type === "word_order") {
      const correctSeq = question.wordOrderConfig?.correctSequence || [];
      const matches = assembledWords.join(" ").toLowerCase() === correctSeq.join(" ").toLowerCase();
      setIsCorrect(matches);
    } else if (question.type === "match_pair") {
      setIsCorrect(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setFillInput("");
    setSelectedPairs({});
    setActiveLeftPair(null);
    setAssembledWords([]);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-slate-950 border-2 border-amber-500/50 rounded-[40px] p-4 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl relative min-h-[580px] flex flex-col justify-between">
        
        {/* Mobile Mockup Header */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-black text-white">Xem thử giao diện Người học</div>
                <div className="text-[10px] text-amber-400 uppercase font-bold">
                  {question.type.replace("_", " ")} • CEFR {question.cefrLevel || "A2"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* XP & Progress Indicator */}
          <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-2xl border border-slate-800 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <Award className="w-4 h-4" />
              <span>+15 XP</span>
            </div>
            <div className="text-[11px] text-slate-400 font-bold">
              Câu 1 / 3
            </div>
          </div>

          {/* Prompt Section */}
          <div className="space-y-2 mb-4">
            <h3 className="font-black text-base text-white leading-snug">
              {question.prompt.vi}
            </h3>
            {question.prompt.en && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 italic">
                <span>{question.prompt.en}</span>
                <button
                  type="button"
                  onClick={() => speakText(question.prompt.en)}
                  className="p-1 text-indigo-400 hover:text-indigo-200"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Render Question Types */}

          {/* 1 & 2 & 4 & 5: Multiple Choice / Picture Match / Listen Select / Dialogue Select */}
          {(question.type === "multiple_choice" ||
            question.type === "picture_match" ||
            question.type === "listen_select" ||
            question.type === "dialogue_select") && (
            <div className="space-y-2">
              {question.options?.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => !isAnswerSubmitted && setSelectedOption(opt.id)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer min-h-[44px] ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.image && (
                        <img
                          src={opt.image}
                          alt="Option"
                          className="w-10 h-10 object-cover rounded-xl border border-slate-700"
                        />
                      )}
                      <div>
                        <div>{opt.text.vi}</div>
                        <div className="text-[11px] text-slate-400 italic">{opt.text.en}</div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? "border-amber-400 bg-amber-500 text-slate-950 font-black"
                          : "border-slate-600"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3: Fill in the blank */}
          {question.type === "fill_blank" && (
            <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-300 font-medium">
                {question.fillBlankConfig?.sentenceWithBlank || "Nhập từ đúng vào ô trống dưới đây:"}
              </div>
              <input
                type="text"
                value={fillInput}
                disabled={isAnswerSubmitted}
                onChange={(e) => setFillInput(e.target.value)}
                placeholder="Nhập đáp án tiếng Anh..."
                className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-base sm:text-xs text-white focus:outline-hidden min-h-[44px]"
              />
            </div>
          )}

          {/* 6: True / False */}
          {question.type === "true_false" && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => !isAnswerSubmitted && setSelectedOption("true")}
                className={`p-4 rounded-2xl border font-black text-sm transition-all cursor-pointer min-h-[50px] ${
                  selectedOption === "true"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-300"
                }`}
              >
                ĐÚNG (TRUE)
              </button>
              <button
                type="button"
                onClick={() => !isAnswerSubmitted && setSelectedOption("false")}
                className={`p-4 rounded-2xl border font-black text-sm transition-all cursor-pointer min-h-[50px] ${
                  selectedOption === "false"
                    ? "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-slate-900 border-slate-800 text-slate-300"
                }`}
              >
                SAI (FALSE)
              </button>
            </div>
          )}

          {/* 7: Word Order */}
          {question.type === "word_order" && (
            <div className="space-y-3">
              <div className="min-h-[50px] bg-slate-900 p-3 rounded-2xl border border-dashed border-amber-500/50 flex flex-wrap gap-1.5 items-center">
                {assembledWords.length > 0 ? (
                  assembledWords.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setAssembledWords(assembledWords.filter((_, i) => i !== idx))
                      }
                      className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {w} ×
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Chạm vào các từ bên dưới để ghép câu...</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(question.wordOrderConfig?.words || ["Hanoi", "is", "the", "capital", "of", "Vietnam"]).map(
                  (w, idx) => {
                    const isUsed = assembledWords.includes(w);
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isUsed || isAnswerSubmitted}
                        onClick={() => setAssembledWords([...assembledWords, w])}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                          isUsed
                            ? "bg-slate-900 border-slate-800 text-slate-600 opacity-40"
                            : "bg-slate-800 border-slate-700 text-white hover:border-amber-400"
                        }`}
                      >
                        {w}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Feedback Result Banner */}
          {isAnswerSubmitted && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 animate-fadeIn ${
                isCorrect
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                  : "bg-rose-950/60 border-rose-500 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Chính xác! +15 XP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Chưa đúng! Vui lòng thử lại.</span>
                  </>
                )}
              </div>
              <div className="text-[11px] opacity-90">
                Giải thích: {question.explanation?.vi || "Cố gắng luyện tập thêm!"}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Kiểm tra đáp án</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử lại câu này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Question, LocalizedText } from "@/types/content";
import { CheckCircle2, XCircle, Volume2, Sparkles, RotateCcw, VolumeX, Headphones, Play } from "lucide-react";
import { sounds } from "@/utils/soundEffects";

interface QuestionRendererProps {
  question: Question;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
  onAnswerCorrect: () => void;
  onMistake?: () => void;
}

export function QuestionRenderer({
  question,
  locale,
  t,
  onAnswerCorrect,
  onMistake,
}: QuestionRendererProps) {
  // Speech synthesis for English pronunciation
  const speakEnglish = (text: string, rate: number = 0.9) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (question.type === "multiple_choice") {
    return (
      <MultipleChoiceView
        question={question}
        locale={locale}
        t={t}
        onCorrect={onAnswerCorrect}
        onMistake={onMistake}
        onSpeak={speakEnglish}
      />
    );
  }

  if (question.type === "picture_match") {
    return (
      <PictureMatchView
        question={question}
        locale={locale}
        t={t}
        onCorrect={onAnswerCorrect}
        onMistake={onMistake}
        onSpeak={speakEnglish}
      />
    );
  }

  if (question.type === "word_builder") {
    return (
      <WordBuilderView
        question={question}
        locale={locale}
        t={t}
        onCorrect={onAnswerCorrect}
        onMistake={onMistake}
        onSpeak={speakEnglish}
      />
    );
  }

  if (question.type === "listen_choose") {
    return (
      <ListenChooseView
        question={question}
        locale={locale}
        t={t}
        onCorrect={onAnswerCorrect}
        onMistake={onMistake}
        onSpeak={speakEnglish}
      />
    );
  }

  return (
    <div className="p-4 bg-slate-100 rounded-xl text-center text-slate-600">
      Unknown question type: {question.type}
    </div>
  );
}

// ----------------------------------------------------
// 1. MULTIPLE CHOICE
// ----------------------------------------------------
function MultipleChoiceView({
  question,
  locale,
  t,
  onCorrect,
  onMistake,
  onSpeak,
}: {
  question: Question;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
  onCorrect: () => void;
  onMistake?: () => void;
  onSpeak: (text: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isCorrect = selectedId === question.correctAnswer;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const proceedNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCorrect();
  };

  const handleSelect = (id: string) => {
    if (isSubmitted && isCorrect) return;
    sounds.playClick();
    setSelectedId(id);
    setIsSubmitted(false);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setIsSubmitted(true);
    if (selectedId === question.correctAnswer) {
      sounds.playCorrect();
      const selectedOption = question.options?.find((o) => o.id === selectedId);
      if (selectedOption?.text.en) {
        onSpeak(selectedOption.text.en);
      }
      timerRef.current = setTimeout(() => {
        proceedNext();
      }, 3500);
    } else {
      sounds.playIncorrect();
      onMistake?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "vi" ? "Thử thách trắc nghiệm" : "Multiple Choice Challenge"}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
              {t(question.prompt)}
            </h3>
            {question.subPrompt && (
              <p className="text-sm text-slate-500 mt-1 italic">
                {t(question.subPrompt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSpeak(question.prompt.en)}
            className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
            title={locale === "vi" ? "Nghe phát âm tiếng Anh" : "Listen to English pronunciation"}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options?.map((option, idx) => {
          const isSelected = selectedId === option.id;
          let borderClasses = "border-slate-200 hover:border-amber-400 bg-white";
          let badgeClasses = "bg-slate-100 text-slate-600";

          if (isSelected) {
            borderClasses = "border-amber-500 bg-amber-50/60 ring-2 ring-amber-300";
            badgeClasses = "bg-amber-500 text-white";
          }

          if (isSubmitted) {
            if (option.id === question.correctAnswer) {
              borderClasses = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300";
              badgeClasses = "bg-emerald-500 text-white";
            } else if (isSelected) {
              borderClasses = "border-rose-400 bg-rose-50";
              badgeClasses = "bg-rose-500 text-white";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between shadow-xs cursor-pointer ${borderClasses}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeClasses}`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <div>
                  <div className="font-semibold text-slate-800 text-base">
                    {t(option.text)}
                  </div>
                  {option.text.en !== t(option.text) && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {option.text.en}
                    </div>
                  )}
                </div>
              </div>

              {isSubmitted && option.id === question.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isSubmitted && isSelected && option.id !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Actions */}
      <div className="pt-2">
        {isSubmitted && isCorrect && (
          <div className="space-y-3 animate-fadeIn">
            {/* Answer Image Reveal */}
            {question.resultMedia && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-emerald-300">
                <img
                  src={question.resultMedia.url}
                  alt={question.resultMedia.caption ? t(question.resultMedia.caption) : "Answer illustration"}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                {question.resultMedia.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs sm:text-sm font-bold drop-shadow-lg">
                    {t(question.resultMedia.caption)}
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{locale === "vi" ? "Đáp án đúng!" : "Correct!"}</span>
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {locale === "vi" ? "Tuyệt vời! Bạn trả lời đúng rồi 🎉" : "Awesome! That's correct 🎉"}
                </p>
                {question.explanation && (
                  <p className="text-emerald-800 mt-0.5">{t(question.explanation)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isCorrect && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-rose-900 text-sm flex items-start gap-2.5 animate-fadeIn">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {locale === "vi" ? "Chưa chính xác rồi, đừng lo bạn thử lại nhé!" : "Not quite right yet, give it another shot!"}
              </p>
              <p className="text-rose-700 mt-0.5">
                {locale === "vi" ? "Hãy đọc kỹ gợi ý phía trên." : "Take a close look at the clue above."}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!selectedId}
          onClick={isSubmitted && isCorrect ? proceedNext : handleCheck}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            !selectedId
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSubmitted && isCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-600/30"
              : "bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-[0.99]"
          }`}
        >
          {isSubmitted && isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{locale === "vi" ? "Tiếp tục câu tiếp theo →" : "Continue to Next →"}</span>
            </>
          ) : (
            locale === "vi" ? "Kiểm tra đáp án" : "Check Answer"
          )}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. PICTURE / ICON MATCH
// ----------------------------------------------------
function PictureMatchView({
  question,
  locale,
  t,
  onCorrect,
  onMistake,
  onSpeak,
}: {
  question: Question;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
  onCorrect: () => void;
  onMistake?: () => void;
  onSpeak: (text: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isCorrect = selectedId === question.correctAnswer;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const proceedNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCorrect();
  };

  const handleSelect = (id: string) => {
    if (isSubmitted && isCorrect) return;
    sounds.playClick();
    setSelectedId(id);
    setIsSubmitted(false);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setIsSubmitted(true);
    if (selectedId === question.correctAnswer) {
      sounds.playCorrect();
      const selectedOption = question.options?.find((o) => o.id === selectedId);
      if (selectedOption?.text.en) {
        onSpeak(selectedOption.text.en);
      }
      timerRef.current = setTimeout(() => {
        proceedNext();
      }, 3500);
    } else {
      sounds.playIncorrect();
      onMistake?.();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-800 text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "vi" ? "Thử thách ghép hình & văn hóa" : "Picture & Cultural Match"}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
              {t(question.prompt)}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onSpeak(question.prompt.en)}
            className="p-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 transition-colors shadow-xs cursor-pointer"
            title={locale === "vi" ? "Nghe phát âm tiếng Anh" : "Listen to English pronunciation"}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Picture / Icon Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {question.options?.map((option) => {
          const isSelected = selectedId === option.id;
          let borderClasses = "border-slate-200 hover:border-sky-400 bg-white";

          if (isSelected) {
            borderClasses = "border-sky-500 bg-sky-50/60 ring-3 ring-sky-300 scale-102";
          }

          if (isSubmitted) {
            if (option.id === question.correctAnswer) {
              borderClasses = "border-emerald-500 bg-emerald-50 ring-3 ring-emerald-300";
            } else if (isSelected) {
              borderClasses = "border-rose-400 bg-rose-50";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer ${borderClasses}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl shadow-inner">
                {option.icon || "🖼️"}
              </div>
              <div className="font-bold text-sm text-slate-800 leading-tight">
                {t(option.text)}
              </div>
              {option.text.en !== t(option.text) && (
                <div className="text-xs text-slate-500 italic">
                  {option.text.en}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        {isSubmitted && isCorrect && (
          <div className="space-y-3 animate-fadeIn mb-4">
            {/* Answer Image Reveal */}
            {question.resultMedia && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-emerald-300">
                <img
                  src={question.resultMedia.url}
                  alt={question.resultMedia.caption ? t(question.resultMedia.caption) : "Answer illustration"}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                {question.resultMedia.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs sm:text-sm font-bold drop-shadow-lg">
                    {t(question.resultMedia.caption)}
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{locale === "vi" ? "Đáp án đúng!" : "Correct!"}</span>
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {locale === "vi" ? "Đúng chuẩn rồi! 🎉" : "Spot on! That is right! 🎉"}
                </p>
                {question.explanation && (
                  <p className="text-emerald-800 mt-0.5">{t(question.explanation)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isCorrect && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-rose-900 text-sm flex items-start gap-2.5 animate-fadeIn">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-bold">
              {locale === "vi" ? "Chưa đúng hình này, hãy chọn lại nhé!" : "Not this picture, try another one!"}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!selectedId}
          onClick={isSubmitted && isCorrect ? proceedNext : handleCheck}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            !selectedId
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSubmitted && isCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-600/30"
              : "bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white active:scale-[0.99]"
          }`}
        >
          {isSubmitted && isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{locale === "vi" ? "Tiếp tục câu tiếp theo →" : "Continue to Next →"}</span>
            </>
          ) : (
            locale === "vi" ? "Kiểm tra hình ảnh" : "Check Image Match"
          )}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. WORD BUILDER
// ----------------------------------------------------
function WordBuilderView({
  question,
  locale,
  t,
  onCorrect,
  onMistake,
  onSpeak,
}: {
  question: Question;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
  onCorrect: () => void;
  onMistake?: () => void;
  onSpeak: (text: string) => void;
}) {
  const config = question.wordBuilderConfig;
  const targetWord = (typeof question.correctAnswer === "string"
    ? question.correctAnswer
    : config?.targetWord || "").toUpperCase();

  const [availableLetters, setAvailableLetters] = useState<
    Array<{ id: number; char: string; used: boolean }>
  >([]);
  const [placedLetters, setPlacedLetters] = useState<
    Array<{ originalIndex: number; char: string }>
  >([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const proceedNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCorrect();
  };

  useEffect(() => {
    if (config?.scrambledLetters) {
      setAvailableLetters(
        config.scrambledLetters.map((char, index) => ({
          id: index,
          char: char.toUpperCase(),
          used: false,
        }))
      );
    } else {
      // Default scramble
      const chars = targetWord.split("").sort(() => Math.random() - 0.5);
      setAvailableLetters(
        chars.map((char, index) => ({
          id: index,
          char,
          used: false,
        }))
      );
    }
    setPlacedLetters([]);
    setIsSubmitted(false);
  }, [question, targetWord, config]);

  const handlePickLetter = (item: { id: number; char: string; used: boolean }) => {
    if (item.used) return;
    if (isSubmitted && isCorrect) return;
    setIsSubmitted(false);
    sounds.playClick();
    setPlacedLetters((prev) => [...prev, { originalIndex: item.id, char: item.char }]);
    setAvailableLetters((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: true } : l))
    );
  };

  const handleRemoveLetter = (index: number) => {
    if (isSubmitted && isCorrect) return;
    setIsSubmitted(false);
    sounds.playClick();
    const removed = placedLetters[index];
    setPlacedLetters((prev) => prev.filter((_, i) => i !== index));
    setAvailableLetters((prev) =>
      prev.map((l) => (l.id === removed.originalIndex ? { ...l, used: false } : l))
    );
  };

  const handleReset = () => {
    sounds.playClick();
    setPlacedLetters([]);
    setAvailableLetters((prev) => prev.map((l) => ({ ...l, used: false })));
    setIsSubmitted(false);
  };

  const currentWord = placedLetters.map((p) => p.char).join("");
  const isComplete = currentWord.length === targetWord.length;
  const isCorrect = currentWord === targetWord;

  const handleCheck = () => {
    if (!isComplete) return;
    setIsSubmitted(true);
    if (isCorrect) {
      sounds.playCorrect();
      onSpeak(targetWord);
      timerRef.current = setTimeout(() => {
        proceedNext();
      }, 3500);
    } else {
      sounds.playIncorrect();
      onMistake?.();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {locale === "vi" ? "Ghép chữ tiếng Anh (Word Builder)" : "English Word Builder"}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
              {t(question.prompt)}
            </h3>
            {question.subPrompt && (
              <p className="text-sm text-slate-500 mt-1 italic">
                {t(question.subPrompt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSpeak(targetWord)}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
            title={locale === "vi" ? "Nghe từ tiếng Anh" : "Listen to English word"}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Target Word Slots */}
      <div className="p-6 bg-slate-900 rounded-2xl text-center shadow-inner">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-center gap-2">
          <span>{locale === "vi" ? "Từ tiếng Anh cần ghép" : "Target word to assemble"}</span>
          {placedLetters.length > 0 && !isSubmitted && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 ml-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{locale === "vi" ? "Làm lại" : "Reset"}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-16">
          {Array.from({ length: targetWord.length }).map((_, index) => {
            const placed = placedLetters[index];
            return (
              <button
                key={index}
                type="button"
                onClick={() => placed && handleRemoveLetter(index)}
                className={`w-12 h-14 md:w-14 md:h-16 rounded-xl font-black text-2xl flex items-center justify-center transition-all cursor-pointer ${
                  placed
                    ? isSubmitted
                      ? isCorrect
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300"
                        : "bg-rose-500 text-white ring-2 ring-rose-300"
                      : "bg-amber-400 text-slate-900 shadow-md hover:bg-amber-300 active:scale-95"
                    : "border-2 border-dashed border-slate-700 bg-slate-800/60 text-slate-600"
                }`}
              >
                {placed?.char || ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Letters Pool */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          {locale === "vi"
            ? "Nhấn vào các chữ cái bên dưới để ghép từ:"
            : "Tap the letter tiles below to build the word:"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {availableLetters.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.used || isSubmitted}
              onClick={() => handlePickLetter(item)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold text-xl flex items-center justify-center transition-all shadow-sm ${
                item.used
                  ? "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed scale-90 opacity-40"
                  : "bg-white border-2 border-slate-300 text-slate-800 hover:border-amber-400 hover:bg-amber-50 active:scale-95 hover:shadow-md cursor-pointer"
              }`}
            >
              {item.char}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback & Submit */}
      <div className="pt-2">
        {isSubmitted && isCorrect && (
          <div className="space-y-3 animate-fadeIn mb-4">
            {/* Answer Image Reveal */}
            {question.resultMedia && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-emerald-300">
                <img
                  src={question.resultMedia.url}
                  alt={question.resultMedia.caption ? t(question.resultMedia.caption) : "Answer illustration"}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                {question.resultMedia.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs sm:text-sm font-bold drop-shadow-lg">
                    {t(question.resultMedia.caption)}
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{locale === "vi" ? "Đáp án đúng!" : "Correct!"}</span>
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {locale === "vi" ? "Chính xác xuất sắc! 🎉" : "Brilliant! You got it right! 🎉"}
                </p>
                {question.explanation && (
                  <p className="text-emerald-800 mt-0.5">{t(question.explanation)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isCorrect && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-rose-900 text-sm flex items-start justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {locale === "vi" ? "Từ này chưa chính xác, hãy thử lại!" : "Not quite right yet, try again!"}
                </p>
                {config?.hintVi && (
                  <p className="text-rose-700 text-xs mt-0.5">
                    {locale === "vi" ? `Gợi ý: ${config.hintVi}` : `Hint: ${config.targetWord}`}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
            >
              {locale === "vi" ? "Xếp lại" : "Rearrange"}
            </button>
          </div>
        )}

        <button
          type="button"
          disabled={!isComplete}
          onClick={isSubmitted && isCorrect ? proceedNext : handleCheck}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            !isComplete
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSubmitted && isCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-600/30"
              : "bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white active:scale-[0.99]"
          }`}
        >
          {isSubmitted && isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{locale === "vi" ? "Tiếp tục câu tiếp theo →" : "Continue to Next →"}</span>
            </>
          ) : (
            locale === "vi" ? "Kiểm tra từ ghép" : "Check Word"
          )}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. LISTEN & CHOOSE (Nghe phát âm và chọn đáp án)
// ----------------------------------------------------
function ListenChooseView({
  question,
  locale,
  t,
  onCorrect,
  onMistake,
  onSpeak,
}: {
  question: Question;
  locale: "vi" | "en";
  t: (loc: LocalizedText) => string;
  onCorrect: () => void;
  onMistake?: () => void;
  onSpeak: (text: string, rate?: number) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isCorrect = selectedId === question.correctAnswer;
  const audioText = question.prompt.en || "";
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const proceedNext = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCorrect();
  };

  // Auto-play audio once on mount
  useEffect(() => {
    if (audioText) {
      const timer = setTimeout(() => {
        onSpeak(audioText, 0.9);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [audioText]);

  const handleSelect = (id: string) => {
    if (isSubmitted && isCorrect) return;
    sounds.playClick();
    setSelectedId(id);
    setIsSubmitted(false);
  };

  const handleCheck = () => {
    if (!selectedId) return;
    setIsSubmitted(true);
    if (selectedId === question.correctAnswer) {
      sounds.playCorrect();
      onSpeak(audioText, 0.9);
      timerRef.current = setTimeout(() => {
        proceedNext();
      }, 3500);
    } else {
      sounds.playIncorrect();
      onMistake?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Listening Challenge Banner */}
      <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-2">
              <Headphones className="w-3.5 h-3.5" />
              {locale === "vi" ? "Thử thách nghe phát âm (Listen & Choose)" : "Listening Challenge"}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
              {t(question.prompt)}
            </h3>
            {question.subPrompt && (
              <p className="text-sm text-slate-500 mt-1 italic">
                {t(question.subPrompt)}
              </p>
            )}
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pt-2 border-t border-purple-200/60">
          <button
            type="button"
            onClick={() => onSpeak(audioText, 0.9)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{locale === "vi" ? "Nghe bình thường (1.0x)" : "Play Audio (1.0x)"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSpeak(audioText, 0.65)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>🐢 {locale === "vi" ? "Nghe chậm (0.65x)" : "Listen Slow"}</span>
          </button>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options?.map((option, idx) => {
          const isSelected = selectedId === option.id;
          let borderClasses = "border-slate-200 hover:border-purple-400 bg-white";
          let badgeClasses = "bg-slate-100 text-slate-600";

          if (isSelected) {
            borderClasses = "border-purple-500 bg-purple-50/60 ring-2 ring-purple-300";
            badgeClasses = "bg-purple-500 text-white";
          }

          if (isSubmitted) {
            if (option.id === question.correctAnswer) {
              borderClasses = "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300";
              badgeClasses = "bg-emerald-500 text-white";
            } else if (isSelected) {
              borderClasses = "border-rose-400 bg-rose-50";
              badgeClasses = "bg-rose-500 text-white";
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between shadow-xs cursor-pointer ${borderClasses}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeClasses}`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <div>
                  <div className="font-semibold text-slate-800 text-base">
                    {t(option.text)}
                  </div>
                  {option.text.en !== t(option.text) && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {option.text.en}
                    </div>
                  )}
                </div>
              </div>

              {isSubmitted && option.id === question.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {isSubmitted && isSelected && option.id !== question.correctAnswer && (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Actions */}
      <div className="pt-2">
        {isSubmitted && isCorrect && (
          <div className="space-y-3 animate-fadeIn mb-4">
            {question.resultMedia && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-emerald-300">
                <img
                  src={question.resultMedia.url}
                  alt={question.resultMedia.caption ? t(question.resultMedia.caption) : "Answer illustration"}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                {question.resultMedia.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-xs sm:text-sm font-bold drop-shadow-lg">
                    {t(question.resultMedia.caption)}
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{locale === "vi" ? "Đáp án đúng!" : "Correct!"}</span>
                </div>
              </div>
            )}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {locale === "vi" ? "Khả năng nghe tuyệt vời! 🎉" : "Superb listening skills! 🎉"}
                </p>
                {question.explanation && (
                  <p className="text-emerald-800 mt-0.5">{t(question.explanation)}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isCorrect && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-4 text-rose-900 text-sm flex items-start gap-2.5 animate-fadeIn">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {locale === "vi" ? "Chưa đúng rồi, hãy bấm nút nghe lại một lần nữa nhé!" : "Not quite right, tap the listen button to hear it again!"}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!selectedId}
          onClick={isSubmitted && isCorrect ? proceedNext : handleCheck}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            !selectedId
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : isSubmitted && isCorrect
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-emerald-600/30"
              : "bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white active:scale-[0.99]"
          }`}
        >
          {isSubmitted && isCorrect ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{locale === "vi" ? "Tiếp tục câu tiếp theo →" : "Continue to Next →"}</span>
            </>
          ) : (
            locale === "vi" ? "Kiểm tra đáp án" : "Check Answer"
          )}
        </button>
      </div>
    </div>
  );
}

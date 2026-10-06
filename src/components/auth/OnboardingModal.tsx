"use client";

import React, { useState } from "react";
import {
  Globe,
  Target,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  MapPin,
  Rocket,
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { cefrLevel: string; dailyGoal: string; interests: string[] }) => void;
  displayName: string;
}

export function OnboardingModal({ isOpen, onComplete, displayName }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  // Step 1: CEFR Level
  const [selectedCefr, setSelectedCefr] = useState("A1");

  // Step 2: Daily Goal
  const [dailyGoal, setDailyGoal] = useState("10");

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  if (!isOpen) return null;

  const cefrOptions = [
    {
      id: "A1",
      label: "A1 — Mới bắt đầu",
      desc: "Chưa biết hoặc biết rất ít tiếng Anh",
      emoji: "🌱",
    },
    {
      id: "A2",
      label: "A2 — Cơ bản",
      desc: "Có thể giao tiếp đơn giản trong cuộc sống hàng ngày",
      emoji: "🌿",
    },
    {
      id: "B1",
      label: "B1 — Trung cấp",
      desc: "Tự tin giao tiếp về nhiều chủ đề quen thuộc",
      emoji: "🌳",
    },
  ];

  const goalOptions = [
    { id: "5", label: "5 phút/ngày", desc: "Nhẹ nhàng, linh hoạt", emoji: "🐢" },
    { id: "10", label: "10 phút/ngày", desc: "Cân bằng, duy trì đều", emoji: "🚶" },
    { id: "20", label: "20 phút/ngày", desc: "Chăm chỉ, tiến bộ nhanh", emoji: "🏃" },
    { id: "30", label: "30+ phút/ngày", desc: "Cháy hết mình, siêu tốc", emoji: "🚀" },
  ];

  const interestOptions = [
    { id: "culture", label: "Văn hóa & Lịch sử", emoji: "🏯" },
    { id: "food", label: "Ẩm thực Việt Nam", emoji: "🍜" },
    { id: "nature", label: "Thiên nhiên & Phong cảnh", emoji: "🌄" },
    { id: "architecture", label: "Kiến trúc di sản", emoji: "🏛️" },
    { id: "festivals", label: "Lễ hội truyền thống", emoji: "🎊" },
    { id: "language", label: "Ngôn ngữ & Từ vựng", emoji: "📚" },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    onComplete({
      cefrLevel: selectedCefr,
      dailyGoal,
      interests: selectedInterests,
    });
  };

  const steps = [
    {
      title: "Trình độ tiếng Anh",
      subtitle: "Giúp chúng tôi điều chỉnh nội dung phù hợp",
      icon: Globe,
    },
    {
      title: "Mục tiêu hàng ngày",
      subtitle: "Bạn muốn dành bao nhiêu thời gian mỗi ngày?",
      icon: Target,
    },
    {
      title: "Sở thích khám phá",
      subtitle: "Chọn các chủ đề bạn quan tâm nhất",
      icon: Compass,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="font-black text-sm tracking-tight">Chào mừng</span>
          </div>
          <h2 className="text-xl font-black">
            Xin chào, {displayName}! 👋
          </h2>
          <p className="text-xs text-orange-100 mt-1">
            Hãy thiết lập hành trình học tập của bạn trong 3 bước nhanh
          </p>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    idx < step
                      ? "bg-white text-amber-600"
                      : idx === step
                      ? "bg-white/30 text-white ring-2 ring-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all ${
                      idx < step ? "bg-white" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Current step title */}
          <div className="flex items-center gap-2">
            {React.createElement(steps[step].icon, {
              className: "w-5 h-5 text-amber-500",
            })}
            <div>
              <h3 className="text-sm font-black text-slate-900">{steps[step].title}</h3>
              <p className="text-[11px] text-slate-500">{steps[step].subtitle}</p>
            </div>
          </div>

          {/* Step 1: CEFR Level */}
          {step === 0 && (
            <div className="space-y-3">
              {cefrOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedCefr(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedCefr === opt.id
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                    <div className="text-[11px] text-slate-500">{opt.desc}</div>
                  </div>
                  {selectedCefr === opt.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Daily Goal */}
          {step === 1 && (
            <div className="space-y-3">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDailyGoal(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                    dailyGoal === opt.id
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800">{opt.label}</div>
                    <div className="text-[11px] text-slate-500">{opt.desc}</div>
                  </div>
                  {dailyGoal === opt.id && (
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedInterests.includes(opt.id)
                        ? "border-amber-500 bg-amber-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.emoji}</span>
                    <div className="font-bold text-xs text-slate-800">{opt.label}</div>
                    {selectedInterests.includes(opt.id) && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Chọn ít nhất 1 chủ đề bạn yêu thích
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              Quay lại
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <span>TIẾP TỤC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={selectedInterests.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Rocket className="w-4 h-4" />
              <span>BẮT ĐẦU HÀNH TRÌNH!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

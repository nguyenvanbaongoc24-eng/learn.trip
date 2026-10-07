"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, X, Check, RefreshCw } from "lucide-react";
import { sounds } from "@/utils/soundEffects";
import { SquishButton } from "./SquishButton";

interface ParentalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function ParentalGateModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Khu vực dành cho Phụ huynh",
  description = "Để đảm bảo an toàn cho tài khoản, người lớn vui lòng trả lời phép tính sau:",
}: ParentalGateModalProps) {
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(8);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  const generateProblem = () => {
    // Generate numbers between 6 and 9 for multiplication
    const a = Math.floor(Math.random() * 4) + 6;
    const b = Math.floor(Math.random() * 4) + 6;
    setNumA(a);
    setNumB(b);
    setAnswer("");
    setError(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateProblem();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = parseInt(answer.trim(), 10);
    if (parsed === numA * numB) {
      sounds.playCorrect();
      setError(false);
      onSuccess();
    } else {
      sounds.playIncorrect();
      setError(true);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([50, 50, 50]);
        } catch {
          // ignore
        }
      }
      setTimeout(() => {
        generateProblem();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-slate-200 text-center animate-scaleUp">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">{description}</p>

        {/* Math Problem Box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-2xl font-black text-slate-800 tracking-wider">
              {numA} × {numB} = ?
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError(false);
                }}
                placeholder="Nhập kết quả"
                className={`w-36 py-2 px-3 text-center text-lg font-black rounded-xl border-2 outline-none transition-all ${
                  error
                    ? "border-rose-500 bg-rose-50 text-rose-700 animate-shake"
                    : "border-slate-300 focus:border-amber-500 bg-white"
                }`}
              />
              <button
                type="button"
                onClick={generateProblem}
                title="Đổi câu hỏi khác"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-2 animate-fadeIn">
                Kết quả chưa đúng, vui lòng thử lại!
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <SquishButton
              variant="slate"
              size="md"
              fullWidth
              onClick={onClose}
            >
              Hủy
            </SquishButton>
            <SquishButton
              variant="amber"
              size="md"
              fullWidth
              disabled={!answer.trim()}
              onClick={() => handleSubmit()}
              icon={<Check className="w-4 h-4" />}
            >
              Xác nhận
            </SquishButton>
          </div>
        </form>
      </div>
    </div>
  );
}

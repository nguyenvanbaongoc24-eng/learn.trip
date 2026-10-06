"use client";

import React, { useState } from "react";
import { Quest, Question, ContentStatus, UserRole } from "@/types/content";
import {
  X,
  FileDiff,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from "lucide-react";

interface ReviewDiffModalProps {
  item: {
    location: any;
    chapter: any;
    lesson: any;
    quest: Quest;
  };
  currentRole: UserRole;
  onApprove: (locId: string, chapId: string, lesId: string, qId: string) => void;
  onRequestChange: (locId: string, chapId: string, lesId: string, qId: string, comment: string) => void;
  onClose: () => void;
}

export function ReviewDiffModal({
  item,
  currentRole,
  onApprove,
  onRequestChange,
  onClose,
}: ReviewDiffModalProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    Array<{ author: string; role: UserRole; text: string; time: string }>
  >([
    {
      author: "Content Bot Audit",
      role: "admin",
      text: "Nội dung khởi tạo tự động. Cần kiểm tra kỹ các mốc năm lịch sử.",
      time: "Hôm nay, 15:30",
    },
  ]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        author: currentRole === "reviewer" ? "Reviewer (Thẩm định viên)" : currentRole === "admin" ? "Admin Lead" : "Creator (Tác giả)",
        role: currentRole,
        text: commentText,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setCommentText("");
  };

  const oldQuestTitle = item.quest.title.vi + " (Bản phát hành v1.0.0)";
  const newQuestTitle = item.quest.title.vi;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-slate-950 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileDiff className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black text-lg text-white">
                So sánh Thay đổi (Visual Content Diff)
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase">
                {item.quest.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Địa danh: {item.location.nameVi} • Bài học: {item.lesson.title.vi} • Vai trò hiện tại: <strong className="text-amber-400 uppercase">{currentRole}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side Visual Diff View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Version (Before) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase">
                Bản hiện tại trên Live (Live Release)
              </span>
              <span className="text-[10px] text-slate-500">v1.0.0</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-bold">Tiêu đề Quest:</div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 line-through">
                {oldQuestTitle}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-bold">Số câu hỏi trong bài:</div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                3 câu hỏi trắc nghiệm
              </div>
            </div>
          </div>

          {/* New Version (Proposed Draft) */}
          <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Bản đề xuất sửa đổi (Proposed Draft)
              </span>
              <span className="text-[10px] text-emerald-300 font-bold">Mới tạo</span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-emerald-300 font-bold">Tiêu đề Quest đề xuất:</div>
              <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/50 text-xs font-bold text-emerald-200">
                + {newQuestTitle}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-emerald-300 font-bold">Nội dung câu hỏi đề xuất ({item.quest.steps.length} câu):</div>
              <div className="space-y-1.5">
                {item.quest.steps.map((step, idx) => (
                  <div key={step.id} className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-white">
                      #{idx + 1} [{step.question.type}]: {step.question.prompt.vi}
                    </div>
                    {step.question.factCheckNeeded && (
                      <div className="text-[10px] text-rose-400 font-bold animate-pulse">
                        ⚠️ Cần xác minh số liệu / mốc năm
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Discussion & Review Comments Thread */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <span>Trao đổi & Nhận xét Thẩm định (Review Discussion)</span>
          </h4>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {comments.map((c, i) => (
              <div key={i} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">{c.author}</span>
                  <span className="text-slate-500">{c.time}</span>
                </div>
                <div className="text-slate-300">{c.text}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Nhập nhận xét thẩm định..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddComment}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decision Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Yêu cầu quyền: <strong className="text-white">Reviewer / Admin</strong> để Phê duyệt.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onRequestChange(item.location.id, item.chapter.id, item.lesson.id, item.quest.id, commentText);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
            >
              Yêu cầu chỉnh sửa
            </button>

            <button
              type="button"
              onClick={() => {
                onApprove(item.location.id, item.chapter.id, item.lesson.id, item.quest.id);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PHÊ DUYỆT (APPROVE)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

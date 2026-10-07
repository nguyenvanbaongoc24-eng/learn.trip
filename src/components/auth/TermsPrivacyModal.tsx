"use client";

import React, { useState } from "react";
import { X, ShieldCheck, FileText, Lock, UserCheck, AlertCircle } from "lucide-react";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export function TermsPrivacyModal({
  isOpen,
  onClose,
  initialTab = "terms",
}: TermsPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[88dvh] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-amber-500 to-orange-500 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg">Chính sách & Pháp lý Learn.Trip</h3>
              <p className="text-xs text-orange-100">Bảo vệ quyền lợi người học và an toàn dữ liệu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "terms"
                ? "border-amber-500 text-amber-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Điều khoản Dịch vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "privacy"
                ? "border-amber-500 text-amber-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            Chính sách Quyền riêng tư & Bảo mật
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeTab === "terms" ? (
            <>
              <div className="border-l-4 border-amber-500 pl-3">
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  1. Giới thiệu & Phạm vi áp dụng
                </h4>
                <p className="text-slate-600 mt-1">
                  Chào mừng bạn đến với Learn.Trip — Nền tảng học tiếng Anh trực quan kết hợp khám phá 3D danh lam thắng cảnh Việt Nam. Bằng việc tạo tài khoản hoặc sử dụng ứng dụng, bạn đồng ý tuân thủ các điều khoản sau.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Tài khoản người học</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Bạn cam kết cung cấp thông tin email chính xác để bảo vệ tài khoản và nhận mã khôi phục khi cần.</li>
                  <li>Bạn có trách nhiệm bảo mật thông tin mật khẩu cá nhân.</li>
                  <li>Nghiêm cấm chia sẻ tài khoản cho mục đích can thiệp trái phép, đảo ngược kỹ thuật (reverse-engineering) hệ thống hoặc gian lận điểm thưởng XP.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Sở hữu trí tuệ nội dung</h4>
                <p className="text-slate-600">
                  Toàn bộ mô hình 3D, kịch bản hội thoại, câu hỏi tiếng Anh, tem hộ chiếu và thiết kế đồ họa trên Learn.Trip thuộc quyền sở hữu của Learn.Trip Studio. Người dùng được cấp quyền truy cập cá nhân phi thương mại để học tập.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Hệ thống Quản trị (CMS Access)</h4>
                <p className="text-slate-600">
                  Khu vực Content CMS được bảo vệ nghiêm ngặt bằng phân quyền server-side và chỉ dành cho nhân sự được cấp thẩm quyền (Creator, Reviewer, Admin). Mọi hành vi cố tình dò quét hoặc xâm nhập trái phép sẽ bị khóa tài khoản vĩnh viễn.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="border-l-4 border-emerald-500 pl-3">
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  1. Thu thập & Mục đích sử dụng dữ liệu
                </h4>
                <p className="text-slate-600 mt-1">
                  Chúng tôi tuân thủ Nghị định 13/2023/NĐ-CP của Việt Nam và các tiêu chuẩn bảo mật quốc tế. Chúng tôi chỉ thu thập các dữ liệu cần thiết phục vụ quá trình học tập:
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dữ liệu chúng tôi lưu trữ:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                  <li>Email và tên hiển thị (cho định danh tài khoản).</li>
                  <li>Mật khẩu được mã hóa an toàn một chiều bằng thuật toán Bcrypt.</li>
                  <li>Tiến độ học tập: Điểm XP, chuỗi ngày Streak, địa danh đã mở khóa, tem hộ chiếu đạt được.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Bảo vệ & Bảo mật dữ liệu</h4>
                <p className="text-slate-600">
                  - Phiên đăng nhập được quản lý bằng HttpOnly Cookie với cờ bảo mật chống rò rỉ mã độc XSS và tấn công CSRF.
                  <br />
                  - Chúng tôi tuyệt đối KHÔNG bao giờ bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích quảng cáo thương mại.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 font-black text-amber-900 mb-1 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Quyền kiểm soát dữ liệu của bạn:</span>
                </div>
                <p className="text-amber-800 text-xs leading-relaxed">
                  Bạn có toàn quyền <strong>Xuất dữ liệu cá nhân (JSON)</strong> hoặc <strong>Yêu cầu xóa vĩnh viễn tài khoản & toàn bộ tiến độ</strong> bất kỳ lúc nào tại mục Cài đặt tài khoản.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Đã hiểu và Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}

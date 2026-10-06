"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

function CmsLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/cms";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }

      // If user is learner, deny access to CMS
      if (data.user?.role === "learner") {
        setErrorMessage("Tài khoản của bạn là Người học (Learner), không có quyền truy cập vào Studio Quản trị.");
        setLoading(false);
        return;
      }

      // Success -> Redirect to CMS
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối tới máy chủ.");
      setLoading(false);
    }
  };

  const handleSelectPreset = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500/30">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-500 text-2xl shadow-xl shadow-amber-500/20 mb-1">
            🛡️
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Learn<span className="text-amber-500">.</span>Trip CMS Studio
          </h1>
          <p className="text-xs text-slate-400">
            Hệ thống Quản trị & Thẩm định Nội dung Dành riêng cho Nhân sự
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Email công việc (Staff Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@learntrip.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-base sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-base sm:text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/20 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>ĐĂNG NHẬP CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Presets */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Tài khoản mẫu để kiểm thử quyền:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectPreset("admin@learntrip.vn", "Admin@123")}
                className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left hover:border-amber-500/50 transition-colors cursor-pointer"
              >
                <div className="font-extrabold text-amber-400">👑 Admin</div>
                <div className="text-[10px] text-slate-500">Toàn quyền hệ thống</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("reviewer@learntrip.vn", "Reviewer@123")}
                className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left hover:border-sky-500/50 transition-colors cursor-pointer"
              >
                <div className="font-extrabold text-sky-400">🧐 Reviewer</div>
                <div className="text-[10px] text-slate-500">Thẩm định & Duyệt</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("creator@learntrip.vn", "Creator@123")}
                className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <div className="font-extrabold text-emerald-400">✍️ Creator</div>
                <div className="text-[10px] text-slate-500">Tạo quest & AI</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset("learner@learntrip.vn", "Learner@123")}
                className="p-2 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 rounded-xl text-left hover:border-rose-500/50 transition-colors cursor-pointer"
              >
                <div className="font-extrabold text-rose-400">🎒 Learner</div>
                <div className="text-[10px] text-slate-500">Thử bị chặn (404)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back to Game link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Quay lại ứng dụng Learn.Trip</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CmsLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Đang tải trang đăng nhập CMS...
        </div>
      }
    >
      <CmsLoginForm />
    </Suspense>
  );
}

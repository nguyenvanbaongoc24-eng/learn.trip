"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import {
  Lock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Bell,
  Palette,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Sparkles,
  LogOut,
  Info,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { sounds } from "@/utils/soundEffects";
import { TermsPrivacyModal } from "../auth/TermsPrivacyModal";

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale } = useGame();

  const [soundOn, setSoundOn] = useState(sounds.isEnabled());
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  // Privacy & Compliance states
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      const res = await fetch("/api/auth/export-data");
      if (!res.ok) throw new Error("Không thể xuất dữ liệu.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learntrip-data-${user?.id || "user"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Lỗi xuất dữ liệu: " + (err.message || String(err)));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "XÓA VĨNH VIỄN") {
      setDeleteError("Vui lòng gõ chính xác cụm từ 'XÓA VĨNH VIỄN' để xác nhận.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa tài khoản.");
      }
      alert("Tài khoản của bạn đã được xóa vĩnh viễn.");
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message || "Lỗi khi xóa tài khoản.");
      setDeleteLoading(false);
    }
  };

  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  const toggleLanguage = () => {
    sounds.playClick();
    setLocale(locale === "vi" ? "en" : "vi");
  };

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: "", percent: 0, color: "bg-slate-200" };
    let score = 0;
    if (pwd.length >= 6) score += 33;
    if (/[0-9]/.test(pwd)) score += 33;
    if (/[a-zA-Z]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score += 34;

    if (score < 40) return { label: "Yếu", percent: 33, color: "bg-rose-500" };
    if (score < 80) return { label: "Trung bình", percent: 66, color: "bg-amber-500" };
    return { label: "Mạnh", percent: 100, color: "bg-emerald-500" };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");

    if (newPassword.length < 6) {
      setPwdError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPwdMessage("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
        setTimeout(() => setPwdMessage(""), 4000);
      } else {
        setPwdError(data.error || "Đổi mật khẩu thất bại.");
      }
    } catch {
      setPwdError("Lỗi kết nối máy chủ.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = async () => {
    sounds.playClick();
    await logout();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-5 animate-fadeIn pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {locale === "vi" ? "Cài đặt" : "Settings"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {locale === "vi" ? "Tùy chỉnh trải nghiệm học tập của bạn" : "Customize your learning experience"}
          </p>
        </div>
      </div>

      {/* Success/Error Banner */}
      {pwdMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{pwdMessage}</span>
        </div>
      )}

      {/* 1. Language & Sound Section */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            {locale === "vi" ? "Giao diện & Âm thanh" : "Appearance & Sound"}
          </h2>
        </div>

        {/* Language Toggle */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800">
                {locale === "vi" ? "Ngôn ngữ giao diện" : "Interface Language"}
              </div>
              <div className="text-[11px] text-slate-500">
                {locale === "vi" ? "Tiếng Việt 🇻🇳" : "English 🇬🇧"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-600 uppercase bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {locale.toUpperCase()}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${soundOn ? "bg-emerald-100" : "bg-slate-100"}`}>
              {soundOn ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800">
                {locale === "vi" ? "Hiệu ứng âm thanh" : "Sound Effects"}
              </div>
              <div className="text-[11px] text-slate-500">
                {locale === "vi"
                  ? soundOn ? "Đang bật" : "Đã tắt"
                  : soundOn ? "Enabled" : "Disabled"}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <div
            className={`w-12 h-7 rounded-full relative transition-colors ${
              soundOn ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all ${
                soundOn ? "left-6" : "left-1"
              }`}
            />
          </div>
        </button>
      </div>

      {/* 2. Account & Security Section */}
      {isAuthenticated && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              {locale === "vi" ? "Tài khoản & Bảo mật" : "Account & Security"}
            </h2>
          </div>

          {/* Account Info */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-800">{user?.displayName}</div>
                <div className="text-[11px] text-slate-500">{user?.email}</div>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase border border-amber-200">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Change Password */}
          <div className="border-b border-slate-100">
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-violet-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800">
                    {locale === "vi" ? "Đổi mật khẩu" : "Change Password"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {locale === "vi" ? "Cập nhật mật khẩu tài khoản" : "Update your account password"}
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${showPasswordForm ? "rotate-90" : ""}`}
              />
            </button>

            {/* Password Change Form - Expandable */}
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="px-5 pb-5 space-y-4 animate-fadeIn">
                {pwdError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{pwdError}</span>
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {locale === "vi" ? "Mật khẩu hiện tại" : "Current Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {locale === "vi" ? "Mật khẩu mới" : "New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPwd ? "text" : "password"}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-11 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength */}
                  {newPassword && (
                    <div className="pt-1 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>Độ mạnh:</span>
                        <span>{pwdStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pwdStrength.color} transition-all duration-300`}
                          style={{ width: `${pwdStrength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {locale === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <div className="text-[10px] text-rose-600 font-bold">
                      Mật khẩu xác nhận không khớp.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{pwdLoading ? "Đang xử lý..." : "ĐỔI MẬT KHẨU"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Export Personal Data */}
          <button
            type="button"
            onClick={handleExportData}
            disabled={exportLoading}
            className="w-full px-5 py-4 flex items-center justify-between border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">
                  {locale === "vi" ? "Xuất dữ liệu cá nhân (JSON)" : "Export Personal Data"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {locale === "vi"
                    ? "Tải bản sao hồ sơ, XP, streak và tem hộ chiếu"
                    : "Download copy of profile, XP, streak and stamps"}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {exportLoading ? "Đang tải..." : "Tải về"}
            </span>
          </button>

          {/* Terms & Privacy */}
          <button
            type="button"
            onClick={() => setTermsModalOpen(true)}
            className="w-full px-5 py-4 flex items-center justify-between border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">
                  {locale === "vi" ? "Điều khoản & Quyền riêng tư" : "Terms & Privacy"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {locale === "vi"
                    ? "Chính sách bảo mật theo Nghị định 13/2023/NĐ-CP"
                    : "Privacy policy & Terms of Service"}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Delete Account Button */}
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText("");
              setDeleteError("");
              setDeleteModalOpen(true);
            }}
            className="w-full px-5 py-4 flex items-center gap-3 border-t border-slate-100 hover:bg-rose-50 transition-colors cursor-pointer text-rose-600"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-rose-700">
                {locale === "vi" ? "Yêu cầu xóa tài khoản vĩnh viễn" : "Delete Account Permanently"}
              </div>
              <div className="text-[11px] text-rose-500">
                {locale === "vi"
                  ? "Xóa vĩnh viễn toàn bộ XP, thành tích và thông tin cá nhân"
                  : "Irreversibly delete profile and progress"}
              </div>
            </div>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center gap-3 border-t border-slate-100 hover:bg-rose-50 transition-colors cursor-pointer text-rose-600"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">
                {locale === "vi" ? "Đăng xuất" : "Log Out"}
              </div>
              <div className="text-[11px] text-rose-400">
                {locale === "vi" ? "Thoát khỏi tài khoản hiện tại" : "Sign out of your account"}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 3. Notifications (placeholder for future) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            {locale === "vi" ? "Thông báo" : "Notifications"}
          </h2>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">
                {locale === "vi" ? "Nhắc nhở học hàng ngày" : "Daily Learning Reminder"}
              </div>
              <div className="text-[11px] text-slate-500">
                {locale === "vi" ? "Sắp ra mắt trong phiên bản tới" : "Coming in next update"}
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg">
              {locale === "vi" ? "Sắp có" : "Soon"}
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Safety */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-sky-900 text-xs sm:text-sm">
        <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0" />
        <div>
          <span className="font-bold">
            {locale === "vi" ? "Quyền riêng tư & An toàn: " : "Privacy & Safety: "}
          </span>
          <span>
            {locale === "vi"
              ? "Dữ liệu của bạn được bảo vệ nghiêm ngặt. Chúng tôi không bán hoặc chia sẻ thông tin cá nhân với bên thứ ba."
              : "Your data is strictly protected. We never sell or share personal information with third parties."}
          </span>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center text-[11px] text-slate-400 font-medium pt-2">
        Learn.Trip v2.0.0 — An toàn & Bảo mật
      </div>

      {/* Terms & Privacy Modal */}
      <TermsPrivacyModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />

      {/* Delete Account 2-Step Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Xác nhận Xóa vĩnh viễn Tài khoản
              </h3>
              <p className="text-xs text-rose-600 font-medium">
                CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Toàn bộ dữ liệu điểm kinh nghiệm (XP), chuỗi ngày streak, địa danh đã mở khóa và tem hộ chiếu của bạn sẽ bị xóa vĩnh viễn khỏi máy chủ theo yêu cầu quyền riêng tư.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Để xác nhận, vui lòng gõ chính xác:{" "}
                <span className="text-rose-600 font-black">XÓA VĨNH VIỄN</span>
              </label>
              <input
                type="text"
                placeholder="XÓA VĨNH VIỄN"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
              />
              {deleteError && (
                <p className="text-[11px] text-rose-600 font-bold">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== "XÓA VĨNH VIỄN"}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? "Đang xóa..." : "Xác nhận Xóa"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

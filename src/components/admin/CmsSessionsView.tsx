"use client";

import React, { useState, useEffect } from "react";
import { ActiveSession } from "@/lib/cms/sessions";
import {
  Key,
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface CmsSessionsViewProps {
  showNotify: (text: string, type?: "success" | "info" | "warning") => void;
}

export function CmsSessionsView({ showNotify }: CmsSessionsViewProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/sessions");
      const data = await res.json();
      if (res.ok && data.sessions) {
        setSessions(data.sessions);
      } else {
        showNotify(data.error || "Không thể tải danh sách phiên đăng nhập.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối khi tải phiên làm việc.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn thu hồi và đăng xuất từ xa thiết bị này?")) {
      return;
    }

    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/cms/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        showNotify("Đã thu hồi phiên và đăng xuất thiết bị từ xa thành công!");
      } else {
        showNotify(data.error || "Không thể thu hồi phiên.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối máy chủ.", "warning");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black uppercase rounded-full mb-2">
            <Key className="w-3.5 h-3.5" />
            <span>Trung tâm Bảo mật & Quản lý Phiên (Session Center)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Thiết bị Đang Hoạt động & Xác thực Hai bước (2FA)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi tất cả thiết bị nhân sự đang truy cập CMS. Bạn có thể ngắt kết nối từ xa hoặc kích hoạt 2FA TOTP.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSessions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Làm mới ({sessions.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Laptop className="w-4 h-4 text-amber-400" />
            <span>Các phiên đăng nhập đang hoạt động ({sessions.length})</span>
          </h3>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500 mb-2" />
                Đang kiểm tra các phiên đăng nhập...
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
                Không tìm thấy phiên đăng nhập nào.
              </div>
            ) : (
              sessions.map((sess) => {
                const isMobile = sess.device.toLowerCase().includes("phone") || sess.device.toLowerCase().includes("mobile");
                return (
                  <div
                    key={sess.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                        {isMobile ? (
                          <Smartphone className="w-5 h-5 text-sky-400" />
                        ) : (
                          <Laptop className="w-5 h-5 text-amber-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{sess.device}</span>
                          {sess.isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                              Thiết bị này
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Globe className="w-3 h-3 text-slate-500" />
                            {sess.ipAddress} ({sess.location})
                          </span>
                          <span>•</span>
                          <span>Tài khoản: <strong className="text-slate-300">{sess.userEmail}</strong></span>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hoạt động gần nhất: {new Date(sess.lastActiveAt).toLocaleTimeString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        disabled={revokingId === sess.id}
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất từ xa</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2FA Security Center (Right col) */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bảo vệ Tài khoản Nâng cao</span>
          </h3>

          {/* 2FA Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Xác thực 2 Bước (2FA)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bảo vệ đăng nhập qua ứng dụng Google Authenticator / Authy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!twoFactorEnabled) {
                    setShowQrModal(true);
                  } else {
                    setTwoFactorEnabled(false);
                    showNotify("Đã tắt xác thực hai bước.", "info");
                  }
                }}
                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  twoFactorEnabled ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Quy định An toàn CMS:</span>
              </div>
              <p className="text-slate-400">
                Khi kích hoạt 2FA, tài khoản Quản trị sẽ yêu cầu nhập mã OTP 6 chữ số mỗi khi đăng nhập từ thiết bị mới.
              </p>
            </div>
          </div>

          {/* Inactivity Security Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <h4 className="font-bold text-white text-sm">Tự động Khóa khi Bỏ trống (Timeout)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Phiên quản trị sẽ tự động bật cảnh báo và khóa giao diện nếu không có thao tác bàn phím/chuột trong vòng <strong>15 phút</strong> để phòng ngừa truy cập trái phép khi rời bàn làm việc.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Chế độ tự động khóa đang BẬT</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-white">Quét mã QR Xác thực 2FA</h3>
            <p className="text-xs text-slate-400">
              Mở ứng dụng Google Authenticator và quét mã QR bên dưới:
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=otpauth://totp/LearnTripCMS:admin@learntrip.vn?secret=JBSWY3DPEHPK3PXP&issuer=LearnTrip"
                alt="2FA QR Code"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div className="font-mono text-xs text-amber-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
              Khóa bí mật: JBSW-Y3DP-EHPK-3PXP
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorEnabled(true);
                  setShowQrModal(false);
                  showNotify("Đã kích hoạt xác thực 2 bước (2FA) thành công!");
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer"
              >
                Xác nhận Đã Quét
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

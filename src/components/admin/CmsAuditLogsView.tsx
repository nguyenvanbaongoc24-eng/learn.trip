"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "@/lib/cms/audit";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  FileCheck,
  Send,
  Lock,
} from "lucide-react";

interface CmsAuditLogsViewProps {
  showNotify: (text: string, type?: "success" | "info" | "warning") => void;
}

export function CmsAuditLogsView({ showNotify }: CmsAuditLogsViewProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/audit-logs");
      const data = await res.json();
      if (res.ok && data.logs) {
        setLogs(data.logs);
      } else {
        showNotify(data.error || "Không thể tải nhật ký kiểm duyệt.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối khi tải nhật ký.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.targetId.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "publish_version":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "change_user_role":
      case "toggle_user_status":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "update_quest":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40";
      case "create_quest":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "revoke_session":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black uppercase rounded-full mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Nhật ký Kiểm duyệt & An toàn (Audit Trail)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Nhật ký Hoạt động Nhân sự Nội dung
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ghi vết bất biến (Immutable log) mọi thao tác sửa quest, duyệt bài, đổi quyền và xuất bản theo tiêu chuẩn an ninh.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Làm mới ({logs.length})</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung thao tác, người thực hiện hoặc ID đối tượng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả hành động</option>
            <option value="publish_version">Xuất bản phiên bản</option>
            <option value="update_quest">Duyệt/Sửa Quest</option>
            <option value="create_quest">Tạo mới Quest</option>
            <option value="change_user_role">Đổi vai trò người dùng</option>
            <option value="toggle_user_status">Khóa/Mở tài khoản</option>
            <option value="revoke_session">Thu hồi phiên đăng nhập</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-5 py-3.5">Chi tiết thao tác</th>
                <th className="px-4 py-3.5">Đối tượng</th>
                <th className="px-4 py-3.5 text-right">IP Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    Đang tải nhật ký kiểm duyệt...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Không có nhật ký nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Timestamp */}
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString("vi-VN")}
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.actorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        [{item.actorRole}]
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md border font-black text-[10px] uppercase ${getActionBadge(
                          item.action
                        )}`}
                      >
                        {item.actionLabel}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="px-5 py-3.5 text-slate-300">
                      <span className="line-clamp-2">{item.details}</span>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.targetId}
                      </span>
                    </td>

                    {/* IP */}
                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {item.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

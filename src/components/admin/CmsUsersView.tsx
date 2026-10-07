"use client";

import React, { useState, useEffect } from "react";
import { UserRole } from "@/lib/auth/roles";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status?: "active" | "suspended";
  avatarUrl?: string;
  cefrLevel?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface CmsUsersViewProps {
  currentRole: UserRole;
  showNotify: (text: string, type?: "success" | "info" | "warning") => void;
}

export function CmsUsersView({ currentRole, showNotify }: CmsUsersViewProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
        showNotify(data.error || "Không thể tải danh sách người dùng.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối khi tải danh sách người dùng.", "warning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (currentRole !== "admin") {
      showNotify("Chỉ Admin mới có quyền đổi vai trò người dùng.", "warning");
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch("/api/cms/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showNotify(`Đã cập nhật vai trò người dùng thành [${newRole.toUpperCase()}] thành công!`);
      } else {
        showNotify(data.error || "Không thể đổi vai trò.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối máy chủ.", "warning");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    if (currentRole !== "admin") {
      showNotify("Chỉ Admin mới có quyền khóa/mở khóa tài khoản.", "warning");
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch("/api/cms/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggle_status" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: data.newStatus } : u))
        );
        showNotify(
          data.newStatus === "suspended"
            ? "Đã khóa (đình chỉ) tài khoản thành công."
            : "Đã kích hoạt lại tài khoản thành công!"
        );
      } else {
        showNotify(data.error || "Không thể cập nhật trạng thái.", "warning");
      }
    } catch {
      showNotify("Lỗi kết nối máy chủ.", "warning");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "suspended" ? u.status === "suspended" : u.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  const roleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case "admin":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "reviewer":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
      case "creator":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black uppercase rounded-full mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Quản trị Danh tính & Phân quyền (RBAC)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            Danh sách Người dùng & Kiểm soát Vai trò
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chỉ Quản trị viên (Admin) mới có thẩm quyền bổ nhiệm vai trò Creator/Reviewer và khóa tài khoản vi phạm.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Làm mới ({users.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hiển thị hoặc địa chỉ email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="learner">Chỉ Learner (Người học)</option>
            <option value="creator">Chỉ Creator (Biên tập)</option>
            <option value="reviewer">Chỉ Reviewer (Kiểm định)</option>
            <option value="admin">Chỉ Admin (Quản trị)</option>
            <option value="suspended">Tài khoản bị khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-4 py-3.5">Vai trò hiện tại</th>
                <th className="px-4 py-3.5">Trình độ CEFR</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5">Đăng ký ngày</th>
                <th className="px-5 py-3.5 text-right">Thao tác Quản trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === "suspended";
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isSuspended ? "opacity-60 bg-rose-950/10" : ""
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=User"}
                            alt={u.displayName}
                            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 object-cover shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {u.role === "admin" && (
                                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role selection */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-md border font-black uppercase text-[10px] ${roleBadgeStyle(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>

                          {currentRole === "admin" && (
                            <select
                              value={u.role}
                              disabled={updatingId === u.id || u.email === "admin@learntrip.vn"}
                              onChange={(e) =>
                                handleRoleChange(u.id, e.target.value as UserRole)
                              }
                              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40"
                            >
                              <option value="learner">Learner</option>
                              <option value="creator">Creator</option>
                              <option value="reviewer">Reviewer</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </div>
                      </td>

                      {/* CEFR */}
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                          {u.cefrLevel || "A1"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Hoạt động
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {currentRole === "admin" && u.email !== "admin@learntrip.vn" ? (
                          <button
                            type="button"
                            disabled={updatingId === u.id}
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              isSuspended
                                ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40"
                                : "bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40"
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Mở khóa</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Khóa tài khoản</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">
                            {u.email === "admin@learntrip.vn" ? "Root Admin" : "Chỉ xem"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

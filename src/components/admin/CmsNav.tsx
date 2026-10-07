"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/content";
import {
  Layers,
  PlusCircle,
  Image as ImageIcon,
  Bot,
  FileCheck,
  History,
  BarChart3,
  Users,
  ShieldAlert,
  Key,
  ArrowLeft,
  Search,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  User,
  LogOut,
  Command,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

export type CmsTab =
  | "explorer"
  | "create"
  | "media"
  | "ai_studio"
  | "review"
  | "versions"
  | "analytics"
  | "users"
  | "audit"
  | "sessions";

export interface NavGroup {
  name: string;
  items: {
    id: CmsTab;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    adminOnly?: boolean;
    badgeCount?: number;
  }[];
}

interface CmsNavProps {
  activeTab: CmsTab;
  setActiveTab: (tab: CmsTab) => void;
  reviewCount: number;
  currentVersionNumber: number;
  onBackToGame: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function useCmsNavGroups(reviewCount: number) {
  return useMemo<NavGroup[]>(
    () => [
      {
        name: "NỘI DUNG",
        items: [
          {
            id: "explorer",
            label: "Cấu trúc nội dung",
            shortLabel: "Nội dung",
            description: "Duyệt địa danh, chương học, bài học & quest",
            icon: Layers,
          },
          {
            id: "create",
            label: "Tạo Quest mới",
            shortLabel: "Tạo mới",
            description: "Trình tạo câu hỏi tương tác trắc nghiệm/sắp xếp",
            icon: PlusCircle,
          },
          {
            id: "media",
            label: "Thư viện Media",
            shortLabel: "Media",
            description: "Kho lưu trữ hình ảnh & âm thanh bài học",
            icon: ImageIcon,
          },
          {
            id: "ai_studio",
            label: "AI Content Studio",
            shortLabel: "AI Studio",
            description: "Tạo tự động câu hỏi thông minh bằng AI",
            icon: Bot,
          },
        ],
      },
      {
        name: "DUYỆT & XUẤT BẢN",
        items: [
          {
            id: "review",
            label: "Hàng đợi duyệt",
            shortLabel: "Duyệt",
            description: "Kiểm tra và phê duyệt bản nháp trước xuất bản",
            icon: FileCheck,
            badgeCount: reviewCount,
          },
          {
            id: "versions",
            label: "Phiên bản & Xuất bản",
            shortLabel: "Xuất bản",
            description: "Phát hành phiên bản mới hoặc rollback an toàn",
            icon: History,
          },
        ],
      },
      {
        name: "PHÂN TÍCH",
        items: [
          {
            id: "analytics",
            label: "Analytics & I/O",
            shortLabel: "Phân tích",
            description: "Thống kê chất lượng & Nhập/Xuất JSON/CSV",
            icon: BarChart3,
          },
        ],
      },
      {
        name: "QUẢN TRỊ",
        items: [
          {
            id: "users",
            label: "Người dùng & Roles",
            shortLabel: "Người dùng",
            description: "Phân quyền quản trị viên, reviewer và creator",
            icon: Users,
            adminOnly: true,
          },
          {
            id: "audit",
            label: "Nhật ký kiểm duyệt",
            shortLabel: "Nhật ký",
            description: "Lịch sử thao tác và phê duyệt bảo mật",
            icon: ShieldAlert,
            adminOnly: true,
          },
          {
            id: "sessions",
            label: "Phiên & Bảo mật",
            shortLabel: "Bảo mật",
            description: "Quản lý phiên đăng nhập và khóa tài khoản",
            icon: Key,
            adminOnly: true,
          },
        ],
      },
    ],
    [reviewCount]
  );
}

// ═══════════════════════════════════════════════════════════
// Desktop Collapsible Sidebar
// ═══════════════════════════════════════════════════════════
export function CmsSidebar({
  activeTab,
  setActiveTab,
  reviewCount,
  currentVersionNumber,
  onBackToGame,
  sidebarCollapsed,
  setSidebarCollapsed,
}: CmsNavProps) {
  const { user } = useAuth();
  const currentRole = (user?.role as UserRole) || "admin";
  const groups = useCmsNavGroups(reviewCount);

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 bg-slate-950 border-r border-slate-800/80 z-30 transition-all duration-300 ${
        sidebarCollapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="font-black text-sm tracking-tight text-white leading-none">
                Learn.Trip <span className="text-amber-400">CMS</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                Content Studio
              </div>
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20">
            <Layers className="w-5 h-5 text-slate-950" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
            sidebarCollapsed ? "hidden" : ""
          }`}
          title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scrollbar">
        {groups.map((group) => {
          // Hide admin group if user is not admin
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || currentRole === "admin"
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.name} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {group.name}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px] ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              isActive
                                ? "bg-slate-950 text-amber-400"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-2 border-t border-slate-800/80 space-y-1.5">
        {!sidebarCollapsed && (
          <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Bản phát hành</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
              v{currentVersionNumber}.0
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onBackToGame}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer min-h-[40px] ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
          title="Về Game Player"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Về Game Player</span>}
        </button>

        {sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl"
            title="Mở rộng menu"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// Top CMS Header Bar
// ═══════════════════════════════════════════════════════════
interface CmsTopBarProps {
  activeTab: CmsTab;
  sidebarCollapsed: boolean;
  onOpenCommandPalette: () => void;
  onBackToGame: () => void;
  reviewCount: number;
}

export function CmsTopBar({
  activeTab,
  sidebarCollapsed,
  onOpenCommandPalette,
  onBackToGame,
  reviewCount,
}: CmsTopBarProps) {
  const { user, logout } = useAuth();
  const currentRole = (user?.role as UserRole) || "admin";
  const groups = useCmsNavGroups(reviewCount);

  // Find active item info for breadcrumb
  let activeGroup = "";
  let activeLabel = "";
  for (const g of groups) {
    const item = g.items.find((i) => i.id === activeTab);
    if (item) {
      activeGroup = g.name;
      activeLabel = item.label;
      break;
    }
  }

  const roleBadgeConfig = {
    admin: { label: "ADMIN", bg: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: ShieldCheck },
    reviewer: { label: "REVIEWER", bg: "bg-sky-500/20 text-sky-400 border-sky-500/30", icon: UserCheck },
    creator: { label: "CREATOR", bg: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: User },
    learner: { label: "LEARNER", bg: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: User },
  }[currentRole] || { label: currentRole.toUpperCase(), bg: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: User };

  const RoleIcon = roleBadgeConfig.icon;

  return (
    <header
      className={`sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300 ${
        sidebarCollapsed ? "md:ml-18" : "md:ml-64"
      }`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-extrabold text-slate-400">CMS</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400 hidden sm:inline">{activeGroup}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <span className="font-black text-white">{activeLabel}</span>
      </div>

      {/* Right Actions: Command palette, User & Role pill, Return to Game */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-xs font-bold cursor-pointer"
          title="Tìm kiếm nhanh (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tìm kiếm...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Back to game (desktop) */}
        <button
          type="button"
          onClick={onBackToGame}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về Game</span>
        </button>

        {/* Current User & Real Role Pill (Non-switchable) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-black text-white leading-tight">
              {user?.displayName || "Quản trị viên"}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
              {user?.email}
            </div>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black uppercase tracking-wider ${roleBadgeConfig.bg}`}
            title={`Vai trò thực tế: ${roleBadgeConfig.label}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleBadgeConfig.label}</span>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// Mobile 4-Tab Bottom Bar + More Bottom Sheet
// ═══════════════════════════════════════════════════════════
interface CmsMobileNavProps {
  activeTab: CmsTab;
  setActiveTab: (tab: CmsTab) => void;
  reviewCount: number;
  onBackToGame: () => void;
}

export function CmsMobileNav({
  activeTab,
  setActiveTab,
  reviewCount,
  onBackToGame,
}: CmsMobileNavProps) {
  const { user } = useAuth();
  const currentRole = (user?.role as UserRole) || "admin";
  const [sheetOpen, setSheetOpen] = useState(false);
  const groups = useCmsNavGroups(reviewCount);

  // 4 Primary Mobile Tabs: Nội dung (explorer), Tạo mới (create), Duyệt (review), Thêm (sheet)
  const primaryTabs: { id: CmsTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: "explorer", label: "Nội dung", icon: Layers },
    { id: "create", label: "Tạo mới", icon: PlusCircle },
    { id: "review", label: "Duyệt", icon: FileCheck, badge: reviewCount },
  ];

  const isMoreActive = !primaryTabs.some((t) => t.id === activeTab);

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-1 flex justify-around items-center min-h-[60px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSheetOpen(false);
                setActiveTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold min-h-[48px] min-w-[64px] cursor-pointer transition-colors ${
                isActive ? "text-amber-400 font-black" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-amber-400 scale-110" : ""}`} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* 4th Tab: "Thêm" (More) */}
        <button
          type="button"
          onClick={() => setSheetOpen(!sheetOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-bold min-h-[48px] min-w-[64px] cursor-pointer transition-colors ${
            isMoreActive || sheetOpen ? "text-amber-400 font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${isMoreActive || sheetOpen ? "text-amber-400 scale-110" : ""}`} />
          <span>Thêm</span>
        </button>
      </nav>

      {/* Bottom Sheet for More Options */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[80vh] overflow-y-auto p-5 pb-8 space-y-5 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="font-black text-sm text-white">Tất cả chức năng CMS</div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grouped items */}
              <div className="space-y-4">
                {groups.map((group) => {
                  const visibleItems = group.items.filter(
                    (item) => !item.adminOnly || currentRole === "admin"
                  );
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={group.name} className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                        {group.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {visibleItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(item.id);
                                setSheetOpen(false);
                              }}
                              className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold text-left transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-amber-500 text-slate-950 font-black"
                                  : "bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:border-amber-500/40"
                              }`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSheetOpen(false);
                    onBackToGame();
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Về Game Player</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Command Palette (Ctrl/Cmd+K)
// ═══════════════════════════════════════════════════════════
interface CmsCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: CmsTab) => void;
  reviewCount: number;
}

export function CmsCommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  reviewCount,
}: CmsCommandPaletteProps) {
  const { user } = useAuth();
  const currentRole = (user?.role as UserRole) || "admin";
  const groups = useCmsNavGroups(reviewCount);
  const [query, setQuery] = useState("");

  // Shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Toggle if currently open or close
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const allItems = useMemo(() => {
    return groups.flatMap((g) =>
      g.items
        .filter((item) => !item.adminOnly || currentRole === "admin")
        .map((item) => ({ ...item, groupName: g.name }))
    );
  }, [groups, currentRole]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.groupName.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm tính năng CMS, thao tác nhanh..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden font-bold"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-bold">
              Không tìm thấy mục nào khớp với &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-slate-800 transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        • {item.groupName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.description}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

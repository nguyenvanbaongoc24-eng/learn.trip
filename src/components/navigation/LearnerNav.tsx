"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  BookOpen,
  Trophy,
  UserCircle,
  Flame,
  Star,
  Settings,
  LogIn,
  LogOut,
  Shield,
  ChevronDown,
  Cloud,
  CloudOff,
  Menu,
  X,
} from "lucide-react";
import { sounds } from "@/utils/soundEffects";
import { tabColors, motionVariants, springs } from "@/lib/design/tokens";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// ─── Tab definitions ────────────────────────────────────────
export type LearnerTab = "explore" | "passport" | "challenges" | "profile";

interface TabDef {
  id: LearnerTab;
  label: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorKey: keyof typeof tabColors;
}

const tabDefs: TabDef[] = [
  { id: "explore", label: "Khám phá", labelEn: "Explore", icon: Compass, colorKey: "explore" },
  { id: "passport", label: "Hộ chiếu", labelEn: "Passport", icon: BookOpen, colorKey: "passport" },
  { id: "challenges", label: "Thử thách", labelEn: "Challenges", icon: Trophy, colorKey: "challenges" },
  { id: "profile", label: "Hồ sơ", labelEn: "Profile", icon: UserCircle, colorKey: "profile" },
];

// ─── Props ──────────────────────────────────────────────────
interface LearnerNavProps {
  activeTab: LearnerTab;
  setActiveTab: (tab: LearnerTab) => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

// ═══════════════════════════════════════════════════════════
// Desktop Sidebar (≥ md)
// ═══════════════════════════════════════════════════════════
export function LearnerSidebar({ activeTab, setActiveTab, onOpenAuth, onOpenSettings }: LearnerNavProps) {
  const { progress, locale, syncStatus } = useGame();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-slate-200/80 z-40">
      {/* Logo */}
      <button
        type="button"
        onClick={() => setActiveTab("explore")}
        className="flex items-center gap-2.5 px-5 py-4 group text-left cursor-pointer border-b border-slate-100"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
          🇻🇳
        </div>
        <div>
          <div className="font-black text-lg tracking-tight text-slate-800 leading-none">
            Learn<span className="text-amber-500">.</span>Trip
          </div>
          <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">
            Explore Vietnam
          </div>
        </div>
      </button>

      {/* Navigation tabs */}
      <nav className="flex-1 py-3 px-3 space-y-1" role="navigation" aria-label="Main navigation">
        {tabDefs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = tabColors[tab.colorKey];
          const label = locale === "vi" ? tab.label : tab.labelEn;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer min-h-[48px] whitespace-nowrap ${
                isActive
                  ? `${color.bgMuted} ${color.text} font-black`
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
              whileTap={{ scale: 0.95 }}
              transition={springs.squish}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${color.bg}`}
                  transition={springs.smooth}
                />
              )}

              <Icon className={`w-5 h-5 shrink-0 ${isActive ? color.textActive : "text-slate-400"}`} />
              <span>{label}</span>

              {/* Active dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className={`ml-auto w-2 h-2 rounded-full ${color.bg}`}
                    {...motionVariants.tabDot}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2">
        <motion.button
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenSettings?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
          <span>{locale === "vi" ? "Cài đặt" : "Settings"}</span>
        </motion.button>
      </div>

      {/* Bottom user card */}
      <div className="border-t border-slate-100 p-3" ref={menuRef}>
        {isAuthenticated && user ? (
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              whileTap={{ scale: 0.97 }}
            >
              <img
                src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Learner"}
                alt={user.displayName}
                className="w-9 h-9 rounded-xl object-cover bg-amber-100 border-2 border-amber-300 shrink-0"
              />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-black text-slate-800 truncate" title={user.displayName}>
                  {user.displayName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${userMenuOpen ? "rotate-180" : ""}`} />
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={springs.squish}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs"
                >
                  {/* Sync status */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <SyncBadge isAuthenticated={isAuthenticated} syncStatus={syncStatus} />
                  </div>

                  {/* Staff link */}
                  {isStaff && (
                    <a
                      href="/cms"
                      className="w-full px-4 py-2.5 text-left text-amber-600 hover:bg-amber-50 flex items-center gap-2.5 font-black cursor-pointer group"
                    >
                      <Shield className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span>Khu vực quản trị</span>
                    </a>
                  )}

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            type="button"
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer min-h-[48px]"
            whileTap={{ scale: 0.95 }}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </motion.button>
        )}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════
// Top Bar (minimal — streak, XP, avatar)
// ═══════════════════════════════════════════════════════════
export function LearnerTopBar({ activeTab, setActiveTab, onOpenAuth, onOpenSettings }: LearnerNavProps) {
  const { progress, locale, syncStatus } = useGame();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
      <div className="md:ml-[220px] px-4 h-14 flex items-center justify-between gap-3">
        {/* Mobile: Logo + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-base shadow-sm">
              🇻🇳
            </div>
            <span className="font-black text-base text-slate-800">
              Learn<span className="text-amber-500">.</span>Trip
            </span>
          </button>
        </div>

        {/* Desktop: breadcrumb / page title */}
        <div className="hidden md:flex items-center">
          <h2 className="text-sm font-black text-slate-700">
            {tabDefs.find(t => t.id === activeTab)?.[locale === "vi" ? "label" : "labelEn"] || ""}
          </h2>
        </div>

        {/* Right side: Streak, XP, Sync, Avatar */}
        <div className="flex items-center gap-2">
          {/* Streak */}
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-black text-orange-600"
            title="Chuỗi ngày phiêu lưu"
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>{progress.streak}</span>
          </motion.div>

          {/* XP */}
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700"
            title="Điểm kinh nghiệm (XP)"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <AnimatedCounter value={progress.xp} />
          </motion.div>

          {/* Sync — compact icon */}
          <div className="hidden sm:block">
            <SyncBadge isAuthenticated={isAuthenticated} syncStatus={syncStatus} compact />
          </div>

          {/* Avatar / Login button */}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <motion.button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center p-1 cursor-pointer"
                whileTap={{ scale: 0.93 }}
                aria-label="Menu tài khoản"
              >
                <img
                  src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Learner"}
                  alt={user.displayName}
                  className="w-9 h-9 rounded-xl object-cover bg-amber-100 border-2 border-amber-300"
                />
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={springs.squish}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs"
                  >
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-extrabold text-slate-800 text-sm truncate" title={user.displayName}>
                        {user.displayName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Menu items — Profile, Settings */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setActiveTab("profile"); setUserMenuOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <UserCircle className="w-4 h-4 text-slate-400" />
                        <span>Hồ sơ người học</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); onOpenSettings?.(); }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Cài đặt</span>
                      </button>
                    </div>

                    {/* Staff CMS link */}
                    {isStaff && (
                      <div className="py-1 border-t border-slate-100">
                        <a
                          href="/cms"
                          className="w-full px-4 py-2.5 text-left text-amber-600 hover:bg-amber-50 flex items-center gap-2.5 font-black cursor-pointer group"
                        >
                          <Shield className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                          <span>Khu vực quản trị (CMS)</span>
                        </a>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer min-h-[44px]"
              whileTap={{ scale: 0.93 }}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
// Mobile Bottom Tab Bar (< md)
// ═══════════════════════════════════════════════════════════
export function LearnerBottomTabs({ activeTab, setActiveTab }: { activeTab: LearnerTab; setActiveTab: (tab: LearnerTab) => void }) {
  const { locale } = useGame();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      role="navigation"
      aria-label="Tab navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {tabDefs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const color = tabColors[tab.colorKey];
          const label = locale === "vi" ? tab.label : tab.labelEn;

          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl min-h-[48px] min-w-[60px] cursor-pointer transition-colors ${
                isActive
                  ? `${color.bgMuted} ${color.text} font-black`
                  : "text-slate-400"
              }`}
              whileTap={{ scale: 0.88 }}
              transition={springs.squish}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                animate={isActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                transition={springs.bouncy}
              >
                <Icon className={`w-6 h-6 ${isActive ? color.textActive : "text-slate-400"}`} />
              </motion.div>
              <span className="text-[10px] font-bold whitespace-nowrap leading-tight">
                {label}
              </span>

              {/* Active dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${color.bg}`}
                    {...motionVariants.tabDot}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// Sync Status Badge (reusable)
// ═══════════════════════════════════════════════════════════
function SyncBadge({
  isAuthenticated,
  syncStatus,
  compact = false,
}: {
  isAuthenticated: boolean;
  syncStatus: string;
  compact?: boolean;
}) {
  if (compact) {
    // Just an icon
    if (!isAuthenticated) {
      return (
        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200" title="Chế độ Khách">
          <CloudOff className="w-4 h-4 text-slate-400" />
        </div>
      );
    }
    if (syncStatus === "synced") {
      return (
        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200" title="Đã lưu đám mây">
          <Cloud className="w-4 h-4 text-emerald-500" />
        </div>
      );
    }
    if (syncStatus === "syncing") {
      return (
        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 animate-pulse" title="Đang đồng bộ...">
          <Cloud className="w-4 h-4 text-amber-500" />
        </div>
      );
    }
    return (
      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200" title="Mất kết nối">
        <CloudOff className="w-4 h-4 text-slate-400" />
      </div>
    );
  }

  // Full badge
  const label = !isAuthenticated
    ? "Chế độ Khách"
    : syncStatus === "synced"
    ? "Đã lưu"
    : syncStatus === "syncing"
    ? "Đang lưu..."
    : "Chưa kết nối";

  const IconComp = isAuthenticated && syncStatus !== "offline" ? Cloud : CloudOff;
  const colorClass = !isAuthenticated
    ? "text-slate-400"
    : syncStatus === "synced"
    ? "text-emerald-500"
    : syncStatus === "syncing"
    ? "text-amber-500 animate-pulse"
    : "text-slate-400";

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
      <IconComp className={`w-3.5 h-3.5 ${colorClass}`} />
      <span>{label}</span>
    </div>
  );
}

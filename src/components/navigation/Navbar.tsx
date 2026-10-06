"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  BookOpen,
  Award,
  Flame,
  Star,
  Globe,
  Volume2,
  VolumeX,
  User,
  LogIn,
  LogOut,
  Shield,
  ChevronDown,
  Settings,
} from "lucide-react";
import { sounds } from "@/utils/soundEffects";

export type TabType = "home" | "map" | "passport" | "profile";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenSettings }: NavbarProps) {
  const { progress, locale, setLocale } = useGame();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const [soundOn, setSoundOn] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundOn(sounds.isEnabled());
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundOn(next);
  };

  const toggleLanguage = () => {
    sounds.playClick();
    setLocale(locale === "vi" ? "en" : "vi");
  };

  const navItems = [
    { id: "home", label: locale === "vi" ? "Trang chủ" : "Home", icon: Compass },
    { id: "map", label: locale === "vi" ? "Bản đồ" : "Map", icon: Compass },
    { id: "passport", label: locale === "vi" ? "Hộ chiếu" : "Passport", icon: BookOpen },
    { id: "profile", label: locale === "vi" ? "Hồ sơ" : "Profile", icon: Award },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            🇻🇳
          </div>
          <div>
            <div className="font-black text-xl tracking-tight text-slate-800 leading-none">
              Learn<span className="text-amber-500">.</span>Trip
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Explore Vietnam
            </div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicators, Language & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-xl text-xs font-black text-orange-600 shadow-2xs"
            title="Chuỗi ngày phiêu lưu (Streak)"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>{progress.streak}</span>
          </div>

          {/* XP */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700 shadow-2xs"
            title="Điểm kinh nghiệm (XP)"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{progress.xp} XP</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="hidden sm:flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
            title={soundOn ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Chuyển đổi ngôn ngữ Tiếng Việt / English"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="uppercase">{locale}</span>
          </button>

          {/* User Account / Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl transition-all cursor-pointer min-h-[44px]"
                aria-label="Menu tài khoản"
              >
                <img
                  src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Learner"}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-xl object-cover bg-amber-100 border border-amber-300"
                />
                <span className="hidden sm:inline font-bold text-xs text-slate-800 max-w-[100px] truncate">
                  {user.displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn text-xs">
                  {/* User Profile Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="font-extrabold text-slate-800 text-sm truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                        Vai trò: {user.role}
                      </span>
                      {user.cefrLevel && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                          CEFR {user.cefrLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standard Menu Items */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("profile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Hồ sơ người học</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("passport");
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>Hộ chiếu & Huy hiệu</span>
                    </button>

                    {/* Settings button */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSettings?.();
                      }}
                      className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Cài đặt</span>
                    </button>
                  </div>

                  {/* Staff Only Section: Khu vực quản trị (CMS) */}
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
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer min-h-[44px]"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}) {
  const { locale } = useGame();

  const navItems = [
    { id: "home", label: locale === "vi" ? "Trang chủ" : "Home", icon: Compass },
    { id: "map", label: locale === "vi" ? "Bản đồ" : "Map", icon: Compass },
    { id: "passport", label: locale === "vi" ? "Hộ chiếu" : "Passport", icon: BookOpen },
    { id: "profile", label: locale === "vi" ? "Hồ sơ" : "Profile", icon: Award },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all min-h-[44px] min-w-[48px] ${
              isActive ? "text-amber-600 font-bold" : "text-slate-500 font-medium"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
            <span className="text-[11px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

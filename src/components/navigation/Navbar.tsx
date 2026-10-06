"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Compass, BookOpen, Award, Flame, Star, Globe, Volume2, VolumeX } from "lucide-react";
import { sounds } from "@/utils/soundEffects";

export type TabType = "home" | "map" | "passport" | "profile";

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCms?: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenCms }: NavbarProps) {
  const { progress, locale, setLocale } = useGame();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(sounds.isEnabled());
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

        {/* Status Indicators & Language */}
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
            className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
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

          {/* CMS Creator Switcher */}
          {onOpenCms && (
            <button
              type="button"
              onClick={onOpenCms}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-xl text-xs font-black transition-colors cursor-pointer"
              title="Mở Studio Quản trị Nội dung (CMS)"
            >
              <span>⚙️ CMS</span>
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
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
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

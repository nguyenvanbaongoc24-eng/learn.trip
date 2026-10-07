"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import {
  LearnerSidebar,
  LearnerTopBar,
  LearnerBottomTabs,
  LearnerTab,
} from "@/components/navigation/LearnerNav";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { MapScreen } from "@/components/screens/MapScreen";
import { PassportScreen } from "@/components/screens/PassportScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { ChallengesScreen } from "@/components/screens/ChallengesScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { LocationPreviewModal } from "@/components/screens/LocationPreviewModal";
import { QuestModal } from "@/components/game/QuestModal";
import { CelebrationModal } from "@/components/game/CelebrationModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { Location, Quest } from "@/types/content";
import { motionVariants } from "@/lib/design/tokens";

// Dynamic import for 3D component (no SSR - Three.js needs browser)
const Explore3DModal = dynamic(
  () => import("@/components/game/Explore3DModal").then((m) => m.Explore3DModal),
  { ssr: false }
);

const ONBOARDING_DONE_KEY = "learntrip_onboarding_done";

export default function LearnerHomePage() {
  const { currentLocation, getNextLocation, progress, checkInPoi } = useGame();
  const { user, isAuthenticated, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<LearnerTab>("explore");
  const [showSettings, setShowSettings] = useState(false);
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [show3D, setShow3D] = useState<boolean>(false);
  const [selected3DLocation, setSelected3DLocation] = useState<string>("loc-hanoi");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding is needed after registration/login
  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardingDone = localStorage.getItem(`${ONBOARDING_DONE_KEY}_${user.id}`);
      if (!onboardingDone) {
        // Small delay to let auth modal close first
        const timer = setTimeout(() => setShowOnboarding(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const handleOpenLocation = (location: Location) => {
    setPreviewLocation(location);
  };

  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
  };

  // When quest modal closes after completion, auto-navigate to next location/quest
  const handleQuestClose = useCallback(() => {
    setActiveQuest(null);
    setPreviewLocation(null);
  }, []);

  // When celebration modal is dismissed, auto-open next location if available
  const handleCelebrationDismissed = useCallback(() => {
    const nextLoc = getNextLocation();
    if (nextLoc) {
      setTimeout(() => {
        setPreviewLocation(nextLoc);
      }, 400);
    }
  }, [getNextLocation]);

  // Open the 3D explore globe or city diorama
  const handleOpen3D = useCallback((locationId?: string) => {
    setSelected3DLocation(locationId || currentLocation?.id || "loc-hanoi");
    setShow3D(true);
  }, [currentLocation]);

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: { cefrLevel: string; dailyGoal: string; interests: string[] }) => {
    // Save onboarding preferences
    if (user) {
      localStorage.setItem(`${ONBOARDING_DONE_KEY}_${user.id}`, "true");
      localStorage.setItem(`learntrip_daily_goal_${user.id}`, data.dailyGoal);
      localStorage.setItem(`learntrip_interests_${user.id}`, JSON.stringify(data.interests));

      // Update CEFR level on server
      try {
        await fetch("/api/auth/update-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cefrLevel: data.cefrLevel }),
        });
        await refreshSession();
      } catch {
        // Silently fail - non-critical
      }
    }

    setShowOnboarding(false);
  };

  // Handle tab changes — close settings if open
  const handleTabChange = (tab: LearnerTab) => {
    if (showSettings) setShowSettings(false);
    setActiveTab(tab);
  };

  // Handle opening settings
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const openAuthModal = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  // ─── Render screen content ────────────────────────────────
  const renderContent = () => {
    if (showSettings) {
      return <SettingsScreen onBack={() => setShowSettings(false)} />;
    }

    switch (activeTab) {
      case "explore":
        return (
          <>
            <HomeScreen
              onNavigateTab={(tab: string) => {
                // Map old tab names to new ones
                if (tab === "home" || tab === "map") setActiveTab("explore");
                else if (tab === "passport") setActiveTab("passport");
                else if (tab === "profile") setActiveTab("profile");
                else setActiveTab(tab as LearnerTab);
              }}
              onOpenLocation={handleOpenLocation}
              onOpen3D={(locId) => handleOpen3D(locId || currentLocation?.id || "loc-hanoi")}
            />
            {/* Map is now integrated into explore — show below home */}
            <div className="mt-4">
              <MapScreen
                onSelectLocation={handleOpenLocation}
                onOpen3D={(locId) => handleOpen3D(locId)}
              />
            </div>
          </>
        );
      case "passport":
        return <PassportScreen />;
      case "challenges":
        return <ChallengesScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      {/* Scenic Vietnam Landmark Ambient Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none z-0">
        <img
          src={currentLocation?.heroImage || "/assets/locations/hanoi.jpg"}
          alt=""
          className="w-full h-full object-cover opacity-15 filter blur-xs"
          role="presentation"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50" />
      </div>

      {/* Desktop Sidebar */}
      <LearnerSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={openAuthModal}
        onOpenSettings={handleOpenSettings}
      />

      {/* Top Bar */}
      <LearnerTopBar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={openAuthModal}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Screen Content */}
      <main className="flex-1 relative z-10 pb-20 md:pb-6 md:ml-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={showSettings ? "settings" : activeTab}
            variants={motionVariants.tabContent}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <LearnerBottomTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Location Preview Drawer / Modal */}
      {previewLocation && (
        <LocationPreviewModal
          location={previewLocation}
          onClose={() => setPreviewLocation(null)}
          onStartQuest={handleStartQuest}
          onOpen3D={(locId) => handleOpen3D(locId)}
        />
      )}

      {/* Active Quest Runner Modal */}
      {activeQuest && (
        <QuestModal
          quest={activeQuest}
          onClose={handleQuestClose}
          onOpen3D={(locId) => handleOpen3D(locId || currentLocation?.id || "loc-hanoi")}
        />
      )}

      {/* Celebratory Unlock & Stamp Modal */}
      <CelebrationModal onAfterDismiss={handleCelebrationDismissed} />

      {/* 3D Vietnam Globe & Heritage Diorama Explorer */}
      <Explore3DModal
        isOpen={show3D}
        initialLocationId={selected3DLocation}
        onClose={() => setShow3D(false)}
        checkedInPoiIds={progress.checkedInPoiIds || []}
        onCheckIn={checkInPoi}
      />

      {/* Authentication Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Onboarding Modal (3-step wizard after first login/register) */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        displayName={user?.displayName || "Bạn"}
      />
    </div>
  );
}

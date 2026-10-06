"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useGame } from "@/context/GameContext";
import { Navbar, MobileTabBar, TabType } from "@/components/navigation/Navbar";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { MapScreen } from "@/components/screens/MapScreen";
import { PassportScreen } from "@/components/screens/PassportScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { LocationPreviewModal } from "@/components/screens/LocationPreviewModal";
import { QuestModal } from "@/components/game/QuestModal";
import { CelebrationModal } from "@/components/game/CelebrationModal";
import { Location, Quest } from "@/types/content";

// Dynamic import for 3D component (no SSR - Three.js needs browser)
const Explore3DModal = dynamic(
  () => import("@/components/game/Explore3DModal").then((m) => m.Explore3DModal),
  { ssr: false }
);

export default function LearnerHomePage() {
  const { currentLocation, getNextLocation, progress, checkInPoi } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [show3D, setShow3D] = useState<boolean>(false);
  const [selected3DLocation, setSelected3DLocation] = useState<string>("loc-hanoi");

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      {/* Scenic Vietnam Landmark Ambient Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none z-0">
        <img
          src={currentLocation?.heroImage || "/assets/locations/hanoi.jpg"}
          alt="Vietnam Scenic Backdrop"
          className="w-full h-full object-cover opacity-20 filter blur-xs"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-50/80 to-slate-50" />
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => {
          // Will be connected to AuthModal in Phase 2
          setActiveTab("profile");
        }}
      />

      {/* Main Screen Content */}
      <main className="flex-1 relative z-10 pb-16 md:pb-6">
        {activeTab === "home" && (
          <HomeScreen
            onNavigateTab={setActiveTab}
            onOpenLocation={handleOpenLocation}
            onOpen3D={(locId) => handleOpen3D(locId || currentLocation?.id || "loc-hanoi")}
          />
        )}
        {activeTab === "map" && (
          <MapScreen
            onSelectLocation={handleOpenLocation}
            onOpen3D={(locId) => handleOpen3D(locId)}
          />
        )}
        {activeTab === "passport" && <PassportScreen />}
        {activeTab === "profile" && <ProfileScreen />}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

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
    </div>
  );
}

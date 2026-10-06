"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameProvider } from "@/context/GameContext";
import { CmsDashboard } from "@/components/admin/CmsDashboard";

function CmsDashboardWrapper() {
  const router = useRouter();

  const handleBackToGame = () => {
    router.push("/");
  };

  return <CmsDashboard onBackToGame={handleBackToGame} />;
}

export default function CmsPage() {
  return (
    <GameProvider>
      <CmsDashboardWrapper />
    </GameProvider>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GameProvider } from "@/context/GameContext";
import { CmsDashboard } from "@/components/admin/CmsDashboard";

function AdminPageInner() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <CmsDashboard onBackToGame={handleBack} />;
}

export default function AdminPage() {
  return (
    <GameProvider>
      <AdminPageInner />
    </GameProvider>
  );
}

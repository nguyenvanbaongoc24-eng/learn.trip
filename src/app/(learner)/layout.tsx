"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { GameProvider } from "@/context/GameContext";

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-200">
          {children}
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

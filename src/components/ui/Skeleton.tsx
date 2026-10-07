"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rectangular" | "circular" | "rounded";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "rounded",
  width,
  height,
}: SkeletonProps) {
  const roundedClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "rectangular"
      ? "rounded-none"
      : "rounded-2xl";

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800 ${roundedClass} ${className}`}
    />
  );
}

/** Card Skeleton for Quests, Locations, or Chapters */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width={44} height={44} />
        <Skeleton variant="rounded" width={80} height={24} className="rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton width="70%" height={20} />
        <Skeleton width="45%" height={14} />
      </div>
      <Skeleton height={140} className="w-full rounded-2xl" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton width={90} height={20} className="rounded-full" />
        <Skeleton width={110} height={36} className="rounded-xl" />
      </div>
    </div>
  );
}

/** Leaderboard Rows Skeleton */
export function LeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs animate-pulse"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-1.5">
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={10} />
            </div>
          </div>
          <Skeleton width={60} height={24} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Passport Stamps Grid Skeleton */
export function PassportSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-3xl bg-amber-950/40 border border-amber-800/40 min-h-[190px] flex flex-col justify-between animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={48} height={48} className="bg-amber-900/50" />
              <div className="space-y-2">
                <Skeleton width={60} height={12} className="bg-amber-900/50" />
                <Skeleton width={110} height={16} className="bg-amber-900/50" />
              </div>
            </div>
            <Skeleton variant="circular" width={24} height={24} className="bg-amber-900/50" />
          </div>
          <Skeleton width="80%" height={12} className="bg-amber-900/50" />
          <div className="pt-3 border-t border-amber-800/30 flex items-center justify-between">
            <Skeleton width={80} height={12} className="bg-amber-900/50" />
            <Skeleton width={50} height={12} className="bg-amber-900/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** CMS Table Skeleton */
export function CmsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <Skeleton width={160} height={24} />
        <Skeleton width={120} height={36} className="rounded-xl" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton variant="circular" width={36} height={36} />
              <div className="space-y-1.5 flex-1 max-w-sm">
                <Skeleton width="75%" height={14} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
            <Skeleton width={80} height={24} className="rounded-full" />
            <Skeleton width={100} height={32} className="rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

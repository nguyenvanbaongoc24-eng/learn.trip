"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import {
  Quest,
  Question,
  QuestionType,
  ContentStatus,
  UserRole,
} from "@/types/content";
import { MediaManagerView } from "./MediaManagerView";
import { ReviewDiffModal } from "./ReviewDiffModal";
import {
  computeHealthStats,
  exportLocationsJSON,
  exportQuestsCSV,
  parseLocationsJSON,
} from "@/utils/contentIO";
import {
  Layers,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  History,
  AlertCircle,
  Bot,
  ArrowLeft,
  FileCheck,
  Image as ImageIcon,
  Volume2,
  Search,
  Filter,
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Download,
  Upload,
  ShieldCheck,
  UserCheck,
  User,
  FileDiff,
  Users,
  ShieldAlert,
  Key,
} from "lucide-react";
import { CmsUsersView } from "./CmsUsersView";
import { CmsAuditLogsView } from "./CmsAuditLogsView";
import { CmsSessionsView } from "./CmsSessionsView";

type CmsTab =
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

interface CmsDashboardProps {
  onBackToGame: () => void;
}

export function CmsDashboard({ onBackToGame }: CmsDashboardProps) {
  const {
    allLocations,
    versions,
    currentVersionNumber,
    setAllLocations,
    addQuestToLesson,
    deleteQuest,
    cloneQuest,
    reorderQuest,
    updateQuestStatus,
    publishContentChanges,
    rollbackToVersion,
    generateAIQuestionDraft,
    t,
  } = useGame();

  const [activeTab, setActiveTab] = useState<CmsTab>("explorer");
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [hasDirtyDraft, setHasDirtyDraft] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "info" | "warning";
  } | null>(null);

  // beforeunload unsaved draft warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasDirtyDraft) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasDirtyDraft]);

  // CMS Inactivity Timeout Auto-lock (15 minutes idle security policy)
  const [isIdleWarning, setIsIdleWarning] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(60);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      if (isIdleWarning) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdleWarning(true);
        setIdleSecondsLeft(60);
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [isIdleWarning]);

  useEffect(() => {
    if (!isIdleWarning) return;
    const interval = setInterval(() => {
      setIdleSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = "/cms/login";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isIdleWarning]);

  const showNotify = (
    text: string,
    type: "success" | "info" | "warning" = "success"
  ) => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Find all quests across all locations for review queue
  const allQuestsWithMeta = allLocations.flatMap((loc) =>
    (loc.chapters || []).flatMap((chap) =>
      chap.lessons.flatMap((les) =>
        les.quests.map((q) => ({
          location: loc,
          chapter: chap,
          lesson: les,
          quest: q,
        }))
      )
    )
  );

  const reviewQueue = allQuestsWithMeta.filter(
    (item) => item.quest.status === "draft" || item.quest.status === "in_review"
  );

  const approvedCount = allQuestsWithMeta.filter(
    (item) => item.quest.status === "approved"
  ).length;

  const tabs = [
    { id: "explorer", label: "Cấu trúc nội dung", shortLabel: "Nội dung", icon: Layers },
    { id: "create", label: "Tạo Quest mới", shortLabel: "Tạo mới", icon: PlusCircle },
    { id: "media", label: "Thư viện Media", shortLabel: "Media", icon: ImageIcon },
    { id: "ai_studio", label: "AI Content Studio", shortLabel: "AI Studio", icon: Bot },
    {
      id: "review",
      label: `Hàng đợi duyệt (${reviewQueue.length})`,
      shortLabel: `Duyệt (${reviewQueue.length})`,
      icon: FileCheck,
    },
    { id: "versions", label: "Phiên bản & Xuất bản", shortLabel: "Xuất bản", icon: History },
    { id: "analytics", label: "Analytics & I/O", shortLabel: "Analytics", icon: BarChart3 },
    { id: "users", label: "Người dùng & Roles", shortLabel: "Users", icon: Users },
    { id: "audit", label: "Nhật ký kiểm duyệt", shortLabel: "Nhật ký", icon: ShieldAlert },
    { id: "sessions", label: "Phiên & Bảo mật", shortLabel: "Bảo mật", icon: Key },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-slate-100 flex flex-col pb-20 sm:pb-6">
      {/* Top CMS Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBackToGame}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Game Player</span>
            <span className="sm:hidden">Game</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg text-white">
                  Learn.Trip <span className="text-amber-400">CMS</span>
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                  v{currentVersionNumber}.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Hệ thống Quản trị & Xuất bản nội dung bài học độc lập
              </p>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet CMS Action Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as CmsTab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 ml-2">
          {([
            { role: "admin" as UserRole, label: "Admin", Icon: ShieldCheck },
            { role: "reviewer" as UserRole, label: "Reviewer", Icon: UserCheck },
            { role: "creator" as UserRole, label: "Creator", Icon: User },
          ]).map(({ role, label, Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => setCurrentRole(role)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                currentRole === role
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div
          className={`text-white text-xs font-bold py-2.5 px-4 sm:px-6 flex items-center justify-center gap-2 animate-fadeIn shadow-md ${
            notification.type === "warning"
              ? "bg-amber-600"
              : notification.type === "info"
              ? "bg-sky-600"
              : "bg-emerald-600"
          }`}
        >
          {notification.type === "warning" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* CMS Body */}
      <div className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === "explorer" && (
          <ContentExplorerView
            allLocations={allLocations}
            t={t}
            onDelete={(locId: string, chapId: string, lesId: string, qId: string) => {
              deleteQuest(locId, chapId, lesId, qId);
              showNotify("Đã xoá Quest thành công.", "info");
            }}
            onClone={(locId: string, chapId: string, lesId: string, qId: string) => {
              cloneQuest(locId, chapId, lesId, qId);
              showNotify("Đã nhân bản Quest (Bản sao DRAFT).");
            }}
            onReorder={(locId: string, chapId: string, lesId: string, qId: string, dir: "up" | "down") => {
              reorderQuest(locId, chapId, lesId, qId, dir);
            }}
          />
        )}
        {activeTab === "create" && (
          <CreateQuestView
            allLocations={allLocations}
            onQuestCreated={(locId, chapId, lesId, q) => {
              addQuestToLesson(locId, chapId, lesId, q);
              setHasDirtyDraft(false);
              showNotify(`Đã lưu Quest "${q.title.vi}" ở trạng thái DRAFT!`);
              setActiveTab("review");
            }}
          />
        )}
        {activeTab === "media" && (
          <MediaManagerView allLocations={allLocations} />
        )}
        {activeTab === "ai_studio" && (
          <AiContentStudioView
            allLocations={allLocations}
            generateAiQuestion={generateAIQuestionDraft}
            onSaveAiQuest={(locId, chapId, lesId, q) => {
              addQuestToLesson(locId, chapId, lesId, q);
              showNotify(`Đã lưu câu hỏi từ AI Generator vào DRAFT thành công!`);
              setActiveTab("review");
            }}
          />
        )}
        {activeTab === "review" && (
          <ReviewQueueView
            queue={reviewQueue}
            t={t}
            currentRole={currentRole}
            onApprove={(locId: string, chapId: string, lesId: string, questId: string) => {
              updateQuestStatus(locId, chapId, lesId, questId, "approved", "Approved by Content Reviewer.");
              showNotify("Đã phê duyệt (APPROVED) Quest! Sẵn sàng xuất bản.");
            }}
            onRequestChange={(locId: string, chapId: string, lesId: string, questId: string, comment?: string) => {
              updateQuestStatus(locId, chapId, lesId, questId, "draft", comment || "Yêu cầu chỉnh sửa.");
              showNotify("Đã gửi yêu cầu chỉnh sửa (DRAFT).", "info");
            }}
          />
        )}
        {activeTab === "versions" && (
          <PublishingVersionsView
            versions={versions}
            approvedCount={approvedCount}
            onPublishLive={(name, notes) => {
              const newVer = publishContentChanges(name, notes);
              showNotify(`Xuất bản thành công phiên bản ${newVer.name}! Người chơi đã thấy nội dung mới.`);
            }}
            onRollback={(verId) => {
              const ok = rollbackToVersion(verId);
              if (ok) showNotify("Đã khôi phục snapshot phiên bản thành công!");
            }}
          />
        )}
        {activeTab === "analytics" && (
          <AnalyticsIOView
            allLocations={allLocations}
            setAllLocations={setAllLocations}
            showNotify={showNotify}
          />
        )}
        {activeTab === "users" && (
          <CmsUsersView currentRole={currentRole} showNotify={showNotify} />
        )}
        {activeTab === "audit" && (
          <CmsAuditLogsView showNotify={showNotify} />
        )}
        {activeTab === "sessions" && (
          <CmsSessionsView showNotify={showNotify} />
        )}
      </div>

      {/* Inactivity Security Warning Modal */}
      {isIdleWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500 w-full max-w-md rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                Cảnh báo An toàn Phiên làm việc CMS
              </h3>
              <p className="text-xs text-amber-400 font-bold">
                Bạn đã không thao tác trong 15 phút.
              </p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Để bảo vệ an toàn dữ liệu bài học và thông tin người dùng, hệ thống sẽ tự động khóa và đăng xuất sau{" "}
              <strong className="text-rose-400 font-mono text-sm">{idleSecondsLeft} giây</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                setIsIdleWarning(false);
                showNotify("Đã tiếp tục phiên làm việc an toàn!");
              }}
              className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg"
            >
              TIẾP TỤC LÀM VIỆC (GIA HẠN PHIÊN)
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Tab Bar */}
      <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center min-h-[60px]">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id as CmsTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all min-h-[48px] min-w-[56px] cursor-pointer ${
                isActive
                  ? "text-amber-400 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-amber-400 scale-110" : ""}`} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------
// 1. CONTENT EXPLORER TAB (Enhanced with Search, Filter & Actions)
// ---------------------------------------------------------------
function ContentExplorerView({
  allLocations,
  t,
  onDelete,
  onClone,
  onReorder,
}: {
  allLocations: any[];
  t: any;
  onDelete?: (locId: string, chapId: string, lesId: string, questId: string) => void;
  onClone?: (locId: string, chapId: string, lesId: string, questId: string) => void;
  onReorder?: (locId: string, chapId: string, lesId: string, questId: string, dir: "up" | "down") => void;
}) {
  const [selectedLocId, setSelectedLocId] = useState<string>(allLocations[0]?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectedLocation = allLocations.find((l) => l.id === selectedLocId) || allLocations[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Locations sidebar list */}
      <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Địa danh trong gói nội dung ({allLocations.length})
        </h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {allLocations.map((loc) => {
            const isSelected = loc.id === selectedLocId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocId(loc.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500/50 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{loc.iconEmoji}</span>
                  <div>
                    <div className="font-bold text-sm text-slate-200">
                      {loc.nameVi}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {loc.nameEn}
                    </div>
                  </div>
                </div>

                <StatusBadge status={loc.status} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters, Lessons & Quests Tree */}
      <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{selectedLocation.iconEmoji}</span>
            <div>
              <h2 className="text-xl font-black text-white">
                {selectedLocation.nameVi} ({selectedLocation.nameEn})
              </h2>
              <p className="text-xs text-slate-400">
                {t(selectedLocation.tagline)}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm Quest theo tên hoặc chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Chỉ DRAFT</option>
              <option value="in_review">Chỉ IN REVIEW</option>
              <option value="approved">Chỉ APPROVED</option>
              <option value="published">Chỉ PUBLISHED</option>
            </select>
          </div>
        </div>

        {/* Chapters list */}
        <div className="space-y-4">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400">
            Cấu trúc bài học (Chapters & Quests)
          </div>

          {selectedLocation.chapters && selectedLocation.chapters.length > 0 ? (
            selectedLocation.chapters.map((chap: any) => (
              <div
                key={chap.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-amber-400">
                    {t(chap.title)}
                  </h3>
                  <StatusBadge status={chap.status} />
                </div>

                {/* Lessons */}
                <div className="space-y-3 pl-3 border-l-2 border-slate-800">
                  {chap.lessons.map((les: any) => {
                    // Filter quests
                    const filteredQuests = les.quests.filter((q: any) => {
                      const matchesStatus =
                        statusFilter === "all" || q.status === statusFilter;
                      const titleVi = (q.title?.vi || "").toLowerCase();
                      const titleEn = (q.title?.en || "").toLowerCase();
                      const matchesSearch =
                        !searchQuery.trim() ||
                        titleVi.includes(searchQuery.toLowerCase()) ||
                        titleEn.includes(searchQuery.toLowerCase());
                      return matchesStatus && matchesSearch;
                    });

                    return (
                      <div key={les.id} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                          <span>📖 {t(les.title)}</span>
                          <StatusBadge status={les.status} />
                        </div>

                        {/* Quests */}
                        <div className="space-y-2 pl-4">
                          {filteredQuests.length > 0 ? (
                            filteredQuests.map((q: any, qIdx: number) => {
                              const isExpanded = expandedQuestId === q.id;
                              const isConfirmingDelete = confirmDeleteId === q.id;

                              return (
                                <div
                                  key={q.id}
                                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 transition-colors hover:border-slate-700"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div
                                      onClick={() =>
                                        setExpandedQuestId(
                                          isExpanded ? null : q.id
                                        )
                                      }
                                      className="cursor-pointer select-none flex-1"
                                    >
                                      <div className="font-bold text-xs text-white hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                        <span>⚔️</span>
                                        <span>{t(q.title)}</span>
                                        <span className="text-[10px] text-slate-500 font-normal">
                                          ({q.steps.length} câu • +{q.reward.xp} XP)
                                        </span>
                                      </div>
                                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                        {q.title?.en}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                      <StatusBadge status={q.status} />

                                      {/* Reorder Up */}
                                      {onReorder && (
                                        <button
                                          type="button"
                                          disabled={qIdx === 0}
                                          onClick={() =>
                                            onReorder(
                                              selectedLocation.id,
                                              chap.id,
                                              les.id,
                                              q.id,
                                              "up"
                                            )
                                          }
                                          title="Di chuyển lên"
                                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white border border-slate-800"
                                        >
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Reorder Down */}
                                      {onReorder && (
                                        <button
                                          type="button"
                                          disabled={qIdx === filteredQuests.length - 1}
                                          onClick={() =>
                                            onReorder(
                                              selectedLocation.id,
                                              chap.id,
                                              les.id,
                                              q.id,
                                              "down"
                                            )
                                          }
                                          title="Di chuyển xuống"
                                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-white border border-slate-800"
                                        >
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Clone */}
                                      {onClone && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            onClone(
                                              selectedLocation.id,
                                              chap.id,
                                              les.id,
                                              q.id
                                            )
                                          }
                                          title="Nhân bản Quest (Clone)"
                                          className="p-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Delete */}
                                      {onDelete && !isConfirmingDelete && (
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteId(q.id)}
                                          title="Xoá Quest"
                                          className="p-1 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Confirm Delete prompt */}
                                      {isConfirmingDelete && (
                                        <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800/80 p-0.5 rounded-lg">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              onDelete?.(
                                                selectedLocation.id,
                                                chap.id,
                                                les.id,
                                                q.id
                                              );
                                              setConfirmDeleteId(null);
                                            }}
                                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-black"
                                          >
                                            Xoá
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[10px]"
                                          >
                                            Huỷ
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expanded question details preview */}
                                  {isExpanded && (
                                    <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                                        Chi tiết các câu hỏi ({q.steps.length}):
                                      </div>
                                      <div className="space-y-1.5">
                                        {q.steps.map((step: any, sIdx: number) => (
                                          <div
                                            key={step.id || sIdx}
                                            className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/60 text-xs space-y-1"
                                          >
                                            <div className="flex items-center justify-between text-slate-200">
                                              <span className="font-semibold">
                                                #{sIdx + 1} [{step.question?.type}]:{" "}
                                                {step.question?.prompt?.vi ||
                                                  step.question?.prompt?.en}
                                              </span>
                                              {step.question?.cefrLevel && (
                                                <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[9px] font-bold">
                                                  {step.question.cefrLevel}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                              Đáp án:{" "}
                                              <span className="text-emerald-400 font-medium">
                                                {step.question?.answer}
                                              </span>
                                            </div>
                                            {step.question?.media && (
                                              <div className="text-[10px] text-sky-400 flex items-center gap-1">
                                                <ImageIcon className="w-3 h-3" />
                                                <span>{step.question.media.title || step.question.media.url}</span>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-3 text-[11px] text-slate-500 italic">
                              Không có Quest nào khớp với bộ lọc.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-center text-slate-500 text-sm">
              Địa danh này chưa có bài học. Bạn có thể sử dụng tab &ldquo;Tạo Quest mới&rdquo; hoặc &ldquo;AI Content Studio&rdquo; để thêm nội dung.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 2. CREATE QUEST TAB
// ---------------------------------------------------------------
import { LearnerPreviewModal } from "./LearnerPreviewModal";

function CreateQuestView({
  allLocations,
  onQuestCreated,
}: {
  allLocations: any[];
  onQuestCreated: (locId: string, chapId: string, lesId: string, q: Quest) => void;
}) {
  const [selectedLocId, setSelectedLocId] = useState<string>(allLocations[0]?.id || "");
  const selectedLoc = allLocations.find((l) => l.id === selectedLocId) || allLocations[0];

  const [questTitleVi, setQuestTitleVi] = useState("");
  const [questTitleEn, setQuestTitleEn] = useState("");
  const [xpReward, setXpReward] = useState(130);

  // Question fields for 8 question types
  const [qType, setQType] = useState<QuestionType>("multiple_choice");
  const [promptVi, setPromptVi] = useState("");
  const [promptEn, setPromptEn] = useState("");
  const [opt1Vi, setOpt1Vi] = useState("");
  const [opt1En, setOpt1En] = useState("");
  const [opt2Vi, setOpt2Vi] = useState("");
  const [opt2En, setOpt2En] = useState("");
  const [opt3Vi, setOpt3Vi] = useState("");
  const [opt3En, setOpt3En] = useState("");
  const [correctOpt, setCorrectOpt] = useState("opt-1");
  const [explanationVi, setExplanationVi] = useState("");

  // Specific configs
  const [sentenceWithBlank, setSentenceWithBlank] = useState("");
  const [acceptableAnswer, setAcceptableAnswer] = useState("");
  const [wordOrderString, setWordOrderString] = useState("");

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const buildQuestionObject = (): Question => {
    return {
      id: `q-custom-${Date.now()}`,
      type: qType,
      prompt: { vi: promptVi || "Nội dung câu hỏi", en: promptEn || "Question prompt" },
      options: [
        { id: "opt-1", text: { vi: opt1Vi || "Lựa chọn A", en: opt1En || "Option A" } },
        { id: "opt-2", text: { vi: opt2Vi || "Lựa chọn B", en: opt2En || "Option B" } },
        { id: "opt-3", text: { vi: opt3Vi || "Lựa chọn C", en: opt3En || "Option C" } },
      ],
      correctAnswer: qType === "true_false" ? "true" : correctOpt,
      explanation: { vi: explanationVi || "Chính xác!", en: "Correct!" },
      difficulty: 2,
      cefrLevel: "A2",
      status: "draft",
      fillBlankConfig: {
        sentenceWithBlank: sentenceWithBlank || "Turtle Tower was built in _____.",
        acceptableAnswers: [acceptableAnswer || "1886"],
      },
      wordOrderConfig: {
        words: wordOrderString ? wordOrderString.split(" ") : ["Hanoi", "is", "the", "capital"],
        correctSequence: wordOrderString ? wordOrderString.split(" ") : ["Hanoi", "is", "the", "capital"],
      },
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitleVi || !promptVi) {
      alert("Vui lòng nhập đầy đủ tiêu đề quest và nội dung câu hỏi!");
      return;
    }

    const chapId = selectedLoc.chapters?.[0]?.id || `chap-${selectedLoc.id}-01`;
    const lesId = selectedLoc.chapters?.[0]?.lessons?.[0]?.id || `les-${selectedLoc.id}-01`;

    const newQuestion = buildQuestionObject();

    const newQuest: Quest = {
      id: `quest-custom-${Date.now()}`,
      lessonId: lesId,
      title: { vi: questTitleVi, en: questTitleEn || questTitleVi },
      description: {
        vi: `Thử thách mới tại ${selectedLoc.nameVi}.`,
        en: `New interactive challenge in ${selectedLoc.nameEn}.`,
      },
      order: 99,
      reward: {
        xp: Number(xpReward) || 120,
      },
      status: "draft",
      steps: [
        {
          id: `step-${Date.now()}`,
          questId: `quest-custom-${Date.now()}`,
          order: 1,
          question: newQuestion,
        },
      ],
    };

    onQuestCreated(selectedLoc.id, chapId, lesId, newQuest);
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      {previewQuestion && (
        <LearnerPreviewModal
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-500" />
          <span>Tạo Nhiệm vụ Khám phá mới (Content Creator)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Hỗ trợ đầy đủ 8 loại câu hỏi tương tác. Bạn có thể xem thử giao diện di động của học viên trước khi gửi duyệt.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Location Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Chọn địa danh áp dụng:
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
          >
            {allLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.iconEmoji} {l.nameVi} ({l.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Quest Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tên nhiệm vụ (Tiếng Việt):
            </label>
            <input
              type="text"
              required
              placeholder="VD: Thám hiểm Cố Đô Hoa Lư"
              value={questTitleVi}
              onChange={(e) => setQuestTitleVi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Tên nhiệm vụ (English):
            </label>
            <input
              type="text"
              placeholder="VD: Expedition of Hoa Lu Ancient Capital"
              value={questTitleEn}
              onChange={(e) => setQuestTitleEn(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Phần thưởng XP:
          </label>
          <input
            type="number"
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
          />
        </div>

        <hr className="border-slate-800" />

        {/* Question Type & Form Fields */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Chọn Loại câu hỏi (8 loại):
            </span>
            <select
              value={qType}
              onChange={(e) => setQType(e.target.value as QuestionType)}
              className="bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-base sm:text-xs text-amber-300 font-bold min-h-[44px]"
            >
              <option value="multiple_choice">1. Trắc nghiệm (Multiple Choice)</option>
              <option value="picture_match">2. Ghép hình ảnh (Picture Match)</option>
              <option value="fill_blank">3. Điền từ vào chỗ trống (Fill in Blank)</option>
              <option value="listen_select">4. Nghe và chọn đáp án (Listening Audio)</option>
              <option value="match_pair">5. Nối từ - nghĩa (Word-Meaning Match)</option>
              <option value="word_order">6. Sắp xếp từ thành câu (Sentence Order)</option>
              <option value="dialogue_select">7. Chọn câu trả lời hội thoại (Dialogue)</option>
              <option value="true_false">8. Đúng / Sai (True / False)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Nội dung câu hỏi (Prompt VI):
            </label>
            <input
              type="text"
              required
              placeholder="VD: Món ăn đặc sản nổi tiếng nào tại Ninh Bình?"
              value={promptVi}
              onChange={(e) => setPromptVi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Nội dung câu hỏi (Prompt EN):
            </label>
            <input
              type="text"
              placeholder="VD: Which famous delicacy is Ninh Binh renowned for?"
              value={promptEn}
              onChange={(e) => setPromptEn(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
            />
          </div>

          {/* Conditional Specific Form Inputs */}
          {qType === "fill_blank" && (
            <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Câu mẫu có chỗ trống (Dùng _____):</label>
                <input
                  type="text"
                  placeholder="VD: Hoan Kiem Lake features _____ Tower in the middle."
                  value={sentenceWithBlank}
                  onChange={(e) => setSentenceWithBlank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">Đáp án tiếng Anh chấp nhận:</label>
                <input
                  type="text"
                  placeholder="VD: Turtle"
                  value={acceptableAnswer}
                  onChange={(e) => setAcceptableAnswer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                />
              </div>
            </div>
          )}

          {qType === "word_order" && (
            <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-bold text-amber-400 mb-1">
                Các từ xáo trộn để ghép (phân cách bằng khoảng trắng):
              </label>
              <input
                type="text"
                placeholder="VD: Hanoi is the beautiful capital of Vietnam"
                value={wordOrderString}
                onChange={(e) => setWordOrderString(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
              />
            </div>
          )}

          {/* Options for Choices */}
          {(qType === "multiple_choice" || qType === "picture_match" || qType === "listen_select" || qType === "dialogue_select") && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-400">Các phương án lựa chọn:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-black text-amber-400">Đáp án A</span>
                  <input
                    type="text"
                    placeholder="Cơm cháy Ninh Bình"
                    value={opt1Vi}
                    onChange={(e) => setOpt1Vi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-xs text-white min-h-[44px] sm:min-h-[36px]"
                  />
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-black text-amber-400">Đáp án B</span>
                  <input
                    type="text"
                    placeholder="Bánh cáy Thái Bình"
                    value={opt2Vi}
                    onChange={(e) => setOpt2Vi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-xs text-white min-h-[44px] sm:min-h-[36px]"
                  />
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-black text-amber-400">Đáp án C</span>
                  <input
                    type="text"
                    placeholder="Bún chả cá"
                    value={opt3Vi}
                    onChange={(e) => setOpt3Vi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-xs text-white min-h-[44px] sm:min-h-[36px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-slate-300">Đáp án đúng là:</span>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-emerald-400 font-bold min-h-[44px] sm:min-h-[36px]"
                >
                  <option value="opt-1">Đáp án A</option>
                  <option value="opt-2">Đáp án B</option>
                  <option value="opt-3">Đáp án C</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Giải thích kiến thức (Explanation):
            </label>
            <input
              type="text"
              placeholder="VD: Cơm cháy giòn tan ăn kèm sốt dê là đặc sản nức tiếng Ninh Bình."
              value={explanationVi}
              onChange={(e) => setExplanationVi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:border-amber-500 min-h-[44px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPreviewQuestion(buildQuestionObject())}
            className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span>👁️ Xem thử như Người học thấy (Learner Preview)</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-1/2 py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>Lưu Quest vào Draft (Gửi hàng đợi duyệt)</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------
// 3. AI CONTENT STUDIO TAB (FR-07 & 08-AI-CONTENT.md)
// ---------------------------------------------------------------
function AiContentStudioView({
  allLocations,
  generateAiQuestion,
  onSaveAiQuest,
}: {
  allLocations: any[];
  generateAiQuestion: (topic: string, locName: string) => Question;
  onSaveAiQuest: (locId: string, chapId: string, lesId: string, q: Quest) => void;
}) {
  const [selectedLocId, setSelectedLocId] = useState<string>(allLocations[0]?.id || "");
  const [landmarkId, setLandmarkId] = useState("hoanKiem");
  const [cefrLevel, setCefrLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("A2");
  const [contentType, setContentType] = useState<"quiz" | "vocab" | "dialogue" | "short_reading">("quiz");
  const [quantity, setQuantity] = useState(3);
  const [topic, setTopic] = useState("Văn hóa & Ẩm thực truyền thống");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);

  const selectedLoc = allLocations.find((l) => l.id === selectedLocId) || allLocations[0];

  // Web Speech API TTS helper for pronunciation preview
  const speakText = (text: string, lang = "en-US") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Trình duyệt không hỗ trợ phát âm Web Speech API");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateAI = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: selectedLocId,
          locationName: selectedLoc.nameVi,
          landmarkId,
          landmarkName: landmarkId,
          cefrLevel,
          contentType,
          quantity: Number(quantity) || 3,
          topic,
        }),
      });

      const data = await res.json();
      if (data.success && data.items) {
        setGeneratedResults(data.items);
      } else {
        alert(data.error || "Không thể sinh dữ liệu từ AI");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối API sinh dữ liệu AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitAll = () => {
    if (generatedResults.length === 0) return;

    const chapId = selectedLoc.chapters?.[0]?.id || `chap-${selectedLoc.id}-01`;
    const lesId = selectedLoc.chapters?.[0]?.lessons?.[0]?.id || `les-${selectedLoc.id}-01`;

    if (contentType === "quiz") {
      const steps = generatedResults.map((q, idx) => ({
        id: `step-ai-${Date.now()}-${idx}`,
        questId: `quest-ai-${Date.now()}`,
        order: idx + 1,
        question: {
          id: q.id,
          type: q.type,
          prompt: { vi: q.promptVi, en: q.promptEn },
          options: q.options?.map((o: any) => ({ id: o.id, text: { vi: o.textVi, en: o.textEn } })),
          correctAnswer: q.correctAnswer,
          explanation: { vi: q.explanationVi, en: q.explanationEn },
          difficulty: 2,
          cefrLevel: q.cefrLevel,
          status: "draft" as const,
          generatedByAI: true,
          generationModel: q.generationModel,
          factCheckNeeded: q.factCheckNeeded,
        },
      }));

      const newQuest: Quest = {
        id: `quest-ai-${Date.now()}`,
        lessonId: lesId,
        title: { vi: `[AI] ${topic} (${cefrLevel})`, en: `[AI] ${topic} (${cefrLevel})` },
        description: { vi: `Bộ câu hỏi do AI Studio sinh về ${topic}.`, en: `AI-generated quiz about ${topic}.` },
        order: 100,
        reward: { xp: 150 },
        status: "draft",
        steps,
      };

      onSaveAiQuest(selectedLoc.id, chapId, lesId, newQuest);
      setGeneratedResults([]);
    } else {
      alert(`Đã lưu ${generatedResults.length} mục ${contentType} vào DRAFT thành công!`);
      setGeneratedResults([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <span className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Bot className="w-6 h-6" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">
              AI Content Studio
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase">
              LLM + Zod Schema Validated
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Tự động sinh Quiz trắc nghiệm, Từ vựng, và Hội thoại nhập vai theo ngữ cảnh Landmark thật và trình độ CEFR.
          </p>
        </div>
      </div>

      {/* Quick Action Preset Buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-xs font-bold text-slate-400">Gợi ý nhanh:</span>
        <button
          type="button"
          onClick={() => {
            setContentType("vocab");
            setQuantity(5);
            setTopic("Từ vựng điểm tham quan");
          }}
          className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[38px]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gợi ý 5 từ vựng cho Landmark</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setContentType("dialogue");
            setQuantity(1);
            setTopic("Hỏi đường & Giao tiếp du lịch");
          }}
          className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[38px]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tạo hội thoại nhập vai (Du khách - Bản địa)</span>
        </button>
      </div>

      {/* Config Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Địa danh:
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
          >
            {allLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.iconEmoji} {l.nameVi} ({l.nameEn})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Điểm tham quan (Landmark):
          </label>
          <select
            value={landmarkId}
            onChange={(e) => setLandmarkId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
          >
            <option value="hoanKiem">Hồ Hoàn Kiếm & Tháp Rùa</option>
            <option value="phoCo">36 Phố Phường (Phố Cổ)</option>
            <option value="vanMieu">Văn Miếu - Quốc Tử Giám</option>
            <option value="amThuc">Ẩm Thực: Phở & Cà Phê Trứng</option>
            <option value="longBien">Cầu Long Biên Lịch Sử</option>
            <option value="motCot">Chùa Một Cột & Lăng Bác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Trình độ tiếng Anh (CEFR):
          </label>
          <select
            value={cefrLevel}
            onChange={(e) => setCefrLevel(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-amber-400 font-bold min-h-[44px]"
          >
            <option value="A1">CEFR A1 (Sơ cấp cơ bản)</option>
            <option value="A2">CEFR A2 (Sơ cấp nâng cao)</option>
            <option value="B1">CEFR B1 (Trung cấp)</option>
            <option value="B2">CEFR B2 (Trung cao cấp)</option>
            <option value="C1">CEFR C1 (Cao cấp)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Loại nội dung sinh:
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
          >
            <option value="quiz">Quiz Câu hỏi trắc nghiệm</option>
            <option value="vocab">Bộ Từ vựng theo địa điểm</option>
            <option value="dialogue">Hội thoại nhập vai (Roleplay)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Số lượng tạo:
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1">
            Chủ đề chi tiết:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="VD: Lịch sử, Ẩm thực, Kiến trúc..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        onClick={handleGenerateAI}
        className="w-full py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
        <span>{isLoading ? "Đang kết nối Server LLM sinh dữ liệu..." : "BẮT ĐẦU SINH NỘI DUNG (AI GENERATE)"}</span>
      </button>

      {/* AI Output Cards List */}
      {generatedResults.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Kết quả sinh tự động ({generatedResults.length} mục)</span>
            </h3>
            <button
              type="button"
              onClick={handleCommitAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu tất cả vào DRAFT</span>
            </button>
          </div>

          <div className="space-y-3">
            {generatedResults.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn"
              >
                {/* Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-lg border border-indigo-500/30">
                      ⚡ AI Generated ({item.generationModel || "LLM"})
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black rounded-md border border-amber-500/30">
                      CEFR {item.cefrLevel || cefrLevel}
                    </span>
                    {item.factCheckNeeded && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-black rounded-md border border-rose-500/30 animate-pulse">
                        ⚠️ Cần kiểm tra thực tế
                      </span>
                    )}
                  </div>

                  {item.word && (
                    <button
                      type="button"
                      onClick={() => speakText(item.word)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Phát âm</span>
                    </button>
                  )}
                </div>

                {/* Content Render according to Type */}
                {contentType === "quiz" && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-sm text-white">
                      #{idx + 1}. {item.promptVi}
                    </h4>
                    <div className="text-xs text-indigo-300 italic">{item.promptEn}</div>

                    <div className="space-y-1.5 pt-1">
                      {item.options?.map((opt: any) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            opt.id === item.correctAnswer
                              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          <span>{opt.textVi} ({opt.textEn})</span>
                          {opt.id === item.correctAnswer && (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Đáp án đúng</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-slate-400 italic pt-1">
                      Giải thích: {item.explanationVi}
                    </div>
                  </div>
                )}

                {contentType === "vocab" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-amber-400">{item.word}</span>
                      <span className="text-xs text-slate-400 font-mono">{item.ipa}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-md uppercase">
                        {item.partOfSpeech}
                      </span>
                    </div>
                    <div className="text-xs text-white font-bold">Nghĩa: {item.meaningVi}</div>
                    <div className="text-xs text-slate-300 italic">Example: &ldquo;{item.exampleEn}&rdquo;</div>
                    <div className="text-xs text-slate-400">Dịch: &ldquo;{item.exampleVi}&rdquo;</div>
                  </div>
                )}

                {contentType === "dialogue" && (
                  <div className="space-y-3">
                    <div className="font-bold text-sm text-amber-400">{item.titleVi}</div>
                    <div className="text-xs text-slate-400">{item.contextVi}</div>
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-500/40">
                      {item.lines?.map((line: any) => (
                        <div key={line.id} className="text-xs space-y-0.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-300 text-[11px]">{line.speaker}:</span>
                            <button
                              type="button"
                              onClick={() => speakText(line.textEn)}
                              className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1"
                            >
                              <Volume2 className="w-3 h-3" /> Nghe
                            </button>
                          </div>
                          <div className="text-white font-medium">&ldquo;{line.textEn}&rdquo;</div>
                          <div className="text-slate-400 text-[11px] italic">&ldquo;{line.textVi}&rdquo;</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// 4. REVIEW QUEUE TAB (Reviewer & Fact Checker with Diff Viewer)
// ---------------------------------------------------------------
function ReviewQueueView({
  queue,
  t,
  currentRole,
  onApprove,
  onRequestChange,
}: {
  queue: any[];
  t: any;
  currentRole: UserRole;
  onApprove: (locId: string, chapId: string, lesId: string, qId: string) => void;
  onRequestChange: (locId: string, chapId: string, lesId: string, qId: string, comment?: string) => void;
}) {
  const [selectedDiffItem, setSelectedDiffItem] = useState<any | null>(null);
  const [changeReqQuestId, setChangeReqQuestId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const canReview = currentRole === "reviewer" || currentRole === "admin";

  const handleBatchApprove = () => {
    if (!canReview) return;
    if (
      window.confirm(
        `Bạn có chắc chắn muốn phê duyệt tất cả ${queue.length} nhiệm vụ trong hàng đợi?`
      )
    ) {
      queue.forEach((item) => {
        onApprove(
          item.location.id,
          item.chapter.id,
          item.lesson.id,
          item.quest.id
        );
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-500" />
            <span>Hàng đợi Thẩm định Nội dung (Review Queue)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Reviewer & Fact Checker kiểm tra tính chính xác lịch sử, tính an toàn ngôn ngữ và đáp án trước khi duyệt.
          </p>
        </div>

        {queue.length > 0 && canReview && (
          <button
            type="button"
            onClick={handleBatchApprove}
            className="px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Phê duyệt tất cả ({queue.length})</span>
          </button>
        )}
      </div>

      {/* Role Notice */}
      {!canReview && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            Bạn đang đăng nhập với vai trò <strong>Creator</strong> (chỉ có quyền tạo nội dung). Hãy chuyển sang vai trò <strong>Reviewer</strong> hoặc <strong>Admin</strong> ở thanh điều hướng trên cùng để phê duyệt hoặc yêu cầu chỉnh sửa.
          </span>
        </div>
      )}

      {queue.length > 0 ? (
        <div className="space-y-4">
          {queue.map((item) => {
            const isRequestingChange = changeReqQuestId === item.quest.id;

            return (
              <div
                key={item.quest.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.location.iconEmoji}</span>
                      <h3 className="font-extrabold text-base text-white">
                        {t(item.quest.title)}
                      </h3>
                      <StatusBadge status={item.quest.status} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Địa danh: <span className="text-slate-300 font-semibold">{item.location.nameVi}</span> • Bài học: <span className="text-slate-300 font-semibold">{t(item.lesson.title)}</span> • XP: <span className="text-amber-400 font-bold">+{item.quest.reward.xp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Diff Viewer Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDiffItem(item)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileDiff className="w-3.5 h-3.5 text-amber-400" />
                      <span>So sánh (Diff)</span>
                    </button>

                    {/* Approve Button */}
                    <button
                      type="button"
                      disabled={!canReview}
                      onClick={() =>
                        onApprove(
                          item.location.id,
                          item.chapter.id,
                          item.lesson.id,
                          item.quest.id
                        )
                      }
                      title={!canReview ? "Chỉ Reviewer/Admin mới có quyền duyệt" : "Phê duyệt nội dung"}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt</span>
                    </button>

                    {/* Request Change Button */}
                    <button
                      type="button"
                      disabled={!canReview}
                      onClick={() => {
                        if (isRequestingChange) {
                          setChangeReqQuestId(null);
                        } else {
                          setChangeReqQuestId(item.quest.id);
                          setCommentText("");
                        }
                      }}
                      title={!canReview ? "Chỉ Reviewer/Admin mới có quyền yêu cầu sửa" : "Yêu cầu chỉnh sửa"}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-rose-950/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-rose-400 border border-slate-800 hover:border-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isRequestingChange ? "Đóng" : "Yêu cầu sửa"}
                    </button>
                  </div>
                </div>

                {/* Inline Change Request Comment Form */}
                {isRequestingChange && (
                  <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5 space-y-2 animate-fadeIn">
                    <label className="text-[11px] font-bold text-rose-300 block">
                      Ghi chú lý do yêu cầu chỉnh sửa (sẽ gửi lại cho Content Creator):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="VD: Kiểm tra lại mốc năm xây dựng, câu hỏi 2 cần bổ sung hình ảnh..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onRequestChange(
                            item.location.id,
                            item.chapter.id,
                            item.lesson.id,
                            item.quest.id,
                            commentText
                          );
                          setChangeReqQuestId(null);
                          setCommentText("");
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        Gửi DRAFT
                      </button>
                    </div>
                  </div>
                )}

                {/* Steps inside Quest */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400">
                    Câu hỏi trong nhiệm vụ ({item.quest.steps.length}):
                  </div>
                  {item.quest.steps.map((step: any, idx: number) => (
                    <div
                      key={step.id || idx}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-200">
                          #{idx + 1} [{step.question.type}]: {step.question.prompt.vi}
                        </div>
                        {step.question.cefrLevel && (
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-md">
                            {step.question.cefrLevel}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Đáp án đúng: <span className="text-emerald-400 font-bold">{step.question.answer}</span>
                      </div>
                      {step.question.generatedByAI && (
                        <div className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          <span>Tạo bởi AI ({step.question.generationModel})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 bg-slate-950 rounded-3xl border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-white text-base">
            Hàng đợi sạch sẽ!
          </h3>
          <p className="text-xs text-slate-400">
            Hiện không có nhiệm vụ nào ở trạng thái chờ duyệt. Mọi nội dung đã được xử lý.
          </p>
        </div>
      )}

      {/* Diff Modal */}
      {selectedDiffItem && (
        <ReviewDiffModal
          item={selectedDiffItem}
          currentRole={currentRole}
          onApprove={(locId, chapId, lesId, qId) => {
            onApprove(locId, chapId, lesId, qId);
            setSelectedDiffItem(null);
          }}
          onRequestChange={(locId, chapId, lesId, qId, comment) => {
            onRequestChange(locId, chapId, lesId, qId, comment);
            setSelectedDiffItem(null);
          }}
          onClose={() => setSelectedDiffItem(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// 4.5. HEALTH ANALYTICS & CONTENT IMPORT / EXPORT VIEW
// ---------------------------------------------------------------
function AnalyticsIOView({
  allLocations,
  setAllLocations,
  showNotify,
}: {
  allLocations: any[];
  setAllLocations: (locs: any[]) => void;
  showNotify: (text: string, type?: "success" | "info" | "warning") => void;
}) {
  const stats = computeHealthStats(allLocations);
  const [importJsonText, setImportJsonText] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showImportSection, setShowImportSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const res = parseLocationsJSON(content);
      setValidationErrors(res.errors);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    const res = parseLocationsJSON(importJsonText);
    if (res.errors.length > 0 || !res.data) {
      setValidationErrors(res.errors);
      showNotify("Dữ liệu JSON không hợp lệ, vui lòng kiểm tra lỗi bên dưới.", "warning");
      return;
    }

    if (importMode === "overwrite") {
      if (
        window.confirm(
          `CẢNH BÁO: Chế độ ghi đè sẽ thay thế toàn bộ dữ liệu hiện tại bằng ${res.data.length} địa danh từ tệp JSON. Bạn có muốn tiếp tục?`
        )
      ) {
        setAllLocations(res.data);
        showNotify(`Đã ghi đè thành công gói nội dung (${res.data.length} địa danh)!`);
        setImportJsonText("");
        setShowImportSection(false);
      }
    } else {
      // Merge mode
      const updated = [...allLocations];
      res.data.forEach((incomingLoc) => {
        const idx = updated.findIndex((l) => l.id === incomingLoc.id);
        if (idx >= 0) {
          updated[idx] = incomingLoc;
        } else {
          updated.push(incomingLoc);
        }
      });
      setAllLocations(updated);
      showNotify(`Đã hợp nhất thành công ${res.data.length} địa danh vào nội dung hiện tại!`);
      setImportJsonText("");
      setShowImportSection(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Chỉ số Sức khoẻ Nội dung & Quản trị Tệp (Health & I/O)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng quan độ phủ nội dung 10 địa danh 3D, phân bổ CEFR, cảnh báo chất lượng và xuất/nhập tệp dữ liệu.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportLocationsJSON(allLocations)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Xuất JSON</span>
          </button>
          <button
            type="button"
            onClick={() => exportQuestsCSV(allLocations)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportSection(!showImportSection)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập tệp (Import)</span>
          </button>
        </div>
      </div>

      {/* Import Section (Expandable) */}
      {showImportSection && (
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Nhập gói dữ liệu JSON (Import Content Package)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowImportSection(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Chọn tệp JSON từ máy tính:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Chế độ nhập dữ liệu:
              </label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                    className="accent-amber-500"
                  />
                  <span>Hợp nhất theo ID (Merge)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-rose-300">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === "overwrite"}
                    onChange={() => setImportMode("overwrite")}
                    className="accent-rose-500"
                  />
                  <span>Ghi đè tất cả (Overwrite)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Hoặc dán nội dung JSON vào đây:
            </label>
            <textarea
              rows={4}
              placeholder='[ { "id": "hanoi", "nameVi": "Hà Nội", ... } ]'
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                if (e.target.value.trim()) {
                  const res = parseLocationsJSON(e.target.value);
                  setValidationErrors(res.errors);
                } else {
                  setValidationErrors([]);
                }
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Validation errors list */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl space-y-1">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Phát hiện {validationErrors.length} lỗi trong định dạng JSON:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-400 space-y-0.5">
                {validationErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={!importJsonText.trim() || validationErrors.length > 0}
              onClick={handleExecuteImport}
              className="px-5 py-2.5 bg-linear-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer"
            >
              Xác nhận Nhập dữ liệu
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Địa danh 3D</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.totalLocations}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Toàn bộ bản đồ Việt Nam</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Quests</div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalQuests}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Nhiệm vụ học tập</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Câu hỏi</div>
          <div className="text-2xl font-black text-sky-400 mt-1">{stats.totalQuestions}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Đa dạng các loại câu hỏi</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
          <div className="text-[11px] text-slate-400 font-bold uppercase">Đã xuất bản (Live)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.statusCounts.published}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Đang hiển thị trong game</div>
        </div>
      </div>

      {/* Status Breakdown & Quality Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Phân bổ trạng thái Quests
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "DRAFT (Bản nháp)", count: stats.statusCounts.draft, color: "bg-slate-500", text: "text-slate-300" },
              { label: "IN REVIEW (Chờ thẩm định)", count: stats.statusCounts.in_review, color: "bg-amber-500", text: "text-amber-400" },
              { label: "APPROVED (Đã duyệt)", count: stats.statusCounts.approved, color: "bg-sky-500", text: "text-sky-400" },
              { label: "PUBLISHED (Đã xuất bản)", count: stats.statusCounts.published, color: "bg-emerald-500", text: "text-emerald-400" },
            ].map((s) => {
              const pct = stats.totalQuests > 0 ? Math.round((s.count / stats.totalQuests) * 100) : 0;
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-bold ${s.text}`}>{s.label}</span>
                    <span className="text-slate-400">{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEFR Level Breakdown & Quality Audit */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Trình độ CEFR & Cảnh báo an toàn
          </h3>

          <div className="grid grid-cols-5 gap-2 text-center">
            {(["A1", "A2", "B1", "B2", "C1"] as const).map((lvl) => (
              <div key={lvl} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[11px] font-black text-indigo-400">{lvl}</div>
                <div className="text-lg font-black text-white mt-0.5">{stats.cefrCounts[lvl]}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-900 space-y-2">
            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Cần Fact-check kiểm chứng:
              </span>
              <span className="font-black text-amber-400">
                {stats.factCheckFlagsCount} câu hỏi
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                Câu hỏi chưa gán Media / Audio:
              </span>
              <span className="font-black text-sky-400">
                {stats.missingMediaCount} câu hỏi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Coverage Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Mức độ hoàn thiện theo từng địa danh (10 Địa danh 3D)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {allLocations.map((loc) => {
            let questCount = 0;
            let questionCount = 0;
            let approvedOrPubCount = 0;

            (loc.chapters || []).forEach((c: any) => {
              (c.lessons || []).forEach((les: any) => {
                (les.quests || []).forEach((q: any) => {
                  questCount += 1;
                  questionCount += (q.steps || []).length;
                  if (q.status === "approved" || q.status === "published") {
                    approvedOrPubCount += 1;
                  }
                });
              });
            });

            return (
              <div
                key={loc.id}
                className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{loc.iconEmoji}</span>
                  <div>
                    <div className="font-extrabold text-xs text-white">{loc.nameVi}</div>
                    <div className="text-[10px] text-slate-500">{loc.nameEn}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span>Quests:</span>
                    <span className="font-bold text-white">{questCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Câu hỏi:</span>
                    <span className="font-bold text-sky-400">{questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sẵn sàng:</span>
                    <span className="font-bold text-emerald-400">{approvedOrPubCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 5. PUBLISHING & VERSIONS TAB (FR-03, FR-05 & 04-PUBLISHING-VERSIONING.md)
// ---------------------------------------------------------------
function PublishingVersionsView({
  versions,
  approvedCount,
  onPublishLive,
  onRollback,
}: {
  versions: any[];
  approvedCount: number;
  onPublishLive: (name: string, notes: string) => void;
  onRollback: (verId: string) => void;
}) {
  const [releaseName, setReleaseName] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    onPublishLive(releaseName, releaseNotes);
    setReleaseName("");
    setReleaseNotes("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1-Click Publish Banner */}
      <div className="bg-linear-to-r from-amber-950 via-slate-950 to-emerald-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black uppercase rounded-full mb-1">
              <Send className="w-3.5 h-3.5" />
              <span>Trung tâm Xuất bản (Publishing Center)</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Xuất bản trực tiếp đến Người chơi (No Deployment Required)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Các bài học đã được phê duyệt sẽ lập tức xuất hiện trong game mà không cần deploy lại mã nguồn frontend.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-black text-emerald-400">
              {approvedCount}
            </span>
            <div className="text-[11px] text-slate-400 font-bold uppercase">
              Mục sẵn sàng xuất bản
            </div>
          </div>
        </div>

        <form onSubmit={handlePublish} className="pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Tên phiên bản (VD: v1.1.0 — Ninh Binh & Hue Content Pack)"
              value={releaseName}
              onChange={(e) => setReleaseName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Ghi chú thay đổi (Release notes)"
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-linear-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>XUẤT BẢN NGAY (PUBLISH TO GAME)</span>
          </button>
        </form>
      </div>

      {/* Version History & Rollback */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          <span>Lịch sử các phiên bản nội dung (Content Version History)</span>
        </h3>

        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.id}
              className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">
                    {ver.name}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">
                    Snapshot
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {ver.notes || "Khởi tạo ban đầu"}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Xuất bản lúc: {new Date(ver.publishedAt).toLocaleString("vi-VN")} bởi {ver.publishedBy}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRollback(ver.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Khôi phục bản này
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Small Helper Badge
function StatusBadge({ status }: { status: ContentStatus }) {
  const styles: Record<ContentStatus, { label: string; class: string }> = {
    draft: { label: "DRAFT", class: "bg-slate-800 text-slate-400 border-slate-700" },
    in_review: { label: "IN REVIEW", class: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    approved: { label: "APPROVED", class: "bg-sky-500/20 text-sky-400 border-sky-500/40" },
    published: { label: "PUBLISHED", class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
    archived: { label: "ARCHIVED", class: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
  };

  const current = styles[status] || styles.draft;

  return (
    <span
      className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase ${current.class}`}
    >
      {current.label}
    </span>
  );
}

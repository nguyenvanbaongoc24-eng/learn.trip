import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { 
  X, Map as MapIcon, BookOpen, Music, Camera, MapPin, 
  ChevronLeft, ChevronRight, Maximize2, Volume2, MessageSquare, 
  Sparkles, CheckCircle2, AlertCircle, Headphones, Trophy, VolumeX
} from "lucide-react";
import { createWorld, GlobeLabelScreenPosition, World, WorldPerf } from "@/world";
import { getDestination } from "@/world/config/registry";
import { StageDef } from "@/world/config/destinations";
import { ambientSound } from "@/utils/ambientAudio";
import { sounds } from "@/utils/soundEffects";
import { useGame } from "@/context/GameContext";

interface Explore3DModalProps {
  isOpen: boolean;
  initialLocationId?: string;
  onClose: () => void;
  checkedInPoiIds: string[];
  onCheckIn: (destinationId: string, poiId: string) => void;
}

export function Explore3DModal({ isOpen, initialLocationId, onClose, checkedInPoiIds, onCheckIn }: Explore3DModalProps) {
  const { locations, addXp, addSrsVocab } = useGame();
  const location = locations.find((l) => l.id === initialLocationId);
  const locationIdToLoad = initialLocationId || (locations[0] && locations[0].id) || "loc-hanoi";
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [viewMode, setViewMode] = useState<"walk" | "overview">("overview");
  const [poiId, setPoiId] = useState<string | null>(null);
  const [photoPoiId, setPhotoPoiId] = useState<string | null>(null);
  const [canInteract, setCanInteract] = useState(false);
  const [worldError, setWorldError] = useState<string | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [walkHintVisible, setWalkHintVisible] = useState(true);
  const [stageTitleVisible, setStageTitleVisible] = useState(false);
  const [perfStats, setPerfStats] = useState<WorldPerf | null>(null);
  const [showPerf, setShowPerf] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Dialogue & Quest Modal State
  const [galleryTab, setGalleryTab] = useState<"photo" | "dialogue">("dialogue");
  const [selectedDialogueOptId, setSelectedDialogueOptId] = useState<string | null>(null);
  const [dialogueSubmitted, setDialogueSubmitted] = useState(false);
  const [dialogueCorrect, setDialogueCorrect] = useState<boolean | null>(null);
  const [showViPrompt, setShowViPrompt] = useState(false);

  // Mobile Virtual Joystick State
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);

  const globeLabelRefs = useRef(new Map<string, HTMLButtonElement>());
  const checkedInStageIds = useMemo(() => checkedInPoiIds
    .filter((id) => id.startsWith(`${locationIdToLoad}:`))
    .map((id) => id.slice(locationIdToLoad.length + 1)), [checkedInPoiIds, locationIdToLoad]);
  const checkedInStageIdsRef = useRef(checkedInStageIds);

  const speakEnglish = useCallback((text: string, rate: number = 0.9) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    checkedInStageIdsRef.current = checkedInStageIds;
    worldRef.current?.setCheckedIn(checkedInStageIds);
  }, [checkedInStageIds]);

  // Keep the server and first client render identical. Reading window while
  // rendering made the optional local perf HUD a hydration mismatch source.
  useEffect(() => {
    setShowPerf(new URLSearchParams(window.location.search).has("perf"));
  }, []);

  // Lấy dữ liệu Destination hiện tại
  let destData = null;
  let currentStage: StageDef | null = null;
  try {
    destData = getDestination(locationIdToLoad);
    if (poiId) {
      currentStage = destData.stages.find(s => s.id === poiId) || null;
    }
  } catch(e) {}

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let mounted = true;
    setLoadingProgress(0);
    setIsReady(false);
    setPoiId(null);
    setPhotoPoiId(null);
    setCanInteract(false);
    setWorldError(null);
    setViewMode("overview");
    setPerfStats(null);

    createWorld({
      container: containerRef.current,
      destinationId: locationIdToLoad,
      checkedIn: checkedInStageIdsRef.current,
      events: {
        onProgress: (p) => {
          if (mounted) setLoadingProgress(Math.floor(p * 100));
        },
        onReady: () => {
          if (mounted) setIsReady(true);
        },
        onPoiNear: (id: string | null, interact: boolean) => {
          if (mounted) {
            setPoiId(id);
            setCanInteract(interact);
          }
        },
        onOpenPhoto: (id: string) => {
          if (mounted) {
            setPhotoPoiId(id);
            worldRef.current?.setPaused(true);
          }
        },
        onModeChange: (mode) => {
          if (mounted) setViewMode(mode);
        },
        // Stats are cheap to collect at the existing reporting interval; keep
        // the world lifecycle independent of whether the optional HUD is shown.
        onPerf: setPerfStats,
        onGlobeLabels: (labels: GlobeLabelScreenPosition[]) => {
          const visible = new Set(labels.filter(label => label.visible).map(label => label.id));
          globeLabelRefs.current.forEach((element, id) => {
            if (!visible.has(id)) {
              element.style.opacity = "0";
              element.style.pointerEvents = "none";
            }
          });
          labels.forEach((label) => {
            const element = globeLabelRefs.current.get(label.id);
            if (!element) return;
            element.style.opacity = label.visible ? "1" : "0";
            element.style.pointerEvents = label.visible ? "auto" : "none";
            const scale = element.matches(":hover") ? 1.06 : 1;
            element.style.transform = `translate3d(${label.x}px, ${label.y}px, 0) translate(-50%, -100%) scale(${scale})`;
          });
        },
      }
    }).then(world => {
      if (!mounted) {
        world.dispose();
        return;
      }
      worldRef.current = world;
    }).catch((error: unknown) => {
      if (mounted) {
        setWorldError(error instanceof Error ? error.message : "Không thể tải thế giới 3D.");
      }
    });

    return () => {
      mounted = false;
      ambientSound.stop();
      if (worldRef.current) {
        worldRef.current.dispose();
        worldRef.current = null;
      }
    };
  }, [isOpen, locationIdToLoad]);

  // Ambient sound toggle
  const toggleAmbient = () => {
    if (!isAmbientPlaying) {
      ambientSound.start(locationIdToLoad);
      setIsAmbientPlaying(true);
    } else {
      ambientSound.stop();
      setIsAmbientPlaying(false);
    }
    sounds.click();
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "walk" ? "overview" : "walk";
    setViewMode(newMode);
    worldRef.current?.setMode(newMode);
    // Reset walk hint timer when entering walk mode (mục 3.2: tự mờ sau 8s)
    if (newMode === 'walk') {
      setWalkHintVisible(true);
      if (isAmbientPlaying) {
        ambientSound.start(locationIdToLoad);
      }
    }
  };

  // Walk hint auto-fade after 8 seconds (mục 3.2)
  useEffect(() => {
    if (viewMode !== 'walk' || !walkHintVisible) return;
    const timer = setTimeout(() => setWalkHintVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [viewMode, walkHintVisible]);

  // Stage title auto-fade after 4.5 seconds (mục 4#8)
  useEffect(() => {
    if (viewMode === 'walk' && currentStage) {
      setStageTitleVisible(true);
      const timer = setTimeout(() => setStageTitleVisible(false), 4500);
      return () => clearTimeout(timer);
    } else {
      setStageTitleVisible(false);
    }
  }, [viewMode, currentStage?.id]);

  const closePoiPanel = () => {
    setPhotoPoiId(null);
    worldRef.current?.setPaused(false);
  };

  const confirmCheckIn = () => {
    if (!photoPoiId) return;
    onCheckIn(locationIdToLoad, photoPoiId);
    sounds.questComplete();
    closePoiPanel();
  };

  const photoStage = photoPoiId
    ? destData?.stages.find((stage) => stage.id === photoPoiId) || null
    : null;
  const isPhotoStageCheckedIn = photoPoiId ? checkedInStageIds.includes(photoPoiId) : false;

  // Reset dialogue state on stage open
  useEffect(() => {
    if (photoPoiId) {
      setSelectedDialogueOptId(null);
      setDialogueSubmitted(false);
      setDialogueCorrect(null);
      setShowViPrompt(false);
      setGalleryTab(photoStage?.dialogueQuest ? "dialogue" : "photo");
    }
  }, [photoPoiId, photoStage?.dialogueQuest]);

  const handleDialogueSubmit = () => {
    if (!photoStage?.dialogueQuest || !selectedDialogueOptId) return;
    const quest = photoStage.dialogueQuest;
    const selectedOpt = quest.options.find((o) => o.id === selectedDialogueOptId);
    if (!selectedOpt) return;

    setDialogueSubmitted(true);
    if (selectedOpt.isCorrect) {
      setDialogueCorrect(true);
      sounds.questComplete();
      addXp(quest.rewardXp || 25);
      // Auto register target vocab into SRS
      if (quest.targetVocab) {
        quest.targetVocab.forEach((v) => {
          addSrsVocab({
            word: v.word,
            phonetics: v.phonetics,
            meaningVi: v.meaningVi,
            destinationId: locationIdToLoad,
          });
        });
      }
      // Check in
      if (photoPoiId && !isPhotoStageCheckedIn) {
        onCheckIn(locationIdToLoad, photoPoiId);
      }
    } else {
      setDialogueCorrect(false);
      sounds.wrong();
    }
  };

  // Joystick touch handlers
  const handleJoystickMove = (touch: React.Touch) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const maxR = rect.width / 2;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setJoystickPos({ x: dx, y: dy });
    const normX = dx / maxR;
    const normY = -dy / maxR; // inverted screen Y so up is forward
    worldRef.current?.setVirtualJoystick?.(normX, normY, true, Math.hypot(normX, normY) > 0.85);
  };

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsJoystickDragging(true);
    handleJoystickMove(e.touches[0]);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    if (!isJoystickDragging) return;
    e.stopPropagation();
    handleJoystickMove(e.touches[0]);
  };

  const handleJoystickTouchEnd = () => {
    setIsJoystickDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    worldRef.current?.setVirtualJoystick?.(0, 0, false, false);
  };

  if (!isOpen) return null;

  return (
    <div key={locationIdToLoad} className="fixed inset-0 z-50 flex flex-col font-nunito bg-slate-900">
      {/* Grain + Vignette Overlay (matching daokyuc.vercel.app watercolor paper style) */}
      <div className="fixed inset-0 pointer-events-none z-[999]" style={{
        background: `radial-gradient(ellipse at center, transparent 55%, rgba(20, 50, 52, 0.22) 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.36,
      }} />

      {/* 3D World Container with CSS Gradient */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${destData?.sky.top || '#63c2bd'} 0%, ${destData?.sky.fog || '#8fd3c8'} 55%, ${destData?.sky.bottom || '#a9e0d6'} 100%)` }}
      />
      
      {/* Loading Screen */}
      {!isReady && !worldError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="w-64 h-3 bg-slate-700 rounded-full overflow-hidden mb-4 border border-slate-600">
            <div 
              className="h-full bg-teal-400 rounded-full transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-white font-bold animate-pulse text-lg tracking-wide">
            Đang dựng hành tinh... {loadingProgress}%
          </p>
        </div>
      )}

      {worldError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 p-6 text-center">
          <div className="max-w-md space-y-4 rounded-2xl border border-rose-400/40 bg-slate-900 p-6 text-white shadow-2xl">
            <p className="text-lg font-black">Thế giới này chưa sẵn sàng</p>
            <p className="text-sm text-slate-300">{worldError}</p>
            <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
              Quay lại bản đồ
            </button>
          </div>
        </div>
      )}

      {/* UI Overlay */}
      {isReady && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start pointer-events-auto p-4">
            {/* Top Left: Trip Chip (only in walk mode) */}
            {viewMode === "walk" ? (
              <button 
                onClick={() => setJournalOpen(true)}
                className="bg-[#f8f3ea] text-[#1d3538] px-4 py-2.5 rounded-2xl border-[3px] border-[#1d3538] shadow-[4px_4px_0_#1d3538] font-black flex items-center gap-3 hover:translate-y-[1px] hover:shadow-[3px_3px_0_#1d3538] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#1d3538]"
              >
                <span className="text-lg">{destData ? destData.name.vi : location?.nameVi}</span>
                <span className="bg-[#1d3538] text-[#f8f3ea] px-2.5 py-0.5 rounded-full text-sm tabular-nums">
                  {checkedInStageIds.length}/{destData?.stages.length || 0}
                </span>
              </button>
            ) : (
              <div /> 
            )}

            {/* Top Right: Buttons Column */}
            <div className="flex flex-col gap-2.5">
              <button onClick={onClose} className="btn-ico-hud bg-[#d8452f] text-white" title="Đóng">
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
              
              {viewMode === "walk" && (
                <>
                  <button onClick={toggleViewMode} className="btn-ico-hud" title="Toàn cảnh hành tinh (M)">
                    <MapIcon className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                  
                  <button onClick={() => setJournalOpen(true)} className="btn-ico-hud" title="Nhật ký hành trình (J)">
                    <BookOpen className="w-5 h-5" strokeWidth={2.5} />
                  </button>

                  <button 
                    onClick={toggleAmbient} 
                    className={`btn-ico-hud ${isAmbientPlaying ? 'bg-amber-400 text-[#1d3538] ring-2 ring-amber-300 shadow-md' : ''}`} 
                    title={isAmbientPlaying ? "Tắt âm thanh môi trường" : "Bật âm thanh môi trường"}
                  >
                    {isAmbientPlaying ? <Volume2 className="w-5 h-5 text-[#1d3538]" strokeWidth={2.5} /> : <Music className="w-5 h-5" strokeWidth={2.5} />}
                  </button>

                  <button className="btn-ico-hud" title="Toàn màn hình">
                    <Maximize2 className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>
          </div>

          {showPerf && perfStats && (
            <output className="absolute left-4 top-4 rounded-md border border-white/30 bg-slate-950/80 px-3 py-2 font-mono text-[11px] leading-5 text-emerald-200 shadow-lg">
              <div>build {perfStats.buildMs}ms · world #{perfStats.builds}</div>
              <div>{perfStats.fps} FPS · p95 {perfStats.p95FrameMs}ms · DPR {perfStats.dpr}</div>
              <div>{perfStats.calls} calls · {perfStats.triangles.toLocaleString()} tris · {perfStats.programs} programs</div>
            </output>
          )}

          {destData?.stages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              ref={(element) => {
                if (element) globeLabelRefs.current.set(stage.id, element);
                else globeLabelRefs.current.delete(stage.id);
              }}
              aria-label={`Đi tới ${stage.name.vi}`}
              onClick={() => worldRef.current?.goTo(stage.id)}
              className="pointer-events-auto absolute left-0 top-0 z-10 rounded-full border-2 border-[#1d3538] bg-[#f8f3ea] px-2.5 py-1 text-[10px] font-black text-[#1d3538] shadow-[2px_2px_0_#1d3538] transition-[transform,opacity] duration-150 focus:outline-none focus:ring-2 focus:ring-[#e8622c] after:absolute after:left-1/2 after:top-full after:h-7 after:w-px after:-translate-x-1/2 after:bg-[#1d3538]"
              aria-hidden={viewMode !== "overview"}
              style={{ opacity: 0, pointerEvents: viewMode === "overview" ? "auto" : "none", willChange: "transform, opacity" }}
            >
              {stage.index}. {stage.name.vi}
            </button>
          ))}

          {/* Place Title (Bottom Left — tự mờ sau 4.5s như daokyuc) */}
          <div
            className="pointer-events-none px-6 pb-2 transition-opacity duration-1000"
            style={{ opacity: stageTitleVisible ? 1 : 0 }}
          >
            {viewMode === "walk" && currentStage && (
              <div className="mb-2 max-w-[calc(100vw-3rem)] sm:max-w-[60vw]">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#f8f3ea] leading-tight break-words" style={{ 
                  textShadow: '0 4px 8px rgba(29,53,56,0.6), 0 2px 4px rgba(29,53,56,0.4)',
                  WebkitTextStroke: '1.5px #1d3538' 
                }}>
                  {currentStage.name.vi}
                </h1>
                {currentStage.subtitle.vi.toLowerCase() !== currentStage.name.vi.toLowerCase() && (
                  <p className="text-sm md:text-base font-bold text-[#f8f3ea] mt-1" style={{ 
                    textShadow: '0 2px 4px rgba(29,53,56,0.5)',
                    WebkitTextStroke: '0.5px #1d3538' 
                  }}>
                    {currentStage.subtitle.vi}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* "Xem ảnh [E]" Interactive Prompt (Mobile touch & Desktop click) */}
          {canInteract && poiId && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 pointer-events-auto z-20">
              <button
                type="button"
                onClick={() => {
                  setPhotoPoiId(poiId);
                  worldRef.current?.setPaused(true);
                }}
                className="bg-[#f8f3ea] hover:bg-white text-[#1d3538] px-5 py-3 rounded-full font-bold border-[2.5px] border-[#1d3538] shadow-[3px_3px_0_#1d3538] active:translate-y-[2px] active:shadow-[1px_1px_0_#1d3538] flex items-center gap-2.5 animate-bounce cursor-pointer transition-transform"
              >
                <Camera className="w-4 h-4 text-teal-700" strokeWidth={2.5} />
                <span>Xem ảnh & Di tích</span>
                <kbd className="hidden sm:inline-block bg-[#1d3538] text-[#f8f3ea] px-2 py-0.5 rounded-md font-black text-xs">
                  E
                </kbd>
                <span className="sm:hidden bg-[#e8622c] text-white px-2 py-0.5 rounded-full font-black text-[10px]">
                  Chạm
                </span>
              </button>
            </div>
          )}


          {/* Bottom Control Hints & Explore Button */}
          <div className="pointer-events-none flex items-end justify-between px-6 pb-6">
            {viewMode === "overview" && (
              <>
                {/* Info Card (Left side, like daokyuc — mục 3.2) */}
                <div className="pointer-events-auto w-[330px] max-w-[calc(100vw-3rem)]">
                  <div className="bg-[#f4f1ea] rounded-2xl border-[3px] border-[#1d3538] shadow-[6px_6px_0_rgba(29,53,56,0.3)] p-5 space-y-2.5" style={{ animation: 'cardSlideIn 0.6s ease-out' }}>
                    {/* Label nhỏ */}
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600">
                      Khám phá 3D
                    </div>
                    
                    {/* Phụ đề tiếng Anh */}
                    <p className="text-sm font-bold text-[#1d3538]/50 -mt-1">
                      {destData?.name.en || 'Explore'}
                    </p>

                    {/* Tên lớn tiếng Việt */}
                    <h2 className="text-4xl font-black text-[#1d3538] leading-none" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {destData?.name.vi || location?.nameVi || 'Khám phá'}
                    </h2>
                    
                    {/* Dòng địa điểm */}
                    <p className="text-xs font-bold text-[#1d3538]/60 tracking-wide">
                      {destData?.locationLine?.vi || `Việt Nam · ${destData?.stages.length || 6} điểm tham quan`}
                    </p>

                    {/* Mô tả blurb */}
                    <p className="text-sm text-[#1d3538]/70 leading-relaxed">
                      {destData?.blurb?.vi || `Hòn đảo nhỏ với ${destData?.stages.length || 6} điểm tham quan — di tích, ẩm thực, và phong cảnh thiên nhiên.`}
                    </p>

                    {/* Progress */}
                    {destData && checkedInStageIds.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-teal-700 font-bold">
                        <div className="flex-1 h-1.5 bg-[#1d3538]/10 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(checkedInStageIds.length / destData.stages.length) * 100}%` }} />
                        </div>
                        <span>{checkedInStageIds.length}/{destData.stages.length}</span>
                      </div>
                    )}
                    
                    {/* Nút cam CTA — mục 3.2 */}
                    <button
                      onClick={toggleViewMode}
                      className="w-full rounded-xl bg-[#e8622c] px-5 py-3 text-sm font-black text-white border-[3px] border-[#1d3538] shadow-[3px_3px_0_#1d3538] active:translate-y-[2px] active:shadow-[1px_1px_0_#1d3538] transition-all hover:brightness-110 flex items-center justify-center gap-2"
                    >
                      Bắt đầu khám phá
                      <span className="text-lg">→</span>
                    </button>

                    {/* Gợi ý thao tác */}
                    <p className="text-[10px] text-[#1d3538]/40 text-center">
                      Kéo để xoay · Cuộn / chụm để phóng to · Chạm nhãn để chọn điểm
                    </p>
                  </div>
                </div>

                {/* Spacer for right side (planet lệch phải) */}
                <div className="flex-1" />
              </>
            )}
            
            {viewMode === "walk" && (
              <>
                {/* Mobile Virtual Joystick — Bottom Left */}
                <div className="absolute left-6 bottom-6 z-20 pointer-events-auto sm:hidden select-none">
                  <div
                    ref={joystickBaseRef}
                    onTouchStart={handleJoystickTouchStart}
                    onTouchMove={handleJoystickTouchMove}
                    onTouchEnd={handleJoystickTouchEnd}
                    onTouchCancel={handleJoystickTouchEnd}
                    className="w-28 h-28 rounded-full bg-slate-900/50 border-2 border-white/40 backdrop-blur-md relative flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                    style={{ touchAction: "none" }}
                  >
                    {/* Ring indicator */}
                    <div className="w-16 h-16 rounded-full border border-white/20 absolute pointer-events-none" />
                    {/* Center stick */}
                    <div
                      className="w-12 h-12 rounded-full bg-linear-to-tr from-amber-400 to-orange-500 border-2 border-white shadow-md flex items-center justify-center text-sm font-black text-slate-900 transition-all pointer-events-none"
                      style={{
                        transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                      }}
                    >
                      🕹️
                    </div>
                  </div>
                </div>

                {/* Walk Hint */}
                <div className="w-full flex justify-center pb-2" style={{
                  opacity: walkHintVisible && !isJoystickDragging ? 1 : 0,
                  transition: 'opacity 1.5s ease-out',
                  pointerEvents: walkHintVisible ? 'auto' : 'none',
                }}>
                  <div className="bg-[#1d3538]/75 text-[#f8f3ea] px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm text-center max-w-[90vw]">
                    <span className="hidden sm:inline">
                      WASD / click để đi · Kéo chuột để xoay · Cuộn thu phóng · Shift chạy · M bản đồ · E tương tác
                    </span>
                    <span className="sm:hidden">
                      Dùng cần gạt ảo bên trái để đi · Vuốt màn hình để xoay góc nhìn
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          
        </div>
      )}

      {/* ========== GALLERY & DIALOGUE MODAL ========== */}
      {photoStage && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1d3538]/75 backdrop-blur-sm p-4">
          <div className="gallery-card w-full max-w-5xl max-h-[92vh] bg-[#f8f3ea] rounded-3xl border-[3px] border-[#1d3538] shadow-[8px_8px_0_rgba(29,53,56,0.3)] flex flex-col md:flex-row overflow-hidden pointer-events-auto">
            
            {/* Photo Stage (Left Side) */}
            <div className="flex-1 relative bg-[#e8e2d6] flex items-center justify-center p-6 md:p-8 min-h-[260px] md:min-h-[380px]">
              {/* Polaroid Frame */}
              <div className="relative max-w-full max-h-full" style={{ transform: 'rotate(-2deg)' }}>
                <div className="bg-white p-3 pb-12 shadow-xl rounded-sm" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.1)' }}>
                  <div className="w-full max-w-[460px] aspect-[4/3] bg-slate-200 overflow-hidden relative">
                    {photoStage.photos && photoStage.photos.length > 0 && photoStage.photos[0] !== '1' ? (
                      <img 
                        src={`/${photoStage.photos[0]}`} 
                        alt={photoStage.name.vi}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600"><svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-teal-100 to-amber-100 text-[#1d3538] p-4 text-center">
                        <div className="text-5xl mb-2">🏛️</div>
                        <span className="font-black text-sm">{photoStage.name.vi}</span>
                        <span className="text-xs text-slate-500 font-bold mt-1">{photoStage.subtitle.vi}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="font-black text-xs text-[#1d3538] tracking-wider uppercase">{photoStage.name.en}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Info & Dialogue Sidebar (Right Side) */}
            <aside className="w-full md:w-[440px] border-t-[3px] md:border-t-0 md:border-l-[3px] border-[#1d3538] flex flex-col max-h-[55vh] md:max-h-[92vh] bg-[#f8f3ea]">
              {/* Top Navigation & Close Button */}
              <div className="p-3.5 border-b-2 border-[#1d3538]/15 flex items-center justify-between gap-2 shrink-0 bg-[#eee8dc]">
                <div className="flex items-center gap-1.5">
                  {photoStage.dialogueQuest && (
                    <button
                      type="button"
                      onClick={() => setGalleryTab("dialogue")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        galleryTab === "dialogue"
                          ? "bg-[#1d3538] text-[#f8f3ea] shadow-xs"
                          : "bg-white/60 text-[#1d3538] hover:bg-white"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hội thoại (+25 XP)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setGalleryTab("photo")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      galleryTab === "photo"
                        ? "bg-[#1d3538] text-[#f8f3ea] shadow-xs"
                        : "bg-white/60 text-[#1d3538] hover:bg-white"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Di tích & Ảnh</span>
                  </button>
                </div>

                <button 
                  onClick={closePoiPanel} 
                  className="w-8 h-8 rounded-full bg-white border-2 border-[#1d3538] flex items-center justify-center hover:bg-rose-50 transition-colors shrink-0 shadow-xs"
                >
                  <X className="w-4 h-4 text-[#1d3538]" strokeWidth={3} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {galleryTab === "dialogue" && photoStage.dialogueQuest ? (
                  /* ── TAB 1: ENGLISH DIALOGUE QUEST ── */
                  <div className="space-y-4">
                    {/* NPC Banner */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border-2 border-[#1d3538]/20 shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl border-2 border-amber-300 shrink-0">
                        {photoStage.dialogueQuest.npcAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[#1d3538] truncate">
                          {photoStage.dialogueQuest.npcName}
                        </div>
                        <div className="text-[11px] font-bold text-amber-700 truncate">
                          {photoStage.dialogueQuest.npcRole}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakEnglish(photoStage.dialogueQuest!.npcPromptEn)}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-transform active:scale-90"
                        title="Nghe phát âm tiếng Anh"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* NPC Speech Balloon */}
                    <div className="relative bg-white rounded-2xl p-4 border-2 border-amber-400 shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed">
                          "{photoStage.dialogueQuest.npcPromptEn}"
                        </p>
                      </div>

                      {showViPrompt && (
                        <p className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 animate-fadeIn">
                          💡 {photoStage.dialogueQuest.npcPromptVi}
                        </p>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setShowViPrompt(!showViPrompt)}
                          className="text-[11px] font-black text-amber-600 hover:text-amber-800 transition-colors"
                        >
                          {showViPrompt ? "Ẩn dịch nghĩa" : "Xem dịch tiếng Việt →"}
                        </button>
                      </div>
                    </div>

                    {/* Target Vocabulary Chips */}
                    {photoStage.dialogueQuest.targetVocab && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                          Từ vựng trọng tâm (Ghi vào SRS):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {photoStage.dialogueQuest.targetVocab.map((v, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => speakEnglish(v.word)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                            >
                              <Volume2 className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{v.word}</span>
                              <span className="text-[10px] text-amber-700/80 font-normal">({v.meaningVi})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Multiple Choice Options */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-black text-slate-700">
                        Chọn câu trả lời phù hợp nhất:
                      </div>
                      {photoStage.dialogueQuest.options.map((opt) => {
                        const isSelected = selectedDialogueOptId === opt.id;
                        let itemClass = "bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400";
                        if (isSelected && !dialogueSubmitted) {
                          itemClass = "bg-amber-50 border-2 border-amber-500 text-amber-950 font-black shadow-xs";
                        } else if (dialogueSubmitted) {
                          if (opt.isCorrect) {
                            itemClass = "bg-emerald-50 border-2 border-emerald-500 text-emerald-950 font-black";
                          } else if (isSelected && !opt.isCorrect) {
                            itemClass = "bg-rose-50 border-2 border-rose-500 text-rose-950";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={dialogueSubmitted && dialogueCorrect === true}
                            onClick={() => {
                              setSelectedDialogueOptId(opt.id);
                              speakEnglish(opt.textEn);
                            }}
                            className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer ${itemClass}`}
                          >
                            <div className="text-xs font-bold leading-snug">{opt.textEn}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{opt.textVi}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback result */}
                    {dialogueSubmitted && (
                      <div className={`p-3.5 rounded-2xl text-xs font-bold border-2 animate-scaleUp ${
                        dialogueCorrect
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                          : "bg-rose-50 border-rose-400 text-rose-950"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {dialogueCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-black text-sm">Chính xác! +25 XP 🎉</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                              <span className="font-black text-sm">Chưa đúng, thử lại nhé! 🐢</span>
                            </>
                          )}
                        </div>
                        <p className="font-medium text-[11px] opacity-90 leading-relaxed">
                          {photoStage.dialogueQuest.options.find(o => o.id === selectedDialogueOptId)?.feedbackVi}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── TAB 2: FACTS & PHOTO ARCHIVE ── */
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-widest text-teal-700">
                      Chặng {photoStage.index} / {destData?.stages.length || 6}
                    </div>
                    <h2 className="text-2xl font-black text-[#1d3538] leading-tight">
                      {photoStage.name.vi}
                    </h2>
                    {photoStage.subtitle.vi.toLowerCase() !== photoStage.name.vi.toLowerCase() && (
                      <p className="text-sm font-bold text-slate-500">{photoStage.subtitle.vi}</p>
                    )}
                    {photoStage.facts && photoStage.facts.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {photoStage.facts.map((fact, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
                            <p className="text-xs text-[#1d3538] leading-relaxed font-medium">{fact.text}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{fact.source}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t-2 border-[#1d3538]/15 bg-white shrink-0 space-y-2.5">
                {galleryTab === "dialogue" && photoStage.dialogueQuest ? (
                  <>
                    {!dialogueSubmitted || !dialogueCorrect ? (
                      <button
                        type="button"
                        disabled={!selectedDialogueOptId}
                        onClick={handleDialogueSubmit}
                        className="w-full py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-md text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>GỬI CÂU TRẢ LỜI & CHECK-IN (+25 XP)</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-center text-xs font-black">
                        ✓ ĐÃ HOÀN THÀNH ĐỐI THOẠI & CHECK-IN
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isPhotoStageCheckedIn ? (
                      <div className="text-center py-1.5 text-teal-700 font-black text-xs uppercase tracking-wider border-2 border-teal-600 rounded-full">
                        ✓ Đã khám phá địa danh
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={confirmCheckIn} 
                        className="w-full rounded-2xl bg-[#d8452f] px-4 py-3 text-xs font-black text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                      >
                        Check-in địa điểm (+{photoStage.checkinXp || 15} XP)
                      </button>
                    )}
                  </>
                )}

                <button 
                  type="button" 
                  onClick={closePoiPanel} 
                  className="w-full rounded-xl py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors text-center cursor-pointer"
                >
                  Tiếp tục đi bộ khám phá
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ========== JOURNAL SIDEBAR (Nhật ký hành trình - like reference) ========== */}
      {journalOpen && destData && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1d3538]/30 pointer-events-auto" onClick={() => setJournalOpen(false)} />
          
          {/* Sidebar */}
          <aside className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#f8f3ea] border-l-[3px] border-[#1d3538] shadow-[-6px_0_20px_rgba(0,0,0,0.15)] pointer-events-auto flex flex-col overflow-hidden" style={{ animation: 'slideInRight 0.3s ease-out' }}>
            {/* Header */}
            <div className="p-5 pb-3 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-teal-700 mb-0.5">Nhật ký hành trình</div>
                <h3 className="text-xl font-black text-[#1d3538]">{destData.name.vi}</h3>
              </div>
              <button onClick={() => setJournalOpen(false)} className="w-8 h-8 rounded-full border-2 border-[#1d3538] flex items-center justify-center hover:bg-white transition-colors shrink-0">
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-5 pb-4 shrink-0">
              <div className="h-2 bg-[#1d3538]/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(checkedInStageIds.length / (destData.stages.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Stage List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <ol className="space-y-2">
                {destData.stages.map((stage) => {
                  const isChecked = checkedInStageIds.includes(stage.id);
                  return (
                    <li 
                      key={stage.id}
                      className={`rounded-xl border-2 p-3 flex gap-3 items-center cursor-pointer transition-all hover:shadow-md ${
                        isChecked 
                          ? 'border-teal-400 bg-white shadow-sm' 
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                      onClick={() => {
                        setJournalOpen(false);
                        setViewMode("walk");
                        worldRef.current?.goTo(stage.id);
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                        {stage.photos && stage.photos.length > 0 && stage.photos[0] !== '1' ? (
                          <img 
                            src={`/${stage.photos[0]}`} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                          Chặng {stage.index}
                        </div>
                        <div className="font-black text-[#1d3538] text-sm leading-tight truncate">{stage.name.vi}</div>
                        {stage.subtitle.vi.toLowerCase() !== stage.name.vi.toLowerCase() && (
                          <div className="text-xs text-slate-500 truncate">{stage.subtitle.vi}</div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-black text-sm">?</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 text-center shrink-0">
              <p className="text-xs text-slate-500">Chạm vào một nơi để bay tới đó.</p>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        .btn-ico-hud {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 2.5px solid #1d3538;
          box-shadow: 3px 3px 0 #1d3538;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          background: #f8f3ea;
          color: #1d3538;
        }
        .btn-ico-hud:hover {
          transform: translateY(1px);
          box-shadow: 2px 2px 0 #1d3538;
        }
        .btn-ico-hud:active {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0 #1d3538;
        }
        .btn-ico-hud.bg-\\[\\#d8452f\\] {
          background: #d8452f;
          color: white;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .gallery-card {
          animation: galleryIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes galleryIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

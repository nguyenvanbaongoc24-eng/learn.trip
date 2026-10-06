import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Map as MapIcon, BookOpen, Music, Camera, MapPin, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { createWorld, GlobeLabelScreenPosition, World, WorldPerf } from "@/world";
import { getDestination } from "@/world/config/registry";
import { StageDef } from "@/world/config/destinations";

import { useGame } from "@/context/GameContext";

interface Explore3DModalProps {
  isOpen: boolean;
  initialLocationId?: string;
  onClose: () => void;
  checkedInPoiIds: string[];
  onCheckIn: (destinationId: string, poiId: string) => void;
}

export function Explore3DModal({ isOpen, initialLocationId, onClose, checkedInPoiIds, onCheckIn }: Explore3DModalProps) {
  const { locations } = useGame();
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
  const [perfStats, setPerfStats] = useState<WorldPerf | null>(null);
  const [showPerf, setShowPerf] = useState(false);
  const globeLabelRefs = useRef(new Map<string, HTMLButtonElement>());
  const checkedInStageIds = useMemo(() => checkedInPoiIds
    .filter((id) => id.startsWith(`${locationIdToLoad}:`))
    .map((id) => id.slice(locationIdToLoad.length + 1)), [checkedInPoiIds, locationIdToLoad]);
  const checkedInStageIdsRef = useRef(checkedInStageIds);

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
      if (worldRef.current) {
        worldRef.current.dispose();
        worldRef.current = null;
      }
    };
  }, [isOpen, locationIdToLoad]);

  const toggleViewMode = () => {
    const newMode = viewMode === "walk" ? "overview" : "walk";
    setViewMode(newMode);
    worldRef.current?.setMode(newMode);
    // Reset walk hint timer when entering walk mode (mục 3.2: tự mờ sau 8s)
    if (newMode === 'walk') {
      setWalkHintVisible(true);
    }
  };

  // Walk hint auto-fade after 8 seconds (mục 3.2)
  useEffect(() => {
    if (viewMode !== 'walk' || !walkHintVisible) return;
    const timer = setTimeout(() => setWalkHintVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [viewMode, walkHintVisible]);

  const closePoiPanel = () => {
    setPhotoPoiId(null);
    worldRef.current?.setPaused(false);
  };

  const confirmCheckIn = () => {
    if (!photoPoiId) return;
    onCheckIn(locationIdToLoad, photoPoiId);
    closePoiPanel();
  };

  const photoStage = photoPoiId
    ? destData?.stages.find((stage) => stage.id === photoPoiId) || null
    : null;
  const isPhotoStageCheckedIn = photoPoiId ? checkedInStageIds.includes(photoPoiId) : false;

  if (!isOpen) return null;

  return (
    <div key={locationIdToLoad} className="fixed inset-0 z-50 flex flex-col font-nunito bg-slate-900">
      {/* Grain + Vignette Overlay (matching daokyuc.vercel.app) */}
      <div className="fixed inset-0 pointer-events-none z-[999]" style={{
        background: `radial-gradient(ellipse at center, transparent 55%, rgba(20, 50, 52, 0.22) 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.12,
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

                  <button className="btn-ico-hud" title="Âm thanh">
                    <Music className="w-5 h-5" strokeWidth={2.5} />
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

          {/* Place Title (Bottom Left) */}
          <div className="pointer-events-none px-6 pb-2">
            {viewMode === "walk" && currentStage && (
              <div className="mb-2 max-w-[calc(100vw-3rem)] sm:max-w-[60vw]">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#f8f3ea] leading-tight break-words" style={{ 
                  textShadow: '0 4px 8px rgba(29,53,56,0.6), 0 2px 4px rgba(29,53,56,0.4)',
                  WebkitTextStroke: '2px #1d3538' 
                }}>
                  {currentStage.name.vi}
                </h1>
                {currentStage.subtitle.vi.toLowerCase() !== currentStage.name.vi.toLowerCase() && (
                  <p className="text-xl md:text-2xl font-bold text-[#f8f3ea] mt-1" style={{ 
                    textShadow: '0 2px 4px rgba(29,53,56,0.5)',
                    WebkitTextStroke: '0.5px #1d3538' 
                  }}>
                    {currentStage.subtitle.vi}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* "Xem ảnh [E]" Prompt (like reference site) */}
          {canInteract && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 pointer-events-none">
              <div className="bg-[#f8f3ea] text-[#1d3538] px-5 py-3 rounded-full font-bold border-[2.5px] border-[#1d3538] shadow-[3px_3px_0_#1d3538] flex items-center gap-2.5 animate-bounce">
                 <Camera className="w-4 h-4" strokeWidth={2.5} />
                 <span>Xem ảnh</span>
                 <kbd className="bg-[#1d3538] text-[#f8f3ea] px-2 py-0.5 rounded-md font-black text-xs">E</kbd>
              </div>
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
              <div className="w-full flex justify-center" style={{
                opacity: walkHintVisible ? 1 : 0,
                transition: 'opacity 1.5s ease-out',
                pointerEvents: walkHintVisible ? 'auto' : 'none',
              }}>
                <div className="bg-[#1d3538]/60 text-[#f8f3ea]/80 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                  WASD / click để đi · Kéo chuột để xoay · Cuộn để thu phóng · Shift chạy · M bản đồ · E xem ảnh
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* ========== GALLERY MODAL (Photo Viewer like reference) ========== */}
      {photoStage && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1d3538]/70 backdrop-blur-sm p-4">
          <div className="gallery-card w-full max-w-5xl max-h-[90vh] bg-[#f8f3ea] rounded-3xl border-[3px] border-[#1d3538] shadow-[8px_8px_0_rgba(29,53,56,0.3)] flex flex-col md:flex-row overflow-hidden pointer-events-auto">
            
            {/* Photo Stage (Left Side) */}
            <div className="flex-1 relative bg-[#e8e2d6] flex items-center justify-center p-6 md:p-10 min-h-[300px]">
              {/* Polaroid Frame */}
              <div className="relative max-w-full max-h-full" style={{ transform: 'rotate(-2deg)' }}>
                <div className="bg-white p-3 pb-14 shadow-xl rounded-sm" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.1)' }}>
                  <div className="w-full max-w-[500px] aspect-[4/3] bg-slate-200 overflow-hidden relative">
                    {photoStage.photos && photoStage.photos.length > 0 ? (
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600">
                        <Camera className="w-16 h-16" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Arrows (like reference) */}
              <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 border-2 border-[#1d3538]/20 flex items-center justify-center hover:bg-white transition-colors shadow-md" disabled>
                <ChevronLeft className="w-5 h-5 text-[#1d3538]/40" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 border-2 border-[#1d3538]/20 flex items-center justify-center hover:bg-white transition-colors shadow-md" disabled>
                <ChevronRight className="w-5 h-5 text-[#1d3538]/40" />
              </button>
            </div>
            
            {/* Info Sidebar (Right Side - like reference) */}
            <aside className="w-full md:w-[340px] border-t-[3px] md:border-t-0 md:border-l-[3px] border-[#1d3538] flex flex-col max-h-[50vh] md:max-h-[90vh]">
              {/* Close Button */}
              <button 
                onClick={closePoiPanel} 
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#f8f3ea] border-2 border-[#1d3538] flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>

              <div className="p-5 flex-1 overflow-y-auto">
                {/* Chapter Badge */}
                <div className="text-xs font-black uppercase tracking-widest text-teal-700 mb-1">
                  Chặng {photoStage.index} / {destData?.stages.length || 6}
                </div>
                
                {/* Title */}
                <h2 className="text-2xl font-black text-[#1d3538] leading-tight">
                  {photoStage.name.vi}
                </h2>
                {photoStage.subtitle.vi.toLowerCase() !== photoStage.name.vi.toLowerCase() && (
                  <p className="text-sm font-bold text-slate-500 mt-1">{photoStage.subtitle.vi}</p>
                )}
                
                {/* Facts */}
                {photoStage.facts && photoStage.facts.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {photoStage.facts.map((fact, idx) => (
                      <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3">
                        <p className="text-sm text-[#1d3538] leading-relaxed">{fact.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wider font-bold">{fact.source}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stamp + Button Footer */}
              <div className="p-5 border-t border-slate-200 bg-white/50 shrink-0 space-y-3">
                {isPhotoStageCheckedIn && (
                  <div className="text-center py-2">
                    <span className="inline-block text-teal-700 font-black text-sm uppercase tracking-[0.25em] border-2 border-teal-600 px-4 py-1.5 rounded-full" style={{ transform: 'rotate(-3deg)' }}>
                      ✓ Đã khám phá
                    </span>
                  </div>
                )}
                {!isPhotoStageCheckedIn && (
                  <button 
                    type="button" 
                    onClick={confirmCheckIn} 
                    className="w-full rounded-xl bg-[#d8452f] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_#8a2a1a] active:translate-y-[2px] active:shadow-[1px_1px_0_#8a2a1a] transition-all hover:brightness-110"
                  >
                    Check-in địa điểm (+{photoStage.checkinXp || 15} XP)
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={closePoiPanel} 
                  className="w-full rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors text-center"
                >
                  Quay lại khám phá
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

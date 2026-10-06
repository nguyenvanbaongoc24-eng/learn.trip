"use client";

import React, { useState, useEffect, useRef } from "react";
import { MediaAsset, LocalizedText } from "@/types/content";
import {
  loadMediaAssets,
  saveMediaAssets,
  compressImageToWebP,
  freeStockImages,
  FreeStockImage,
} from "@/utils/mediaStorage";
import {
  Image as ImageIcon,
  Music,
  UploadCloud,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  Volume2,
  Globe,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Camera,
} from "lucide-react";

interface MediaManagerViewProps {
  allLocations?: any[];
  onSelectMedia?: (asset: MediaAsset) => void;
  isSelectorMode?: boolean;
}

export function MediaManagerView({
  allLocations = [],
  onSelectMedia,
  isSelectorMode = false,
}: MediaManagerViewProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLandmarkFilter, setSelectedLandmarkFilter] = useState("all");
  const [selectedMimeFilter, setSelectedMimeFilter] = useState<"all" | "image" | "audio">("all");

  // Modal States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFile, setPendingFile] = useState<{
    url: string;
    thumbnailUrl: string;
    size: number;
    mimeType: string;
    name: string;
  } | null>(null);

  const [altVi, setAltVi] = useState("");
  const [altEn, setAltEn] = useState("");
  const [source, setSource] = useState("Tự tải lên (Self Upload)");
  const [author, setAuthor] = useState("Content Creator");
  const [license, setLicense] = useState("Bản quyền sở hữu Learn.Trip");
  const [landmarkId, setLandmarkId] = useState("hoanKiem");

  // Selected Detail Modal
  const [activeDetailAsset, setActiveDetailAsset] = useState<MediaAsset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Free Stock Modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAssets(loadMediaAssets());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle File Selection (Upload + Compression)
  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Check size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng file vượt quá giới hạn 5MB! Vui lòng chọn file nhỏ hơn.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    try {
      if (file.type.startsWith("image/")) {
        setUploadProgress(50);
        const result = await compressImageToWebP(file);
        setUploadProgress(90);
        setPendingFile({
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          size: result.size,
          mimeType: "image/webp",
          name: file.name,
        });
        setAltVi(file.name.replace(/\.[^/.]+$/, ""));
        setAltEn(file.name.replace(/\.[^/.]+$/, ""));
      } else if (file.type.startsWith("audio/")) {
        setUploadProgress(75);
        const reader = new FileReader();
        reader.onload = (e) => {
          const audioUrl = e.target?.result as string;
          setPendingFile({
            url: audioUrl,
            thumbnailUrl: audioUrl,
            size: file.size,
            mimeType: file.type || "audio/mpeg",
            name: file.name,
          });
          setAltVi(`Âm thanh phát âm - ${file.name}`);
          setAltEn(`Pronunciation audio - ${file.name}`);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Định dạng file không hỗ trợ! Chỉ hỗ trợ ảnh (JPG/PNG/WebP) và Audio (MP3/M4A/WAV).");
      }
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi xử lý nén file!");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Confirm Metadata Save
  const handleSavePendingAsset = () => {
    if (!pendingFile) return;

    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      url: pendingFile.url,
      thumbnailUrl: pendingFile.thumbnailUrl,
      alt: { vi: altVi || "Ảnh nội dung", en: altEn || "Content image" },
      tags: [landmarkId, pendingFile.mimeType.split("/")[0]],
      source: source || "Tự tải lên",
      author: author || "Learntrip Creator",
      license: license || "Standard License",
      fileSize: pendingFile.size,
      mimeType: pendingFile.mimeType,
      uploadedBy: "Admin / Creator",
      landmarkId: landmarkId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    saveMediaAssets(updated);
    setPendingFile(null);
    showToast("Đã thêm file thành công vào Thư viện Media!");
  };

  // Import Stock Image directly
  const handleImportStockImage = (stock: FreeStockImage) => {
    const newAsset: MediaAsset = {
      id: `media-stock-${Date.now()}`,
      url: stock.url,
      thumbnailUrl: stock.thumbnailUrl,
      alt: { vi: stock.title, en: stock.title },
      tags: stock.tags,
      source: stock.source,
      author: stock.author,
      license: stock.license,
      fileSize: 1200000,
      mimeType: "image/jpeg",
      uploadedBy: "Admin (Import từ " + stock.source + ")",
      landmarkId: "hoanKiem",
      createdAt: new Date().toISOString(),
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    saveMediaAssets(updated);
    setShowStockModal(false);
    showToast(`Đã thêm ảnh bản quyền miễn phí từ ${stock.source}!`);
  };

  // Delete Asset
  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    setAssets(updated);
    saveMediaAssets(updated);
    setDeleteConfirmId(null);
    setActiveDetailAsset(null);
    showToast("Đã xóa file khỏi Thư viện Media.");
  };

  // Filter Assets
  const filteredAssets = assets.filter((item) => {
    const matchesSearch =
      item.alt.vi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLandmark =
      selectedLandmarkFilter === "all" || item.landmarkId === selectedLandmarkFilter;

    const matchesType =
      selectedMimeFilter === "all" ||
      (selectedMimeFilter === "image" && item.mimeType.startsWith("image/")) ||
      (selectedMimeFilter === "audio" && item.mimeType.startsWith("audio/"));

    return matchesSearch && matchesLandmark && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Quick Actions */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white">
                Bộ quản lý Truyền thông (Media Manager)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tải ảnh/audio từ thiết bị (tự nén WebP) hoặc chèn ảnh miễn phí bản quyền từ Wikimedia / Unsplash.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowStockModal(true)}
              className="px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tìm ảnh miễn phí (Unsplash/Wikimedia)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Tải file từ máy</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="sm:hidden px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <Camera className="w-4 h-4" />
              <span>Chụp ảnh</span>
            </button>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,audio/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileChange(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-amber-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
        >
          <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-amber-400 mx-auto transition-colors" />
          <div className="text-xs font-bold text-slate-300">
            Kéo thả file ảnh (JPG, PNG, WebP) hoặc Audio (MP3, WAV) vào đây
          </div>
          <div className="text-[11px] text-slate-500">
            Dung lượng tối đa ≤ 5MB per file • Tự động nén WebP & tạo thumbnail 200x200
          </div>
        </div>
      </div>

      {/* Progress Bar during Upload/Compression */}
      {isUploading && (
        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Đang xử lý nén WebP và tạo Thumbnail...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pending Asset Metadata Form Modal */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-slate-950 border border-amber-500/50 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Nhập Thông tin & Bản quyền Media</span>
              </h3>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview thumbnail */}
            <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-2xl border border-slate-800">
              {pendingFile.mimeType.startsWith("image/") ? (
                <img
                  src={pendingFile.thumbnailUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400">
                  <Volume2 className="w-8 h-8" />
                </div>
              )}
              <div className="text-xs">
                <div className="font-bold text-white truncate max-w-[200px]">
                  {pendingFile.name}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Kích thước: {(pendingFile.size / 1024).toFixed(1)} KB • Định dạng: {pendingFile.mimeType}
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mô tả / Alt Text (Tiếng Việt) *bắt buộc*:
                </label>
                <input
                  type="text"
                  required
                  value={altVi}
                  onChange={(e) => setAltVi(e.target.value)}
                  placeholder="VD: Cầu Thê Húc màu đỏ uốn cong dẫn vào đền Ngọc Sơn"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Alt Text (English):
                </label>
                <input
                  type="text"
                  value={altEn}
                  onChange={(e) => setAltEn(e.target.value)}
                  placeholder="VD: Red The Huc Bridge leading into Ngoc Son Temple"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nguồn / Tác giả:
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Giấy phép (License):
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-base sm:text-xs text-white min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Gắn điểm tham quan (Landmark Tag):
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
            </div>

            <button
              type="button"
              onClick={handleSavePendingAsset}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Lưu vào Thư viện Media</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Search & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Tìm kiếm media theo tên, tag, alt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-base sm:text-xs text-white focus:outline-hidden focus:border-amber-500 min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Landmark Filter */}
          <select
            value={selectedLandmarkFilter}
            onChange={(e) => setSelectedLandmarkFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 min-h-[40px]"
          >
            <option value="all">Tất cả điểm tham quan</option>
            <option value="hoanKiem">Hồ Hoàn Kiếm</option>
            <option value="phoCo">36 Phố Phường</option>
            <option value="vanMieu">Văn Miếu</option>
            <option value="amThuc">Ẩm Thực Phố Cổ</option>
            <option value="longBien">Cầu Long Biên</option>
            <option value="motCot">Chùa Một Cột</option>
          </select>

          {/* Type Filter */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedMimeFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMimeFilter === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
            >
              Tất cả ({assets.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedMimeFilter("image")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMimeFilter === "image" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
            >
              Ảnh
            </button>
            <button
              type="button"
              onClick={() => setSelectedMimeFilter("audio")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMimeFilter === "audio" ? "bg-amber-500 text-slate-950" : "text-slate-400"
              }`}
            >
              Audio
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid: 2 columns on Mobile (<640px), 4-6 columns on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => {
              if (isSelectorMode && onSelectMedia) {
                onSelectMedia(asset);
              } else {
                setActiveDetailAsset(asset);
              }
            }}
            className="group relative bg-slate-950 border border-slate-800 hover:border-amber-500/70 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
          >
            {/* Image / Audio Preview Container */}
            <div className="aspect-square bg-slate-900 relative overflow-hidden flex items-center justify-center">
              {asset.mimeType.startsWith("image/") ? (
                <img
                  src={asset.thumbnailUrl || asset.url}
                  alt={asset.alt.vi}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-amber-400">
                  <Volume2 className="w-10 h-10 mb-1" />
                  <span className="text-[10px] text-slate-400 font-bold">Audio Track</span>
                </div>
              )}

              {/* License Badge */}
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs border border-slate-700/60 text-[9px] text-amber-300 font-extrabold truncate max-w-[90%]">
                {asset.source}
              </span>
            </div>

            {/* Asset Title / Meta Footer */}
            <div className="p-2.5 bg-slate-950 space-y-1 border-t border-slate-800/80">
              <div className="font-bold text-xs text-white truncate" title={asset.alt.vi}>
                {asset.alt.vi}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="uppercase font-bold text-amber-400">{asset.landmarkId}</span>
                <span>{(asset.fileSize / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 bg-slate-950 border border-slate-800 rounded-3xl text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="font-bold text-white text-sm">Chưa có file media nào trong danh mục này</div>
          <div className="text-xs text-slate-400">
            Bấm &ldquo;Tải file từ máy&rdquo; hoặc &ldquo;Tìm ảnh miễn phí&rdquo; để thêm ảnh/audio.
          </div>
        </div>
      )}

      {/* Free Royalty Stock Images Modal (Wikimedia Commons / Unsplash) */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-slate-950 border border-indigo-500/50 rounded-3xl p-6 max-w-4xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Kho ảnh Miễn Phí Bản Quyền (Wikimedia Commons & Unsplash)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tất cả hình ảnh hiển thị rõ ràng giấy phép sử dụng trước khi chèn vào bài học.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stock Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {freeStockImages.map((stock) => (
                <div
                  key={stock.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-3 p-3 flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden relative">
                    <img
                      src={stock.url}
                      alt={stock.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-950/90 border border-indigo-500/40 text-[10px] text-indigo-300 font-black">
                      {stock.source}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-white leading-snug">{stock.title}</h4>
                    <div className="text-[11px] text-slate-400">Tác giả: {stock.author}</div>
                    <div className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
                      📜 License: {stock.license}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleImportStockImage(stock)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chèn vào Thư viện Media</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail & Edit Modal */}
      {activeDetailAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white">
                Chi tiết tệp Truyền thông
              </h3>
              <button
                type="button"
                onClick={() => setActiveDetailAsset(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Display */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[200px]">
              {activeDetailAsset.mimeType.startsWith("image/") ? (
                <img
                  src={activeDetailAsset.url}
                  alt={activeDetailAsset.alt.vi}
                  className="max-h-[300px] object-contain rounded-xl"
                />
              ) : (
                <div className="w-full space-y-3 text-center">
                  <Volume2 className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                  <audio controls src={activeDetailAsset.url} className="w-full" />
                </div>
              )}
            </div>

            {/* Metadata Detail */}
            <div className="space-y-2 text-xs text-slate-300">
              <div><strong className="text-slate-400">Mô tả VI:</strong> {activeDetailAsset.alt.vi}</div>
              <div><strong className="text-slate-400">Mô tả EN:</strong> {activeDetailAsset.alt.en}</div>
              <div><strong className="text-slate-400">Nguồn:</strong> {activeDetailAsset.source} ({activeDetailAsset.license})</div>
              <div><strong className="text-slate-400">Tác giả:</strong> {activeDetailAsset.author}</div>
              <div><strong className="text-slate-400">Điểm tham quan:</strong> {activeDetailAsset.landmarkId}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeDetailAsset.url);
                  showToast("Đã sao chép đường dẫn URL!");
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Copy className="w-4 h-4" />
                <span>Sao chép URL</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(activeDetailAsset.id)}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer min-h-[40px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa file</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-slate-950 border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="font-extrabold text-base text-white">Xác nhận xóa tệp?</h4>
            <p className="text-xs text-slate-400">
              Cảnh báo: Nếu tệp này đang được gắn vào bài học hoặc câu hỏi, liên kết có thể bị gián đoạn.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer min-h-[44px]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAsset(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer min-h-[44px]"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

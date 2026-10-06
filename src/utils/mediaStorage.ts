import { MediaAsset, LocalizedText } from "@/types/content";

const MEDIA_STORAGE_KEY = "learntrip_media_library_v1";

// Default initial royalty-free Vietnam media assets (Wikimedia & Unsplash)
export const initialMediaAssets: MediaAsset[] = [
  {
    id: "media-hanoi-01",
    url: "content/photos/hanoi/hoankiem.jpg",
    thumbnailUrl: "content/photos/hanoi/hoankiem.jpg",
    alt: { vi: "Tháp Rùa Hồ Hoàn Kiếm Hà Nội", en: "Turtle Tower in Hoan Kiem Lake Hanoi" },
    tags: ["hanoi", "hoankiem", "landmark", "lake"],
    source: "Wikimedia Commons",
    author: "Nguyen Van A",
    license: "CC BY-SA 4.0",
    fileSize: 1048576,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "hoanKiem",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-hanoi-02",
    url: "content/photos/hanoi/36phophuong.jpg",
    thumbnailUrl: "content/photos/hanoi/36phophuong.jpg",
    alt: { vi: "Phố cổ Hà Nội 36 phố phường", en: "Hanoi Old Quarter 36 Streets" },
    tags: ["hanoi", "phoco", "oldquarter", "culture"],
    source: "Unsplash",
    author: "Tran Van B",
    license: "Unsplash License (Free)",
    fileSize: 1572864,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "phoCo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-hanoi-03",
    url: "content/photos/hanoi/vanmieu.jpg",
    thumbnailUrl: "content/photos/hanoi/vanmieu.jpg",
    alt: { vi: "Khuê Văn Các Văn Miếu Quốc Tử Giám", en: "Khue Van Cac Temple of Literature" },
    tags: ["hanoi", "vanmieu", "history", "education"],
    source: "Wikimedia Commons",
    author: "Le Van C",
    license: "CC BY 3.0",
    fileSize: 1258291,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "vanMieu",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-hanoi-04",
    url: "content/photos/hanoi/amthuc.jpg",
    thumbnailUrl: "content/photos/hanoi/amthuc.jpg",
    alt: { vi: "Phở bò Hà Nội & Cà phê trứng", en: "Hanoi Beef Pho & Egg Coffee" },
    tags: ["hanoi", "amthuc", "food", "pho"],
    source: "Unsplash",
    author: "Pham Van D",
    license: "Unsplash License (Free)",
    fileSize: 943718,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "amThuc",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-hanoi-05",
    url: "content/photos/hanoi/longbien.jpg",
    thumbnailUrl: "content/photos/hanoi/longbien.jpg",
    alt: { vi: "Cầu Long Biên lịch sử Hà Nội", en: "Historic Long Bien Bridge Hanoi" },
    tags: ["hanoi", "longbien", "bridge", "river"],
    source: "Wikimedia Commons",
    author: "Hoang Van E",
    license: "CC BY-SA 4.0",
    fileSize: 1887436,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "longBien",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-hanoi-06",
    url: "content/photos/hanoi/motcot.jpg",
    thumbnailUrl: "content/photos/hanoi/motcot.jpg",
    alt: { vi: "Chùa Một Cột đóa sen ngàn năm", en: "One Pillar Pagoda Hanoi" },
    tags: ["hanoi", "motcot", "temple", "pagoda"],
    source: "Wikimedia Commons",
    author: "Vu Van F",
    license: "CC BY 4.0",
    fileSize: 1363148,
    mimeType: "image/jpeg",
    uploadedBy: "Admin",
    landmarkId: "motCot",
    createdAt: new Date().toISOString(),
  }
];

// LocalStorage Helper for Media Library
export function loadMediaAssets(): MediaAsset[] {
  if (typeof window === "undefined") return initialMediaAssets;
  try {
    const data = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(initialMediaAssets));
      return initialMediaAssets;
    }
    return JSON.stringify(data) ? JSON.parse(data) : initialMediaAssets;
  } catch (e) {
    console.error("Error loading media library assets:", e);
    return initialMediaAssets;
  }
}

export function saveMediaAssets(assets: MediaAsset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(assets));
  } catch (e) {
    console.error("Error saving media library assets:", e);
  }
}

// Client-side image compression to WebP using Canvas API
export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<{ url: string; thumbnailUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        // Calculate main image canvas dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2d canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", quality);

        // Calculate thumbnail (200x200 square crop)
        const thumbCanvas = document.createElement("canvas");
        thumbCanvas.width = 200;
        thumbCanvas.height = 200;
        const thumbCtx = thumbCanvas.getContext("2d");

        if (thumbCtx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          thumbCtx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 200, 200);
        }

        const thumbUrl = thumbCanvas.toDataURL("image/webp", 0.7);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          url: dataUrl,
          thumbnailUrl: thumbUrl,
          size: approxBytes,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Free Stock Image Mock Provider (Wikimedia Commons & Unsplash)
export interface FreeStockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  author: string;
  source: "Wikimedia Commons" | "Unsplash";
  license: string;
  tags: string[];
}

export const freeStockImages: FreeStockImage[] = [
  {
    id: "stock-1",
    url: "content/photos/hanoi/hoankiem.jpg",
    thumbnailUrl: "content/photos/hanoi/hoankiem.jpg",
    title: "Hoan Kiem Lake Turtle Tower at Dawn",
    author: "Nguyen Thanh",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    tags: ["hanoi", "lake", "landmark"],
  },
  {
    id: "stock-2",
    url: "content/photos/hanoi/36phophuong.jpg",
    thumbnailUrl: "content/photos/hanoi/36phophuong.jpg",
    title: "Old Quarter Heritage Street",
    author: "Minh Duc",
    source: "Unsplash",
    license: "Unsplash Free License",
    tags: ["hanoi", "street", "culture"],
  },
  {
    id: "stock-3",
    url: "content/photos/hanoi/amthuc.jpg",
    thumbnailUrl: "content/photos/hanoi/amthuc.jpg",
    title: "Traditional Vietnamese Pho Beef Noodle Soup",
    author: "Bao Nam",
    source: "Unsplash",
    license: "Unsplash Free License",
    tags: ["food", "pho", "hanoi"],
  },
  {
    id: "stock-4",
    url: "content/photos/hanoi/vanmieu.jpg",
    thumbnailUrl: "content/photos/hanoi/vanmieu.jpg",
    title: "Khue Van Cac Pavilion Courtyard",
    author: "Quang Huy",
    source: "Wikimedia Commons",
    license: "CC BY 3.0",
    tags: ["hanoi", "temple", "history"],
  },
  {
    id: "stock-5",
    url: "content/photos/hanoi/longbien.jpg",
    thumbnailUrl: "content/photos/hanoi/longbien.jpg",
    title: "Long Bien Bridge Steel Girders Sunset",
    author: "Phuong Anh",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    tags: ["hanoi", "bridge", "sunset"],
  },
  {
    id: "stock-6",
    url: "content/photos/hanoi/motcot.jpg",
    thumbnailUrl: "content/photos/hanoi/motcot.jpg",
    title: "One Pillar Pagoda Lotus Pond",
    author: "Thanh Tung",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    tags: ["hanoi", "pagoda", "lotus"],
  },
];

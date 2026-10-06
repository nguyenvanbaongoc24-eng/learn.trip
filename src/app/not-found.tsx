import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl shadow-md mb-6 animate-bounce">
        🧭
      </div>
      <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
        404 — Lạc đường rồi!
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        Trang bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập vào khu vực này. Hãy quay về bản đồ khám phá nhé!
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 text-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ Learn.Trip</span>
      </Link>
    </div>
  );
}

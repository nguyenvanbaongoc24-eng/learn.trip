import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn.Trip Content Studio — Hệ thống Quản trị Nội dung",
  description: "CMS quản trị nội dung học tập, AI Content Studio, hàng đợi kiểm duyệt và xuất bản dành cho nhân sự Learn.Trip.",
};

export default function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      {children}
    </div>
  );
}

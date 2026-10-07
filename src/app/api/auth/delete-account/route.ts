import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { deleteUserAccount } from "@/lib/auth/users";
import { deleteUserProgress } from "@/lib/progress/store";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    // Do not allow deleting the root admin seeded account to prevent locking out the system
    if (sessionUser.email === "admin@learntrip.vn") {
      return NextResponse.json(
        { error: "Tài khoản Quản trị viên hệ thống gốc (admin@learntrip.vn) không được phép xóa." },
        { status: 403 }
      );
    }

    deleteUserProgress(sessionUser.id);
    deleteUserAccount(sessionUser.id);

    const response = NextResponse.json({
      success: true,
      message: "Tài khoản và toàn bộ dữ liệu tiến độ của bạn đã được xóa vĩnh viễn.",
    });

    // Clear session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}

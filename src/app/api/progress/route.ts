import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getUserProgress, resetUserProgress } from "@/lib/progress/store";

/**
 * GET /api/progress
 * Retrieve progress for the currently authenticated user.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await verifySessionToken(token);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "Chưa đăng nhập. Vui lòng đăng nhập để truy cập tiến độ đám mây." },
      { status: 401 }
    );
  }

  const progress = getUserProgress(sessionUser.id);
  return NextResponse.json({
    success: true,
    progress,
    userId: sessionUser.id,
  });
}

/**
 * DELETE /api/progress
 * Reset progress for the currently authenticated user.
 */
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await verifySessionToken(token);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "Chưa đăng nhập." },
      { status: 401 }
    );
  }

  const reset = resetUserProgress(sessionUser.id);
  return NextResponse.json({
    success: true,
    progress: reset,
    message: "Tiến độ đã được đặt lại về mặc định.",
  });
}

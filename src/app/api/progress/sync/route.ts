import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { saveUserProgress, getUserProgress } from "@/lib/progress/store";
import { UserProgress } from "@/types/content";

/**
 * POST /api/progress/sync
 * Synchronize local progress with server database.
 * Strict data ownership: userId is extracted ONLY from the authenticated session cookie.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sessionUser = await verifySessionToken(token);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "Chưa đăng nhập. Không thể đồng bộ tiến độ lên đám mây." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const clientProgress = (body.progress || body) as Partial<UserProgress>;

    // Basic sanity checks
    if (typeof clientProgress.xp === "number" && clientProgress.xp < 0) {
      return NextResponse.json({ error: "Dữ liệu XP không hợp lệ." }, { status: 400 });
    }

    if (typeof clientProgress.streak === "number" && clientProgress.streak < 0) {
      return NextResponse.json({ error: "Dữ liệu chuỗi ngày không hợp lệ." }, { status: 400 });
    }

    // Save and merge cleanly into server-side store
    const mergedProgress = saveUserProgress(sessionUser.id, clientProgress);

    return NextResponse.json({
      success: true,
      progress: mergedProgress,
      userId: sessionUser.id,
      syncedAt: new Date().toISOString(),
      message: "Đồng bộ tiến độ lên đám mây thành công!",
    });
  } catch {
    return NextResponse.json({ error: "Lỗi giải mã dữ liệu tiến độ." }, { status: 400 });
  }
}

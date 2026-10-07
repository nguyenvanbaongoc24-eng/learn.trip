import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getUserProgress } from "@/lib/progress/store";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    const user = findUserById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const progress = getUserProgress(sessionUser.id);

    const exportPayload = {
      app: "Learn.Trip",
      version: "2.0.0",
      exportDate: new Date().toISOString(),
      compliance: "GDPR / Decree 13/2023/ND-CP Personal Data Protection",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        cefrLevel: user.cefrLevel || "A1",
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      learningProgress: {
        totalXP: progress.xp,
        currentStreak: progress.streak,
        lastActiveDate: progress.lastActiveDate,
        currentDestinationId: progress.currentDestinationId,
        unlockedLocations: progress.unlockedLocationIds,
        completedQuestsCount: progress.completedQuestIds.length,
        completedQuestIds: progress.completedQuestIds,
        completedLessonIds: progress.completedLessonIds,
        checkedInPoiIds: progress.checkedInPoiIds,
        collectedStamps: progress.collectedStamps,
        collectedBadges: progress.collectedBadges,
      },
    };

    const fileName = `learntrip-data-${user.id}-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}

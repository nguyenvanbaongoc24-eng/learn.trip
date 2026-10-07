import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getActiveSessions, revokeSession } from "@/lib/cms/sessions";
import { addAuditLog } from "@/lib/cms/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser || !isStaffRole(sessionUser.role)) {
      return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
    }

    const sessions = getActiveSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser || !isStaffRole(sessionUser.role)) {
      return NextResponse.json({ error: "Không có quyền thực hiện." }, { status: 403 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Thiếu ID phiên cần thu hồi." }, { status: 400 });
    }

    const ok = revokeSession(sessionId);
    if (!ok) {
      return NextResponse.json({ error: "Phiên đăng nhập không tồn tại hoặc đã hết hạn." }, { status: 404 });
    }

    addAuditLog({
      actorId: sessionUser.id,
      actorName: sessionUser.displayName,
      actorRole: sessionUser.role,
      action: "revoke_session",
      actionLabel: "Thu hồi phiên đăng nhập",
      targetType: "session",
      targetId: sessionId,
      details: `Thu hồi phiên ${sessionId} từ xa.`,
    });

    return NextResponse.json({ success: true, message: "Đã thu hồi phiên đăng nhập thành công." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}

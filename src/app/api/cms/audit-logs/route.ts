import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/roles";
import { getAuditLogs, addAuditLog } from "@/lib/cms/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionUser = await verifySessionToken(token);

    if (!sessionUser || !isStaffRole(sessionUser.role)) {
      return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
    }

    const logs = getAuditLogs(100);
    return NextResponse.json({ success: true, logs });
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
    const { action, actionLabel, targetType, targetId, details } = body;

    if (!action || !details) {
      return NextResponse.json({ error: "Thiếu thông tin nhật ký." }, { status: 400 });
    }

    const entry = addAuditLog({
      actorId: sessionUser.id,
      actorName: sessionUser.displayName,
      actorRole: sessionUser.role,
      action: action || "other",
      actionLabel: actionLabel || "Thao tác nội dung",
      targetType: targetType || "quest",
      targetId: targetId || "system",
      details,
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi máy chủ." }, { status: 500 });
  }
}
